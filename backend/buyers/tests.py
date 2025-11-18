from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from buyers.models import (
    BatchMarketInfo,
    BuyerProfile,
    BuyerRequirement,
    QualityCheckLog,
)
from buyers.serializers import BuyerRequirementSerializer
from buyers.services import create_quality_check, find_market_matches, get_marketplace_queryset
from suppliers.models import ProductBatch, QcRecord


MARKETPLACE_URL = "/api/buyer/marketplace/"
REQUIREMENTS_URL = "/api/buyer/requirements/"


class BuyerFeatureTests(APITestCase):
    maxDiff = None

    def setUp(self):
        self.user_model = get_user_model()
        self.supplier = self.user_model.objects.create_user(
            username="supplier",
            email="supplier@example.com",
            password="password123",
        )
        self.buyer = self._create_buyer("buyer@example.com")
        self.other_buyer = self._create_buyer("other@example.com")
        self.viewer = self.user_model.objects.create_user(
            username="viewer", email="viewer@example.com", password="password123"
        )
        self.staff = self.user_model.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="password123",
            is_staff=True,
        )

    def _create_buyer(self, email: str):
        user = self.user_model.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="password123",
        )
        BuyerProfile.objects.create(
            user=user,
            organization="Global Imports",
            country="US",
        )
        return user

    def _market_defaults(self):
        today = timezone.now().date()
        return {
            "supplier": self.supplier,
            "batch_code": f"BATCH-{timezone.now().timestamp()}",
            "species": "black tiger shrimp",
            "quantity": 800,
            "unit": "kg",
            "size_min_mm": Decimal("12.0"),
            "size_max_mm": Decimal("18.0"),
            "region": "North Sulawesi",
            "country_of_origin": "ID",
            "harvest_date": today - timedelta(days=3),
            "ready_date": today + timedelta(days=5),
            "destination_country": "JP",
            "price_per_unit": Decimal("5200.00"),
            "mercury": Decimal("0.4"),
            "cesium": Decimal("0.20"),
            "ecoli": Decimal("150"),
        }

    def _create_market_batch(
        self,
        *,
        allow_catalog: bool = True,
        qc_passed: bool = True,
        with_qc: bool = True,
        **overrides,
    ) -> BatchMarketInfo:
        data = {**self._market_defaults(), **overrides}
        batch = ProductBatch.objects.create(
            supplier=data["supplier"],
            batch_code=data["batch_code"],
            product_name=data["species"],
            description="Premium harvest",
            quantity=data["quantity"],
            unit=data["unit"],
            qc_status="brin_verified_pass" if qc_passed else "brin_verified_fail",
            is_allowed_for_catalog=allow_catalog and qc_passed,
            brin_response_payload={
                "passed": qc_passed,
                "results": {
                    "heavy_metal_ppm": float(data["mercury"]),
                    "cesium_ppm": float(data["cesium"]),
                    "ecoli_cfu": float(data["ecoli"]),
                },
            },
        )
        if with_qc:
            QcRecord.objects.create(
                batch=batch,
                passed=qc_passed,
                contamination_score=float(data["mercury"]),
                details=batch.brin_response_payload,
            )
        return BatchMarketInfo.objects.create(
            batch=batch,
            species=data["species"],
            size_min_mm=data["size_min_mm"],
            size_max_mm=data["size_max_mm"],
            region=data["region"],
            country_of_origin=data["country_of_origin"],
            harvest_date=data["harvest_date"],
            ready_date=data["ready_date"],
            destination_country=data["destination_country"],
            price_per_unit=data["price_per_unit"],
            contaminant_mercury_ppm=data["mercury"],
            contaminant_cesium_ppm=data["cesium"],
            contaminant_ecoli_cfu=data["ecoli"],
        )

    def _requirement_payload(self, **overrides):
        start = timezone.now().date()
        payload = {
            "commodity": "black tiger shrimp",
            "min_volume": 500,
            "max_volume": 1000,
            "allowed_contaminants": {
                "mercury": 0.6,
                "cesium": 0.3,
                "ecoli": 400,
            },
            "shipping_window_start": str(start),
            "shipping_window_end": str(start + timedelta(days=10)),
            "destination_country": "JP",
            "standards": ["EU", "FDA"],
            "notes": "Frozen shipment preferred",
        }
        return {**payload, **overrides}

    # ----------- Marketplace tests -----------

    def test_marketplace_lists_qc_passed_batches_with_quality_summary(self):
        first = self._create_market_batch(batch_code="SAFE-1")
        second = self._create_market_batch(
            batch_code="SAFE-2",
            species="vannamei shrimp",
            region="East Java",
            mercury=Decimal("0.2"),
        )
        # Should be ignored (not catalog eligible)
        self._create_market_batch(
            batch_code="BANNED-1",
            allow_catalog=False,
            qc_passed=False,
        )
        self.assertIn(first.batch.batch_code, str(first))
        self.assertIn("Global Imports", str(self.buyer.buyer_profile))

        response = self.client.get(MARKETPLACE_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertEqual(body["count"], 2)
        batch_codes = {item["batch_code"] for item in body["results"]}
        self.assertSetEqual(batch_codes, {"SAFE-1", "SAFE-2"})
        result_map = {item["batch_code"]: item for item in body["results"]}
        sample = result_map["SAFE-1"]
        self.assertIn("quality_summary", sample)
        self.assertEqual(sample["species"], first.species)
        self.assertEqual(sample["supplier"]["id"], first.batch.supplier_id)
        self.assertEqual(sample["size_range"]["min_mm"], float(first.size_min_mm))
        self.assertEqual(result_map["SAFE-2"]["species"], second.species)

    def test_marketplace_filters_by_contaminants_volume_and_region(self):
        self._create_market_batch(
            batch_code="LOW-MERCURY",
            region="Maluku",
            mercury=Decimal("0.4"),
            quantity=1200,
            destination_country="US",
        )
        self._create_market_batch(
            batch_code="HIGH-MERCURY",
            region="Maluku",
            mercury=Decimal("0.9"),
            quantity=900,
            destination_country="US",
            country_of_origin="VN",
        )
        params = {
            "max_mercury": 0.5,
            "min_volume": 1000,
            "region": "Maluku",
            "destination_country": "US",
            "country_of_origin": "ID",
        }
        response = self.client.get(MARKETPLACE_URL, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertEqual(body["count"], 1)
        self.assertEqual(body["results"][0]["batch_code"], "LOW-MERCURY")

    def test_marketplace_supports_ordering_pagination_and_rejects_invalid_ordering(self):
        self._create_market_batch(batch_code="BATCH-1", harvest_date=timezone.now().date())
        self._create_market_batch(
            batch_code="BATCH-2",
            harvest_date=timezone.now().date() - timedelta(days=2),
            mercury=Decimal("0.2"),
        )
        self._create_market_batch(
            batch_code="BATCH-3",
            harvest_date=timezone.now().date() - timedelta(days=4),
            mercury=Decimal("0.1"),
        )

        response = self.client.get(
            MARKETPLACE_URL,
            {"ordering": "-harvest_date", "page_size": 2},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertEqual(body["count"], 3)
        self.assertEqual(len(body["results"]), 2)
        self.assertEqual(body["results"][0]["batch_code"], "BATCH-1")

        bad_response = self.client.get(MARKETPLACE_URL, {"ordering": "unknown"})
        self.assertEqual(bad_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("ordering", bad_response.json())

    def test_marketplace_rejects_invalid_numeric_filter(self):
        response = self.client.get(MARKETPLACE_URL, {"max_mercury": "abc"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.json())
        response = self.client.get(MARKETPLACE_URL, {"min_volume": "abc"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("min_volume", response.json())
        response = self.client.get(MARKETPLACE_URL, {"max_volume": "abc"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("max_volume", response.json())

    def test_marketplace_handles_unassigned_supplier_and_missing_qc(self):
        info = self._create_market_batch(
            batch_code="NO-SUPPLIER",
            supplier=None,
            with_qc=False,
        )
        response = self.client.get(MARKETPLACE_URL)
        result_map = {item["batch_code"]: item for item in response.json()["results"]}
        entry = result_map["NO-SUPPLIER"]
        self.assertEqual(entry["supplier"]["name"], "Unassigned")
        self.assertIsNone(entry["quality_summary"])

    # ----------- Requirement tests -----------

    def test_buyer_can_create_list_update_and_delete_requirement(self):
        self.client.force_authenticate(self.buyer)
        payload = self._requirement_payload()
        payload["allowed_contaminants"]["cesium"] = None
        response = self.client.post(REQUIREMENTS_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        data = response.json()
        requirement_id = data["id"]
        requirement = BuyerRequirement.objects.get(pk=requirement_id)
        self.assertEqual(requirement.buyer, self.buyer)
        self.assertEqual(requirement.volume_required, requirement.max_volume)
        logs = QualityCheckLog.objects.filter(requirement=requirement)
        self.assertEqual(logs.count(), 1)
        self.assertEqual(data["quality_summary"]["status"], "PASS")

        list_resp = self.client.get(REQUIREMENTS_URL)
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(list_resp.json()["count"], 1)

        patch_resp = self.client.patch(
            f"{REQUIREMENTS_URL}{requirement_id}/",
            {"max_volume": 1500},
            format="json",
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        requirement.refresh_from_db()
        self.assertEqual(requirement.max_volume, 1500)
        self.assertEqual(requirement.volume_required, 1500)
        patch_resp = self.client.patch(
            f"{REQUIREMENTS_URL}{requirement_id}/",
            {"destination_country": "us"},
            format="json",
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        requirement.refresh_from_db()
        self.assertEqual(requirement.destination_country, "US")

        delete_resp = self.client.delete(f"{REQUIREMENTS_URL}{requirement_id}/")
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(BuyerRequirement.objects.filter(pk=requirement_id).exists())
        self.assertFalse(QualityCheckLog.objects.filter(requirement=requirement).exists())
        self.assertIn("requirement", str(requirement))

    def test_requirement_validations_and_permissions(self):
        payload = self._requirement_payload(min_volume=1200, max_volume=200)
        self.client.force_authenticate(self.buyer)
        invalid_resp = self.client.post(REQUIREMENTS_URL, payload, format="json")
        self.assertEqual(invalid_resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("max_volume", invalid_resp.json())

        payload = self._requirement_payload(
            shipping_window_start=str(timezone.now().date() + timedelta(days=4)),
            shipping_window_end=str(timezone.now().date() + timedelta(days=1)),
        )
        invalid_dates = self.client.post(REQUIREMENTS_URL, payload, format="json")
        self.assertEqual(invalid_dates.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("shipping_window_end", invalid_dates.json())

        payload = self._requirement_payload(
            allowed_contaminants={"mercury": -1},
        )
        invalid_limits = self.client.post(REQUIREMENTS_URL, payload, format="json")
        self.assertEqual(invalid_limits.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("allowed_contaminants", invalid_limits.json())
        payload = self._requirement_payload(
            allowed_contaminants={"nickel": 0.1},
        )
        invalid_key = self.client.post(REQUIREMENTS_URL, payload, format="json")
        self.assertEqual(invalid_key.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("allowed_contaminants", invalid_key.json())

        unauth_client = APIClient()
        unauth_resp = unauth_client.get(REQUIREMENTS_URL)
        self.assertEqual(unauth_resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            unauth_resp.json()["detail"], "Authentication credentials were not provided."
        )

        self.client.force_authenticate(self.viewer)
        forbidden_resp = self.client.get(REQUIREMENTS_URL)
        self.assertEqual(forbidden_resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_requirement_queryset_scoped_to_owner_and_staff_can_view_all(self):
        self.client.force_authenticate(self.buyer)
        created = self.client.post(REQUIREMENTS_URL, self._requirement_payload(), format="json").json()
        requirement_id = created["id"]
        self.client.force_authenticate(self.other_buyer)
        not_found = self.client.get(f"{REQUIREMENTS_URL}{requirement_id}/")
        self.assertEqual(not_found.status_code, status.HTTP_404_NOT_FOUND)

        self.client.force_authenticate(self.staff)
        staff_resp = self.client.get(REQUIREMENTS_URL)
        self.assertEqual(staff_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(staff_resp.json()["count"], 1)

    # ----------- Matching tests -----------

    def test_matches_endpoint_returns_batches_respecting_requirement_filters(self):
        match_info = self._create_market_batch(
            batch_code="MATCHED",
            quantity=600,
            mercury=Decimal("0.4"),
            cesium=Decimal("0.2"),
            ecoli=Decimal("200"),
            ready_date=timezone.now().date() + timedelta(days=4),
            destination_country="JP",
        )
        self._create_market_batch(
            batch_code="OUTSIDE-WINDOW",
            ready_date=timezone.now().date() + timedelta(days=30),
            destination_country="US",
        )

        self.client.force_authenticate(self.buyer)
        payload = self._requirement_payload()
        created = self.client.post(REQUIREMENTS_URL, payload, format="json").json()
        requirement_id = created["id"]

        response = self.client.get(f"{REQUIREMENTS_URL}{requirement_id}/matches/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        matches = response.json()
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["batch_code"], match_info.batch.batch_code)

    def test_matches_endpoint_requires_buyer_role(self):
        self.client.force_authenticate(self.buyer)
        requirement_id = self.client.post(
            REQUIREMENTS_URL,
            self._requirement_payload(),
            format="json",
        ).json()["id"]
        self.client.force_authenticate(self.viewer)
        response = self.client.get(f"{REQUIREMENTS_URL}{requirement_id}/matches/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_requirement_serializer_handles_missing_quality_summary(self):
        requirement = BuyerRequirement.objects.create(
            buyer=self.buyer,
            buyer_name="Serializer Buyer",
            product_type="pepper",
            min_volume=50,
            max_volume=75,
            allowed_contaminants={},
            shipping_window_start=timezone.now().date(),
            shipping_window_end=timezone.now().date() + timedelta(days=5),
            destination_country="AU",
        )
        data = BuyerRequirementSerializer(requirement).data
        self.assertIsNone(data["quality_summary"])

    # ----------- Quality check service tests -----------

    def test_quality_check_hash_chain_and_latest_lookup(self):
        requirement = BuyerRequirement.objects.create(
            buyer=self.buyer,
            buyer_name="Legacy Buyer",
            product_type="coffee",
            min_volume=100,
            max_volume=200,
            volume_required=200,
            allowed_contaminants={"total_ppm": 0.2},
            shipping_window_start=timezone.now().date(),
            shipping_window_end=timezone.now().date() + timedelta(days=1),
            destination_country="SG",
        )
        self.assertIsNone(requirement.latest_quality_check())
        first = create_quality_check(requirement)
        second = create_quality_check(requirement)
        self.assertEqual(second.previous_hash, first.hash)
        self.assertEqual(requirement.latest_quality_check().id, second.id)

    def test_requirement_save_uses_min_volume_when_max_missing(self):
        requirement = BuyerRequirement.objects.create(
            buyer=self.buyer,
            buyer_name="No Max",
            product_type="mangosteen",
            min_volume=75,
            max_volume=0,
            allowed_contaminants={},
            shipping_window_start=timezone.now().date(),
            shipping_window_end=timezone.now().date() + timedelta(days=2),
            destination_country="AE",
        )
        self.assertEqual(requirement.volume_required, 75)

    def test_marketplace_queryset_helper_without_params(self):
        info = self._create_market_batch(batch_code="QS-HELPER")
        queryset = list(get_marketplace_queryset())
        self.assertTrue(any(entry.batch_id == info.batch_id for entry in queryset))

    def test_find_market_matches_supports_additional_filters(self):
        info = self._create_market_batch(
            batch_code="FILTERED",
            region="West Java",
            ready_date=timezone.now().date() + timedelta(days=2),
        )
        requirement = BuyerRequirement.objects.create(
            buyer=self.buyer,
            buyer_name="Filter Buyer",
            product_type=info.species,
            min_volume=100,
            max_volume=1000,
            shipping_window_start=timezone.now().date(),
            shipping_window_end=timezone.now().date() + timedelta(days=4),
            destination_country=info.destination_country,
            allowed_contaminants={"mercury": float(info.contaminant_mercury_ppm)},
        )
        matches = list(find_market_matches(requirement, {"region": "West Java"}))
        self.assertTrue(matches)
        self.assertEqual(matches[0].batch_id, info.batch_id)

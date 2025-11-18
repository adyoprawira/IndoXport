import os
import uuid
from datetime import date, timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

from django.contrib.auth import get_user_model  # noqa: E402
from django.test import TestCase, override_settings  # noqa: E402
from rest_framework.test import APIClient  # noqa: E402

from buyers.models import BatchMarketInfo, BuyerProfile, BuyerRequirement  # noqa: E402
from suppliers.models import ProductBatch  # noqa: E402


User = get_user_model()


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class BuyerViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.buyer = User.objects.create_user(username="buyer", password="secret")
        BuyerProfile.objects.create(user=self.buyer, organization="Buyer Org", country="ID")

    def _payload(self, **overrides):
        today = date.today()
        payload = {
            "commodity": "black tiger shrimp",
            "buyer_name": "Ocean Importer",
            "min_volume": 500,
            "max_volume": 1000,
            "allowed_contaminants": {"mercury": 0.5, "ecoli": 100},
            "shipping_window_start": today.isoformat(),
            "shipping_window_end": (today + timedelta(days=30)).isoformat(),
            "destination_country": "JP",
            "standards": ["EU"],
            "notes": "Need MSC paperwork.",
        }
        payload.update(overrides)
        return payload

    def _make_marketplace_batch(self, species="black tiger shrimp"):
        batch = ProductBatch.objects.create(
            batch_code=f"BATCH-{uuid.uuid4().hex[:6]}",
            product_name="Premium Shrimp",
            quantity=800,
            unit="kg",
            qc_status="brin_verified_pass",
            is_allowed_for_catalog=True,
        )
        BatchMarketInfo.objects.create(
            batch=batch,
            species=species,
            region="Java",
            country_of_origin="ID",
            destination_country="JP",
            harvest_date=date.today(),
            ready_date=date.today() + timedelta(days=5),
            contaminant_mercury_ppm=0.3,
        )
        return batch

    def test_buyer_can_create_requirement_and_quality_check(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.post("/api/buyer/requirements/", self._payload(), format="json")
        self.assertEqual(response.status_code, 201)
        requirement = BuyerRequirement.objects.get(pk=response.data["id"])
        self.assertEqual(requirement.quality_checks.count(), 1)
        self.assertEqual(requirement.destination_country, "JP")

    def test_requirement_list_is_scoped_to_authenticated_buyer(self):
        other = User.objects.create_user(username="buyer2", password="secret")
        BuyerProfile.objects.create(user=other, organization="Other Org", country="ID")
        BuyerRequirement.objects.create(
            buyer=other,
            buyer_name="Other",
            product_type="tuna",
            min_volume=100,
            max_volume=200,
            allowed_contaminants={"mercury": 0.5},
            shipping_window_start=date.today(),
            shipping_window_end=date.today() + timedelta(days=10),
        )
        BuyerRequirement.objects.create(
            buyer=self.buyer,
            buyer_name="Mine",
            product_type="tuna",
            min_volume=100,
            max_volume=200,
            allowed_contaminants={"mercury": 0.5},
            shipping_window_start=date.today(),
            shipping_window_end=date.today() + timedelta(days=10),
        )

        self.client.force_authenticate(user=self.buyer)
        response = self.client.get("/api/buyer/requirements/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["buyer_name"], "Mine")

    def test_matches_endpoint_returns_marketplace_hits(self):
        batch = self._make_marketplace_batch()
        requirement = BuyerRequirement.objects.create(
            buyer=self.buyer,
            buyer_name="Match Buyer",
            product_type="black tiger shrimp",
            min_volume=100,
            max_volume=900,
            allowed_contaminants={"mercury": 0.5},
            shipping_window_start=date.today(),
            shipping_window_end=date.today() + timedelta(days=10),
            destination_country="JP",
        )

        self.client.force_authenticate(user=self.buyer)
        response = self.client.get(f"/api/buyer/requirements/{requirement.id}/matches/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["batch_code"], batch.batch_code)

    def test_marketplace_view_lists_available_batches(self):
        self._make_marketplace_batch(species="yellowfin tuna")
        response = self.client.get("/api/buyer/marketplace/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["species"], "yellowfin tuna")

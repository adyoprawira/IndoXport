from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from buyers.matchers import SUPPLIER_BATCHES
from buyers.models import BuyerRequirement, QualityCheckLog


class TestRequirementAPI(TestCase):
    maxDiff = None

    def _fresh_payload(self):
        start_window = timezone.now().date()
        end_window = start_window + timedelta(days=10)
        return {
            "buyer_name": "Ocean Freight Export",
            "product_type": "coffee",
            "volume_required": 1200,
            "allowed_contaminants": {"total_ppm": 20.0},
            "shipping_window_start": str(start_window),
            "shipping_window_end": str(end_window),
        }

    def test_create_requirement_generates_qc_log(self):
        payload = self._fresh_payload()
        response = self.client.post(
            "/api/requirements/",
            payload,
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201, response.content.decode())
        requirement = BuyerRequirement.objects.get(buyer_name="Ocean Freight Export")
        logs = QualityCheckLog.objects.filter(requirement=requirement)
        self.assertEqual(logs.count(), 1)
        log = logs.first()
        self.assertIsNotNone(log.hash)
        self.assertEqual(log.previous_hash, "")
        self.assertEqual(log.status, "PASS")

    def test_list_returns_recent_requirements(self):
        payload = self._fresh_payload()
        self.client.post(
            "/api/requirements/",
            payload,
            content_type="application/json",
        )
        response = self.client.get("/api/requirements/")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(len(body["results"]), 1)
        self.assertEqual(body["results"][0]["buyer_name"], "Ocean Freight Export")

    def test_matches_filter_on_volume_and_contaminants(self):
        payload = self._fresh_payload()
        payload["allowed_contaminants"]["total_ppm"] = 15
        self.client.post(
            "/api/requirements/",
            payload,
            content_type="application/json",
        )
        requirement = BuyerRequirement.objects.get(buyer_name="Ocean Freight Export")
        response = self.client.get(f"/api/requirements/{requirement.id}/matches/")
        self.assertEqual(response.status_code, 200)
        matches = response.json()
        self.assertTrue(matches)
        for match in matches:
            self.assertLessEqual(match["contaminant_ppm"], 15)
            self.assertGreaterEqual(match["available_volume"], requirement.volume_required)
        expected_batches = [
            batch
            for batch in SUPPLIER_BATCHES
            if batch["product_type"] == "coffee"
            and batch["contaminant_ppm"] <= 15
            and batch["available_volume"] >= payload["volume_required"]
        ]
        self.assertEqual(len(matches), len(expected_batches))

    def test_revalidation_appends_additional_qc_log(self):
        payload = self._fresh_payload()
        self.client.post(
            "/api/requirements/",
            payload,
            content_type="application/json",
        )
        requirement = BuyerRequirement.objects.get(buyer_name="Ocean Freight Export")
        first_log = QualityCheckLog.objects.filter(requirement=requirement).first()
        response = self.client.post(f"/api/requirements/{requirement.id}/revalidate/")
        self.assertEqual(response.status_code, 200, response.content.decode())
        logs = QualityCheckLog.objects.filter(requirement=requirement).order_by("created_at")
        self.assertEqual(logs.count(), 2)
        second_log = logs.last()
        self.assertEqual(second_log.previous_hash, first_log.hash)
        self.assertNotEqual(second_log.hash, first_log.hash)
        body = response.json()
        self.assertIn("documents", body)
        self.assertIn("quality_status", body)

import os
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from suppliers.models import ProductBatch, QcRecord


User = get_user_model()


class SupplierViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.supplier = User.objects.create_user(
            username="supplier",
            email="supplier@example.com",
            password="pass123",
        )
        self.payload = {
            "batch_code": "SAFE-DEMO-001",
            "product_name": "Prime Shrimp",
            "description": "Hackathon batch",
            "quantity": 500,
            "unit": "kg",
        }

    def test_create_submit_process_flow(self):
        self.client.force_authenticate(user=self.supplier)
        create = self.client.post("/api/supplier/batches/", self.payload, format="json")
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        batch_id = create.data["id"]

        # Submit QC first time succeeds.
        submit = self.client.post(f"/api/supplier/batches/{batch_id}/submit-qc/", {"notes": "Ready"}, format="json")
        self.assertEqual(submit.status_code, status.HTTP_200_OK)
        self.assertEqual(submit.data["batch"]["qc_status"], "submitted")

        # Second submission rejected.
        submit_again = self.client.post(f"/api/supplier/batches/{batch_id}/submit-qc/", {}, format="json")
        self.assertEqual(submit_again.status_code, status.HTTP_400_BAD_REQUEST)

        # Processing before submission should fail for another batch.
        other = ProductBatch.objects.create(
            supplier=self.supplier,
            batch_code="BATCH-NO-SUBMIT",
            product_name="Hold Batch",
            quantity=100,
            unit="kg",
        )
        process_fail = self.client.post(f"/api/supplier/batches/{other.id}/process-brin/")
        self.assertEqual(process_fail.status_code, status.HTTP_400_BAD_REQUEST)

        # Process QC on submitted batch, serializer should include latest_qc.
        process = self.client.post(f"/api/supplier/batches/{batch_id}/process-brin/")
        self.assertEqual(process.status_code, status.HTTP_200_OK)
        batch_payload = process.data["batch"]
        self.assertIn(batch_payload["qc_status"], ["brin_verified_pass", "brin_verified_fail"])
        self.assertIsNotNone(batch_payload["latest_qc"])

    def test_list_filters_by_authenticated_supplier(self):
        owned = ProductBatch.objects.create(
            supplier=self.supplier,
            batch_code="OWNED-1",
            product_name="Owned",
            quantity=10,
            unit="kg",
        )
        ProductBatch.objects.create(
            batch_code="OTHER-1",
            product_name="Other",
            quantity=10,
            unit="kg",
        )

        # Authenticated supplier only sees own batch.
        self.client.force_authenticate(user=self.supplier)
        response = self.client.get("/api/supplier/batches/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["batch_code"], owned.batch_code)

        # Anonymous user can see catalogue of all batches.
        self.client.force_authenticate(user=None)
        anon_response = self.client.get("/api/supplier/batches/")
        self.assertEqual(len(anon_response.data), 2)

    def test_qc_records_chain_previous_hash(self):
        batch = ProductBatch.objects.create(
            batch_code="CHAIN-1",
            product_name="Chain Batch",
            quantity=50,
            unit="kg",
        )
        first = QcRecord.objects.create(
            batch=batch,
            passed=True,
            contamination_score=10.0,
            details={"info": "first"},
        )
        second = QcRecord.objects.create(
            batch=batch,
            passed=False,
            contamination_score=20.0,
            details={"info": "second"},
        )
        self.assertTrue(str(batch).startswith("CHAIN-1"))
        self.assertIn("CHAIN-1", str(first))
        self.assertNotEqual(second.previous_hash, "")
        self.assertNotEqual(second.record_hash, first.record_hash)

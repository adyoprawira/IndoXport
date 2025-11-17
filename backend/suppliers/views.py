from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .brin_stub import simulate_brin_qc
from .models import ProductBatch, QcRecord
from .serializers import ProductBatchSerializer, QcRecordSerializer


class ProductBatchViewSet(viewsets.ModelViewSet):
    """
    CRUD untuk batch + BRIN QC flow.
    Untuk demo, permission dibuat AllowAny.
    Nanti bisa diganti ke IsAuthenticated.
    """

    serializer_class = ProductBatchSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # kalau mau filter per supplier:
        user = self.request.user
        qs = ProductBatch.objects.all().order_by("-created_at")
        if user.is_authenticated:
            return qs.filter(supplier=user)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    # ---------- BRIN QC FLOW ----------

    @action(detail=True, methods=["post"], url_path="submit-qc")
    def submit_qc(self, request, pk=None):
        """
        Supplier 'mengirim' form QC ke BRIN (stub).
        """
        batch = self.get_object()

        if batch.qc_status not in ["not_submitted"]:
            return Response(
                {"detail": "QC already submitted or completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        notes = request.data.get("notes", "")

        payload = {
            "batch_code": batch.batch_code,
            "product_name": batch.product_name,
            "quantity": batch.quantity,
            "unit": batch.unit,
            "supplier_id": batch.supplier_id,
            "notes": notes,
        }

        batch.brin_request_payload = payload
        batch.qc_status = "submitted"
        batch.save(update_fields=["brin_request_payload", "qc_status"])

        serializer = self.get_serializer(batch)
        return Response(
            {
                "message": "QC form submitted to BRIN (stub).",
                "batch": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="process-brin")
    def process_brin(self, request, pk=None):
        """
        Simulasi BRIN memproses QC.
        Di demo, ini bisa langsung dipanggil setelah submit_qc.
        """
        batch = self.get_object()

        if batch.qc_status not in ["submitted", "brin_verifying"]:
            return Response(
                {"detail": "Batch is not in BRIN QC stage."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # set status verifying
        batch.qc_status = "brin_verifying"
        batch.save(update_fields=["qc_status"])

        # run stub simulator
        response = simulate_brin_qc(batch.brin_request_payload or {})
        passed = bool(response.get("passed"))

        # update batch
        batch.brin_response_payload = response
        batch.last_qc_at = timezone.now()
        if passed:
            batch.qc_status = "brin_verified_pass"
            batch.is_allowed_for_catalog = True
        else:
            batch.qc_status = "brin_verified_fail"
        batch.save(
            update_fields=[
                "brin_response_payload",
                "last_qc_at",
                "qc_status",
                "is_allowed_for_catalog",
            ]
        )

        # simpan ke ledger QcRecord
        results = response.get("results", {}) or {}
        contamination_score = float(results.get("lcms_score", 0.0))
        qc_record = QcRecord.objects.create(
            batch=batch,
            passed=passed,
            contamination_score=contamination_score,
            details=response,
        )

        batch_data = self.get_serializer(batch).data
        qc_data = QcRecordSerializer(qc_record).data

        return Response(
            {
                "message": "BRIN QC simulation completed.",
                "batch": batch_data,
                "qc_record": qc_data,
            },
            status=status.HTTP_200_OK,
        )

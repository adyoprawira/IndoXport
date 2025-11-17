import hashlib

from django.conf import settings
from django.db import models
from django.utils import timezone


class ProductBatch(models.Model):
    """
    Batch produk yang dibuat oleh supplier.
    Akan dikirim ke BRIN (stub) untuk QC.
    """

    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="batches",
    )

    batch_code = models.CharField(max_length=64, unique=True)
    product_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    quantity = models.PositiveIntegerField()
    unit = models.CharField(max_length=32, default="kg")

    QC_STATUS = [
        ("not_submitted", "Not Submitted"),
        ("submitted", "Submitted to BRIN"),
        ("brin_verifying", "BRIN Verifying"),
        ("brin_verified_pass", "BRIN Verified PASS"),
        ("brin_verified_fail", "BRIN Verified FAIL"),
    ]
    qc_status = models.CharField(
        max_length=32,
        choices=QC_STATUS,
        default="not_submitted",
    )

    brin_request_payload = models.JSONField(null=True, blank=True)
    brin_response_payload = models.JSONField(null=True, blank=True)

    is_allowed_for_catalog = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    last_qc_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.batch_code} - {self.product_name}"


class QcRecord(models.Model):
    """
    Ledger-like log untuk setiap hasil QC dari BRIN (stub).
    Pakai hash chaining biar kelihatan immutable.
    """

    batch = models.ForeignKey(
        ProductBatch,
        on_delete=models.CASCADE,
        related_name="qc_records",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    passed = models.BooleanField()
    contamination_score = models.FloatField()
    details = models.JSONField(default=dict, blank=True)

    previous_hash = models.CharField(max_length=128, blank=True)
    record_hash = models.CharField(max_length=128, blank=True)

    def _compute_payload(self) -> str:
        return (
            f"{self.batch_id}|"
            f"{self.created_at.isoformat()}|"
            f"{self.passed}|"
            f"{self.contamination_score}|"
            f"{self.previous_hash}"
        )

    def save(self, *args, **kwargs):
        # chain to previous record
        if not self.previous_hash:
            last = (
                QcRecord.objects.filter(batch=self.batch)
                .exclude(pk=self.pk)
                .order_by("-created_at")
                .first()
            )
            if last:
                self.previous_hash = last.record_hash or ""

        # created_at harus ada sebelum hitung hash (kalau instance baru)
        if self._state.adding and not self.created_at:
            self.created_at = timezone.now()

        payload = self._compute_payload()
        self.record_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"QC for {self.batch.batch_code} at {self.created_at}"

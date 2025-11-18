from __future__ import annotations

import hashlib
import json
from typing import Any

from django.db import models
from django.utils import timezone


class BuyerRequirement(models.Model):
    STATUS_OPEN = "OPEN"
    STATUS_MATCHED = "MATCHED"
    STATUS_DONE = "DONE"

    STATUS_CHOICES = [
        (STATUS_OPEN, "Open"),
        (STATUS_MATCHED, "Matched"),
        (STATUS_DONE, "Settled"),
    ]

    buyer_name = models.CharField(max_length=128)
    product_type = models.CharField(max_length=64)
    volume_required = models.PositiveIntegerField()
    allowed_contaminants = models.JSONField(default=dict)
    shipping_window_start = models.DateField()
    shipping_window_end = models.DateField()
    status = models.CharField(
        max_length=16, choices=STATUS_CHOICES, default=STATUS_OPEN
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def latest_quality_check(self) -> "QualityCheckLog | None":
        return self.quality_checks.order_by("-created_at").first()

    def as_dict(self) -> dict[str, Any]:
        latest_qc = self.latest_quality_check()
        return {
            "id": self.id,
            "buyer_name": self.buyer_name,
            "product_type": self.product_type,
            "volume_required": self.volume_required,
            "allowed_contaminants": self.allowed_contaminants,
            "shipping_window_start": str(self.shipping_window_start),
            "shipping_window_end": str(self.shipping_window_end),
            "status": self.status,
            "quality_status": latest_qc.status if latest_qc else None,
            "latest_qc_hash": latest_qc.hash if latest_qc else None,
            "created_at": self.created_at.isoformat(),
        }


class QualityCheckLog(models.Model):
    STATUS_PASS = "PASS"
    STATUS_WARN = "WARN"
    STATUS_FAIL = "FAIL"

    requirement = models.ForeignKey(
        BuyerRequirement, on_delete=models.CASCADE, related_name="quality_checks"
    )
    status = models.CharField(
        max_length=16,
        choices=[
            (STATUS_PASS, "Pass"),
            (STATUS_WARN, "Warn"),
            (STATUS_FAIL, "Fail"),
        ],
        default=STATUS_PASS,
    )
    result = models.JSONField(default=dict)
    hash = models.CharField(max_length=64, blank=True)
    previous_hash = models.CharField(max_length=64, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def save(self, *args, **kwargs):
        if not self.previous_hash:
            previous = (
                QualityCheckLog.objects.filter(requirement=self.requirement)
                .exclude(pk=self.pk)
                .order_by("-created_at")
                .first()
            )
            if previous:
                self.previous_hash = previous.hash
        payload = {
            "requirement": self.requirement.id,
            "result": self.result,
            "status": self.status,
            "previous_hash": self.previous_hash,
            "timestamp": timezone.now().isoformat(),
        }
        self.hash = hashlib.sha256(
            json.dumps(payload, sort_keys=True).encode("utf-8")
        ).hexdigest()
        super().save(*args, **kwargs)

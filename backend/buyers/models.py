from __future__ import annotations

import hashlib
import json

from django.conf import settings
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

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="buyer_requirements",
        null=True,
        blank=True,
    )
    buyer_name = models.CharField(max_length=128, blank=True)
    product_type = models.CharField(max_length=64)
    min_volume = models.PositiveIntegerField(default=0)
    max_volume = models.PositiveIntegerField(default=0)
    volume_required = models.PositiveIntegerField(default=0)
    allowed_contaminants = models.JSONField(default=dict)
    shipping_window_start = models.DateField()
    shipping_window_end = models.DateField()
    destination_country = models.CharField(max_length=64, blank=True)
    standards = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=16, choices=STATUS_CHOICES, default=STATUS_OPEN
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def latest_quality_check(self) -> "QualityCheckLog | None":
        return self.quality_checks.order_by("-created_at").first()

    def save(self, *args, **kwargs):
        if self.max_volume:
            self.volume_required = self.max_volume
        elif self.min_volume:
            self.volume_required = self.min_volume
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.product_type} requirement #{self.pk}"


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


class BuyerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="buyer_profile",
    )
    organization = models.CharField(max_length=128)
    country = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.organization} ({self.country})"


class BatchMarketInfo(models.Model):
    batch = models.OneToOneField(
        "suppliers.ProductBatch",
        on_delete=models.CASCADE,
        related_name="market_info",
    )
    species = models.CharField(max_length=128)
    size_min_mm = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )
    size_max_mm = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )
    region = models.CharField(max_length=128, blank=True)
    country_of_origin = models.CharField(max_length=64, blank=True)
    harvest_date = models.DateField(null=True, blank=True)
    ready_date = models.DateField(null=True, blank=True)
    destination_country = models.CharField(max_length=64, blank=True)
    price_per_unit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    contaminant_mercury_ppm = models.DecimalField(
        max_digits=6, decimal_places=3, null=True, blank=True
    )
    contaminant_cesium_ppm = models.DecimalField(
        max_digits=6, decimal_places=3, null=True, blank=True
    )
    contaminant_ecoli_cfu = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-harvest_date", "-batch__created_at"]

    def __str__(self) -> str:
        return f"Marketplace info for {self.batch.batch_code}"

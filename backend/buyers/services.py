from __future__ import annotations

from datetime import date
from typing import Sequence

from django.utils import timezone

from buyers.matchers import SUPPLIER_BATCHES
from buyers.models import BuyerRequirement, QualityCheckLog


def simulate_quality_check(requirement: BuyerRequirement) -> dict:
    allowed_ppm = requirement.allowed_contaminants.get("total_ppm", 30.0)
    contaminant_ppm = max(0.5, allowed_ppm - 2)
    status = (
        QualityCheckLog.STATUS_PASS
        if contaminant_ppm <= allowed_ppm
        else QualityCheckLog.STATUS_FAIL
    )
    return {
        "status": status,
        "result": {
            "contaminant_ppm": round(contaminant_ppm, 2),
            "threshold_ppm": allowed_ppm,
        },
    }


def create_quality_check(requirement: BuyerRequirement) -> QualityCheckLog:
    qc = simulate_quality_check(requirement)
    return QualityCheckLog.objects.create(
        requirement=requirement,
        status=qc["status"],
        result=qc["result"],
    )


def build_document_pack(requirement: BuyerRequirement) -> dict[str, str]:
    now = timezone.now().date()
    return {
        "commercial_invoice": (
            f"Invoice: {requirement.product_type.title()} from {requirement.buyer_name} "
            f"({requirement.volume_required} units) {now.isoformat()}"
        ),
        "certificate_of_origin": (
            f"COO: {requirement.product_type.title()} | {requirement.buyer_name} | "
            f"Valid {requirement.shipping_window_start} - {requirement.shipping_window_end}"
        ),
        "health_certificate": (
            f"Health Cert: {requirement.product_type.title()} | QC pass hash "
            f"{requirement.latest_quality_check().hash if requirement.latest_quality_check() else 'pending'}"
        ),
    }


def find_market_matches(
    requirement: BuyerRequirement,
    dataset: Sequence[dict] | None = None,
) -> list[dict[str, str | int | float]]:
    dataset = dataset or SUPPLIER_BATCHES
    today = timezone.now().date()
    matches = []
    volume_needed = requirement.volume_required
    allowed_ppm = requirement.allowed_contaminants.get("total_ppm", 30.0)
    for batch in dataset:
        if batch["product_type"] != requirement.product_type:
            continue
        if batch["available_volume"] < volume_needed:
            continue
        if batch["contaminant_ppm"] > allowed_ppm:
            continue
        shipping_ready = date.fromisoformat(batch["shipping_ready"])
        if not (
            requirement.shipping_window_start <= shipping_ready <= requirement.shipping_window_end
            or requirement.shipping_window_start <= today <= requirement.shipping_window_end
        ):
            continue
        matches.append(batch)
    return matches

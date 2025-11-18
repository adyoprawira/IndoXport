from __future__ import annotations

from decimal import Decimal, InvalidOperation

from django.db.models import Prefetch, QuerySet
from rest_framework import serializers

from buyers.models import BatchMarketInfo, BuyerRequirement, QualityCheckLog
from suppliers.models import QcRecord


def simulate_quality_check(requirement: BuyerRequirement) -> dict:
    allowed_ppm = requirement.allowed_contaminants.get("total_ppm", 30.0)
    contaminant_ppm = max(0.5, float(allowed_ppm) - 2)
    status = (
        QualityCheckLog.STATUS_PASS
        if contaminant_ppm <= float(allowed_ppm)
        else QualityCheckLog.STATUS_FAIL
    )
    return {
        "status": status,
        "result": {
            "contaminant_ppm": round(contaminant_ppm, 2),
            "threshold_ppm": float(allowed_ppm),
        },
    }


def create_quality_check(requirement: BuyerRequirement) -> QualityCheckLog:
    qc = simulate_quality_check(requirement)
    return QualityCheckLog.objects.create(
        requirement=requirement,
        status=qc["status"],
        result=qc["result"],
    )


def _prefetched_market_queryset() -> QuerySet[BatchMarketInfo]:
    latest_qc = Prefetch(
        "batch__qc_records",
        queryset=QcRecord.objects.order_by("-created_at")[:1],
        to_attr="latest_qc_list",
    )
    return (
        BatchMarketInfo.objects.select_related("batch", "batch__supplier")
        .prefetch_related(latest_qc)
        .filter(
            batch__is_allowed_for_catalog=True,
            batch__qc_status="brin_verified_pass",
        )
    )


ORDERING_MAP = {
    "harvest_date": "harvest_date",
    "price": "price_per_unit",
    "mercury": "contaminant_mercury_ppm",
    "cesium": "contaminant_cesium_ppm",
    "ecoli": "contaminant_ecoli_cfu",
}

CONTAMINANT_PARAM_MAP = {
    "max_mercury": "contaminant_mercury_ppm__lte",
    "max_cesium": "contaminant_cesium_ppm__lte",
    "max_ecoli": "contaminant_ecoli_cfu__lte",
}


def _convert_decimal(raw_value: str | float | int) -> Decimal:
    try:
        return Decimal(str(raw_value))
    except (InvalidOperation, TypeError, ValueError):
        raise serializers.ValidationError(
            {"detail": f"Invalid numeric value: {raw_value}"}
        )


def apply_market_filters(
    queryset: QuerySet[BatchMarketInfo],
    params: dict[str, str],
) -> QuerySet[BatchMarketInfo]:
    filtered = queryset
    for param, lookup in CONTAMINANT_PARAM_MAP.items():
        value = params.get(param)
        if value not in (None, ""):
            filtered = filtered.filter(**{lookup: _convert_decimal(value)})

    min_volume = params.get("min_volume")
    if min_volume not in (None, ""):
        try:
            min_value = int(min_volume)
        except (TypeError, ValueError):
            raise serializers.ValidationError({"min_volume": "Invalid number"})
        filtered = filtered.filter(batch__quantity__gte=min_value)

    max_volume = params.get("max_volume")
    if max_volume not in (None, ""):
        try:
            max_value = int(max_volume)
        except (TypeError, ValueError):
            raise serializers.ValidationError({"max_volume": "Invalid number"})
        filtered = filtered.filter(batch__quantity__lte=max_value)

    region = params.get("region")
    if region:
        filtered = filtered.filter(region__iexact=region)

    country = params.get("country_of_origin")
    if country:
        filtered = filtered.filter(country_of_origin__iexact=country)

    destination = params.get("destination_country")
    if destination:
        filtered = filtered.filter(destination_country__iexact=destination)

    ordering = params.get("ordering")
    if ordering:
        prefix = "-" if ordering.startswith("-") else ""
        key = ordering.lstrip("-")
        if key not in ORDERING_MAP:
            raise serializers.ValidationError(
                {"ordering": "Unsupported ordering field"}
            )
        filtered = filtered.order_by(f"{prefix}{ORDERING_MAP[key]}")
    else:
        filtered = filtered.order_by("-harvest_date", "-batch__created_at")
    return filtered


def get_marketplace_queryset(params: dict[str, str] | None = None):
    queryset = _prefetched_market_queryset()
    if params is None:
        return queryset
    return apply_market_filters(queryset, params)


def find_market_matches(
    requirement: BuyerRequirement,
    additional_filters: dict[str, str] | None = None,
) -> QuerySet[BatchMarketInfo]:
    params = {
        "min_volume": requirement.min_volume or None,
        "max_volume": requirement.max_volume or None,
        "destination_country": requirement.destination_country,
    }
    for contaminant_key, lookup in [
        ("mercury", "max_mercury"),
        ("cesium", "max_cesium"),
        ("ecoli", "max_ecoli"),
    ]:
        limit = requirement.allowed_contaminants.get(contaminant_key)
        if limit is not None:
            params[lookup] = str(limit)

    if additional_filters:
        params.update({k: v for k, v in additional_filters.items() if v})

    queryset = _prefetched_market_queryset().filter(
        species__iexact=requirement.product_type
    )
    if requirement.shipping_window_start and requirement.shipping_window_end:
        queryset = queryset.filter(
            ready_date__gte=requirement.shipping_window_start,
            ready_date__lte=requirement.shipping_window_end,
        )
    return apply_market_filters(queryset, params)

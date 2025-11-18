from __future__ import annotations

from typing import Any

from django.utils import timezone
from rest_framework import serializers

from buyers.models import BatchMarketInfo, BuyerRequirement


class MarketplaceBatchSerializer(serializers.ModelSerializer):
    batch_id = serializers.IntegerField(source="batch.id", read_only=True)
    batch_code = serializers.CharField(source="batch.batch_code", read_only=True)
    supplier = serializers.SerializerMethodField()
    size_range = serializers.SerializerMethodField()
    volume_available = serializers.IntegerField(source="batch.quantity", read_only=True)
    unit = serializers.CharField(source="batch.unit", read_only=True)
    quality_summary = serializers.SerializerMethodField()

    class Meta:
        model = BatchMarketInfo
        fields = [
            "batch_id",
            "batch_code",
            "supplier",
            "species",
            "size_range",
            "volume_available",
            "unit",
            "region",
            "country_of_origin",
            "destination_country",
            "harvest_date",
            "ready_date",
            "price_per_unit",
            "contaminant_mercury_ppm",
            "contaminant_cesium_ppm",
            "contaminant_ecoli_cfu",
            "quality_summary",
        ]

    def get_supplier(self, obj: BatchMarketInfo) -> dict[str, Any]:
        supplier = obj.batch.supplier
        if not supplier:
            return {"id": None, "name": "Unassigned"}
        name = supplier.get_full_name() or supplier.get_username()
        return {"id": supplier.id, "name": name}

    def get_size_range(self, obj: BatchMarketInfo) -> dict[str, float | None]:
        def _to_float(value):
            return float(value) if value is not None else None

        return {
            "min_mm": _to_float(obj.size_min_mm),
            "max_mm": _to_float(obj.size_max_mm),
        }

    def get_quality_summary(self, obj: BatchMarketInfo) -> dict[str, Any] | None:
        latest = getattr(obj.batch, "latest_qc_list", None)
        record = latest[0] if latest else None
        if not record:
            return None
        return {
            "status": "PASS" if record.passed else "FAIL",
            "contamination_score": record.contamination_score,
            "record_hash": record.record_hash,
            "created_at": timezone.localtime(record.created_at).isoformat(),
        }


class BuyerRequirementSerializer(serializers.ModelSerializer):
    commodity = serializers.CharField(source="product_type")
    quality_summary = serializers.SerializerMethodField()
    standards = serializers.ListField(
        child=serializers.CharField(max_length=64),
        allow_empty=True,
        required=False,
    )
    allowed_contaminants = serializers.DictField(
        child=serializers.DecimalField(max_digits=8, decimal_places=3, allow_null=True),
        required=False,
    )

    class Meta:
        model = BuyerRequirement
        fields = [
            "id",
            "commodity",
            "buyer_name",
            "min_volume",
            "max_volume",
            "allowed_contaminants",
            "shipping_window_start",
            "shipping_window_end",
            "destination_country",
            "standards",
            "notes",
            "status",
            "quality_summary",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "quality_summary", "created_at", "updated_at"]
        extra_kwargs = {
            "min_volume": {"min_value": 1},
            "max_volume": {"min_value": 1},
            "destination_country": {"required": False, "allow_blank": True},
            "notes": {"required": False, "allow_blank": True},
        }

    def validate_allowed_contaminants(self, value: dict[str, Any]) -> dict[str, Any]:
        allowed_keys = {"mercury", "cesium", "ecoli", "total_ppm"}
        invalid_keys = set(value.keys()) - allowed_keys
        if invalid_keys:
            raise serializers.ValidationError(
                f"Unsupported contaminant keys: {', '.join(sorted(invalid_keys))}"
            )
        for key, val in value.items():
            if val is None:
                continue
            if float(val) < 0:
                raise serializers.ValidationError(f"{key} must be non-negative")
        return {
            key: (float(val) if val is not None else None) for key, val in value.items()
        }

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        data = super().validate(attrs)
        min_volume = data.get("min_volume") or getattr(self.instance, "min_volume", 0)
        max_volume = data.get("max_volume") or getattr(self.instance, "max_volume", 0)
        if min_volume and max_volume and min_volume > max_volume:
            raise serializers.ValidationError(
                {"max_volume": "max_volume must be greater than or equal to min_volume"}
            )
        start = data.get("shipping_window_start") or getattr(
            self.instance, "shipping_window_start", None
        )
        end = data.get("shipping_window_end") or getattr(
            self.instance, "shipping_window_end", None
        )
        if start and end and end < start:
            raise serializers.ValidationError(
                {"shipping_window_end": "End date must be on or after the start date"}
            )
        return data

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["buyer"] = request.user
        if not validated_data.get("buyer_name"):
            validated_data["buyer_name"] = request.user.get_full_name() or request.user.get_username()
        validated_data["destination_country"] = (
            (validated_data.get("destination_country") or "").upper()
        )
        validated_data["standards"] = validated_data.get("standards") or []
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("buyer", None)
        if "destination_country" in validated_data and validated_data["destination_country"]:
            validated_data["destination_country"] = validated_data["destination_country"].upper()
        return super().update(instance, validated_data)

    def get_quality_summary(self, obj: BuyerRequirement) -> dict[str, Any] | None:
        latest = obj.latest_quality_check()
        if not latest:
            return None
        return {
            "status": latest.status,
            "result": latest.result,
            "hash": latest.hash,
            "previous_hash": latest.previous_hash,
            "created_at": latest.created_at.isoformat(),
        }

from rest_framework import serializers

from .models import ProductBatch, QcRecord


class QcRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = QcRecord
        fields = [
            "id",
            "created_at",
            "passed",
            "contamination_score",
            "details",
            "previous_hash",
            "record_hash",
        ]
        read_only_fields = fields


class ProductBatchSerializer(serializers.ModelSerializer):
    latest_qc = serializers.SerializerMethodField()

    class Meta:
        model = ProductBatch
        fields = [
            "id",
            "batch_code",
            "product_name",
            "description",
            "quantity",
            "unit",
            "qc_status",
            "is_allowed_for_catalog",
            "created_at",
            "last_qc_at",
            "brin_request_payload",
            "brin_response_payload",
            "latest_qc",
        ]
        read_only_fields = [
            "qc_status",
            "is_allowed_for_catalog",
            "created_at",
            "last_qc_at",
            "brin_request_payload",
            "brin_response_payload",
            "latest_qc",
        ]

    def get_latest_qc(self, obj):
        record = obj.qc_records.order_by("-created_at").first()
        if not record:
            return None
        return QcRecordSerializer(record).data

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            validated_data["supplier"] = user
        return super().create(validated_data)

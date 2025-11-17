from django.contrib import admin

from .models import ProductBatch, QcRecord


@admin.register(ProductBatch)
class ProductBatchAdmin(admin.ModelAdmin):
    list_display = (
        "batch_code",
        "product_name",
        "quantity",
        "unit",
        "qc_status",
        "is_allowed_for_catalog",
        "created_at",
    )
    list_filter = ("qc_status", "is_allowed_for_catalog", "created_at")
    search_fields = ("batch_code", "product_name")


@admin.register(QcRecord)
class QcRecordAdmin(admin.ModelAdmin):
    list_display = (
        "batch",
        "created_at",
        "passed",
        "contamination_score",
    )
    list_filter = ("passed", "created_at")
    search_fields = ("batch__batch_code",)

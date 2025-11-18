from __future__ import annotations

from datetime import date, timedelta

from django.utils import timezone

ZERO_DATE = timezone.now().date()

SUPPLIER_BATCHES = [
    {
        "id": "COF-001",
        "supplier": "Bali Harvest",
        "product_type": "coffee",
        "origin": "Bali Highlands",
        "available_volume": 1500,
        "contaminant_ppm": 12.5,
        "qc_status": "PASS",
        "shipping_ready": str(ZERO_DATE + timedelta(days=3)),
    },
    {
        "id": "COF-002",
        "supplier": "Sumatra Roots",
        "product_type": "coffee",
        "origin": "Sumatra Selatan",
        "available_volume": 1000,
        "contaminant_ppm": 18.0,
        "qc_status": "PASS",
        "shipping_ready": str(ZERO_DATE + timedelta(days=1)),
    },
    {
        "id": "COF-003",
        "supplier": "Papua Hills",
        "product_type": "coffee",
        "origin": "Papua",
        "available_volume": 900,
        "contaminant_ppm": 22.1,
        "qc_status": "WARN",
        "shipping_ready": str(ZERO_DATE + timedelta(days=2)),
    },
    {
        "id": "RUB-001",
        "supplier": "Borneo Spices",
        "product_type": "rubber",
        "origin": "Kalimantan Timur",
        "available_volume": 2000,
        "contaminant_ppm": 8.5,
        "qc_status": "PASS",
        "shipping_ready": str(ZERO_DATE + timedelta(days=4)),
    },
]

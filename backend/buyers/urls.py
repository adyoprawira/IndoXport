from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from buyers.views import BuyerMarketplaceView, RequirementViewSet

router = DefaultRouter()
router.register(
    r"buyer/requirements",
    RequirementViewSet,
    basename="buyer-requirement",
)

urlpatterns = [
    path("api/buyer/marketplace/", BuyerMarketplaceView.as_view(), name="buyer-marketplace"),
    path("api/", include(router.urls)),
]

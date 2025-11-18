from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExporterProfileViewSet, MarketplaceViewSet, DealViewSet

router = DefaultRouter()
router.register(r'profile', ExporterProfileViewSet, basename='exporter-profile')
router.register(r'marketplace', MarketplaceViewSet, basename='marketplace')
router.register(r'deals', DealViewSet, basename='deals')

urlpatterns = [
    path('', include(router.urls)),
]
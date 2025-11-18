from __future__ import annotations

from rest_framework import permissions, status, viewsets, generics
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.authentication import BasicAuthentication, SessionAuthentication

from buyers.models import BuyerRequirement
from buyers.permissions import IsBuyerUser
from buyers.serializers import BuyerRequirementSerializer, MarketplaceBatchSerializer
from buyers.services import create_quality_check, find_market_matches, get_marketplace_queryset


class MarketplacePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class BuyerMarketplaceView(generics.ListAPIView):
    serializer_class = MarketplaceBatchSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = MarketplacePagination

    def get_queryset(self):
        return get_marketplace_queryset(self.request.query_params)


class RequirementViewSet(viewsets.ModelViewSet):
    serializer_class = BuyerRequirementSerializer
    permission_classes = [IsBuyerUser]
    pagination_class = MarketplacePagination
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    def get_queryset(self):
        queryset = (
            BuyerRequirement.objects.select_related("buyer")
            .prefetch_related("quality_checks")
            .order_by("-created_at")
        )
        user = self.request.user
        if user.is_staff:
            return queryset
        return queryset.filter(buyer=user)

    def perform_create(self, serializer):
        requirement = serializer.save()
        create_quality_check(requirement)

    @action(detail=True, methods=["get"])
    def matches(self, request, pk=None):
        requirement = self.get_object()
        matches_qs = find_market_matches(requirement)
        serializer = MarketplaceBatchSerializer(matches_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

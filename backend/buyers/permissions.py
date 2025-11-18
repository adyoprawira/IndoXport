from rest_framework import exceptions, permissions


class IsBuyerUser(permissions.BasePermission):
    message = "Buyer role is required to access this endpoint."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            raise exceptions.NotAuthenticated("Authentication credentials were not provided.")
        if user.is_staff or user.is_superuser:
            return True
        return hasattr(user, "buyer_profile")

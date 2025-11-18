# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from .models import UserProfile
from django.utils.dateparse import parse_date


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            profile = user.profile  # related_name

            return Response(
                {
                    "message": "User registered",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "full_name": user.first_name,
                        "role": profile.role,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            profile = user.profile

            # Di real app, lu bakal kirim JWT / token.
            # Buat demo cukup kirim data user.
            return Response(
                {
                    "message": "Login success",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "full_name": user.first_name,
                        "role": profile.role,
                    },
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """Return a simple current-user representation for demo purposes.

    If the request has an authenticated user, return that user's info.
    Otherwise, fall back to the first existing user in the database (for dev),
    or a minimal demo payload.
    """

    def get(self, request):
        from django.contrib.auth import get_user_model

        User = get_user_model()

        user = None
        if request.user and request.user.is_authenticated:
            user = request.user
        else:
            user = User.objects.first()

        if user is None:
            # minimal demo response
            return Response(
                {
                    "user": {
                        "id": 0,
                        "username": "demo",
                        "email": "demo@example.com",
                        "full_name": "Demo User",
                        "role": "supplier",
                    }
                }
            )

        # try to include profile data if available
        profile = getattr(user, "profile", None)
        role = getattr(profile, "role", "supplier") if profile else "supplier"

        return Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "full_name": getattr(user, "first_name", "") or user.username,
                    "role": role,
                }
            }
        )


class ProfileView(APIView):
    """Get or update the user's profile data (User + UserProfile).

    GET: return consolidated user+profile fields
    PUT: accept JSON payload and update User and UserProfile accordingly
    """

    def get(self, request):
        User = get_user_model()
        if request.user and request.user.is_authenticated:
            user = request.user
        else:
            user = User.objects.first()

        if not user:
            return Response({"user": None})

        profile = getattr(user, "profile", None)

        out = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.first_name,
        }
        if profile:
            out.update({
                "role": profile.role,
                "identity_type": profile.identity_type,
                "identity_number": profile.identity_number,
                "npwp": profile.npwp,
                "full_address": profile.full_address,
                "phone": profile.phone,
                "mother_name": profile.mother_name,
                "domicile": profile.domicile,
                "birth_place": profile.birth_place,
                "birth_date": profile.birth_date.isoformat() if profile.birth_date else None,
            })

        return Response({"user": out})

    def put(self, request):
        User = get_user_model()
        if request.user and request.user.is_authenticated:
            user = request.user
        else:
            user = User.objects.first()

        if not user:
            return Response({"message": "No user to update"}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.get("user") or request.data

        # update user basic fields
        username = data.get("username")
        email = data.get("email")
        full_name = data.get("full_name") or data.get("name") or data.get("first_name")

        if username:
            user.username = username
        if email:
            user.email = email
        if full_name is not None:
            user.first_name = full_name

        user.save()

        profile = getattr(user, "profile", None)
        if not profile:
            profile = UserProfile.objects.create(user=user, role=data.get("role", "supplier"))

        # update profile fields
        for field in [
            "role",
            "identity_type",
            "identity_number",
            "npwp",
            "full_address",
            "phone",
            "mother_name",
            "domicile",
            "birth_place",
        ]:
            if field in data:
                setattr(profile, field, data.get(field) or "")

        # birth_date handling
        if "birth_date" in data and data.get("birth_date"):
            try:
                profile.birth_date = parse_date(data.get("birth_date"))
            except Exception:
                profile.birth_date = None

        profile.save()

        out = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.first_name,
            "role": profile.role,
        }
        return Response({"user": out})


class ChangePasswordView(APIView):
    """Change the authenticated user's password (or for demo, first user)."""

    def post(self, request):
        User = get_user_model()
        current = request.data.get("currentPassword") or request.data.get("current_password")
        new = request.data.get("newPassword") or request.data.get("new_password")

        if not current or not new:
            return Response({"message": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

        # choose user
        if request.user and request.user.is_authenticated:
            user = request.user
        else:
            user = User.objects.first()

        if not user:
            return Response({"message": "No user"}, status=status.HTTP_400_BAD_REQUEST)

        # verify current password
        user_auth = authenticate(username=user.username, password=current)
        if not user_auth:
            return Response({"message": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new)
        user.save()
        return Response({"message": "Password changed"})

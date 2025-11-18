# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer, LoginSerializer


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

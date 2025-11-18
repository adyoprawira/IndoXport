# accounts/serializers.py
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import UserProfile


class RegisterSerializer(serializers.Serializer):
    # User basic
    full_name = serializers.CharField()
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    # Role
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)

    # Identity
    identity_type = serializers.ChoiceField(choices=UserProfile.IDENTITY_CHOICES)
    identity_number = serializers.CharField(allow_blank=True, required=False)

    # Others
    npwp = serializers.CharField(allow_blank=True, required=False)
    full_address = serializers.CharField(allow_blank=True, required=False)
    phone = serializers.CharField(allow_blank=True, required=False)
    mother_name = serializers.CharField(allow_blank=True, required=False)
    domicile = serializers.CharField(allow_blank=True, required=False)
    birth_place = serializers.CharField(allow_blank=True, required=False)
    birth_date = serializers.DateField(required=False)

    def validate(self, attrs):
        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError("Username already taken.")
        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError("Email already registered.")
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop("full_name")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=password,
            first_name=full_name,  # bisa dipisah kalau mau
        )

        UserProfile.objects.create(
            user=user,
            role=validated_data["role"],
            identity_type=validated_data.get("identity_type"),
            identity_number=validated_data.get("identity_number", ""),
            npwp=validated_data.get("npwp", ""),
            full_address=validated_data.get("full_address", ""),
            phone=validated_data.get("phone", ""),
            mother_name=validated_data.get("mother_name", ""),
            domicile=validated_data.get("domicile", ""),
            birth_place=validated_data.get("birth_place", ""),
            birth_date=validated_data.get("birth_date", None),
        )

        return user


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs["identifier"]
        password = attrs["password"]

        # boleh login pake username atau email
        user = (
            User.objects.filter(username=identifier).first()
            or User.objects.filter(email=identifier).first()
        )

        if not user:
            raise serializers.ValidationError("User not found.")

        user = authenticate(username=user.username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials.")

        attrs["user"] = user
        return attrs

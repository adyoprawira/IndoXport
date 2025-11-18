# accounts/models.py
from django.conf import settings
from django.db import models

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("supplier", "Supplier"),
        ("buyer", "Buyer"),
        ("exporter", "Exporter"),
    ]

    IDENTITY_CHOICES = [
        ("ID_CARD", "ID Card (KTP)"),
        ("PASSPORT", "Passport"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    identity_type = models.CharField(max_length=20, choices=IDENTITY_CHOICES)
    identity_number = models.CharField(max_length=50, blank=True)

    npwp = models.CharField(max_length=50, blank=True)
    full_address = models.TextField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    mother_name = models.CharField(max_length=100, blank=True)
    domicile = models.CharField(max_length=100, blank=True)
    birth_place = models.CharField(max_length=100, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to="profile_photos/", null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

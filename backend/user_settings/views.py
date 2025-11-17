from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# Simple in-memory demo user data for the stub backend
DEMO_USER = {
    "id": 1,
    "name": "Dwi Santoso",
    "email": "dwi@example.com",
    "company": "UD. SeaHarvest",
    "companyWebsite": "https://www.seaharvest.example",
    "registrationNumber": "SIUP-2025-0001",
    "taxId": "NPWP-01-23456789",
    "businessType": "Shrimp Producer",
    "yearsInBusiness": 12,
    "annualVolumeTons": 250,
    "phone": "+62 812-3456-7890",
    "address": "Jl. Pantai No. 10, Surabaya",
    "warehouseAddress": "Jl. Gudang No. 2, Surabaya",
    "region": "East Java",
    "farmLocation": "Banyuwangi",
    "contactPerson": {"name": "Asep Rahmat", "phone": "+62 812-9988-7766", "email": "asep@seaharvest.example"},
    # Certifications used by settings form
    "certifications": {"HACCP": True, "ASC": False, "BAP": True},
    # Certification dates (optional)
    "certificationDates": {"HACCP": "2023-06-01", "BAP": "2022-11-15"},
    # Payment / shipping preferences
    "preferredPayment": "T/T",
    "paymentTerms": "Net 30",
    "preferredIncoterm": "FOB",
    # The frontend uses a comma-separated input for preferred ports; provide a string
    "preferredPorts": "Surabaya,Jakarta",
    # Packaging specs
    "packaging": {"type": "Insulated box", "kgPerBox": 10},
    # Notification preferences
    "notifyEmail": True,
    "notifySMS": False,
    # Masked bank account shown in settings (frontend renders as text)
    "bankAccountMasked": "**** **** **** 1234",
    "bankName": "Bank Nusantara",
    # QC thresholds used by the settings form
    "qcThresholds": {"mercury": 0.5, "antibiotics": 0.01},
    # Contacts for quality/lab
    "qualityManager": {"name": "Siti Aminah", "email": "siti@seaharvest.example"},
    "labContact": {"name": "Lab PT. AquaTest", "phone": "+62 21-5566-7788"},
    # API / integration tokens (masked)
    "apiKeyMasked": "sk_****_abcd1234",
    # Misc
    "notes": "Demo account — data reset when server restarts",
}



@csrf_exempt
def user_view(request):
    """GET returns demo user JSON. PUT accepts JSON and updates the in-memory demo user.

    This is a simple stub for frontend integration and testing.
    """
    if request.method == "GET":
        return JsonResponse({"user": DEMO_USER})

    if request.method == "PUT":
        try:
            body = request.body.decode("utf-8") or "{}"
            data = json.loads(body)
            # Accept either { "user": { ... } } or direct fields
            new_user = data.get("user") if isinstance(data, dict) and data.get("user") else data
            if not isinstance(new_user, dict):
                return HttpResponseBadRequest(json.dumps({"error": "invalid payload"}), content_type="application/json")
            # Update allowed keys
            for k, v in new_user.items():
                DEMO_USER[k] = v
            return JsonResponse({"user": DEMO_USER})
        except Exception as e:
            return HttpResponseBadRequest(json.dumps({"error": str(e)}), content_type="application/json")

    return HttpResponse(status=405)


@csrf_exempt
def change_password_view(request):
    """POST expects JSON: { currentPassword: "...", newPassword: "..." }

    For this stub we accept the current password only if it equals the demo string "oldpass".
    """
    if request.method != "POST":
        return HttpResponse(status=405)
    try:
        body = request.body.decode("utf-8") or "{}"
        data = json.loads(body)
        current = data.get("currentPassword")
        new = data.get("newPassword")
        if current is None or new is None:
            return HttpResponseBadRequest(json.dumps({"error": "missing fields"}), content_type="application/json")
        if current != "oldpass":
            return JsonResponse({"success": False, "message": "Current password incorrect"}, status=401)
        # In a real app we'd update the user's password here. For the stub, just return success.
        return JsonResponse({"success": True, "message": "Password changed (stub)"})
    except Exception as e:
        return HttpResponseBadRequest(json.dumps({"error": str(e)}), content_type="application/json")


@csrf_exempt
def profile_view(request):
    """GET returns a small profile subset. PUT accepts updates (e.g. phone, photoUrl)."""
    if request.method == "GET":
        profile = {
            "name": DEMO_USER.get("name"),
            "email": DEMO_USER.get("email"),
            "phone": DEMO_USER.get("phone"),
            "photoUrl": DEMO_USER.get("photoUrl"),
        }
        return JsonResponse({"profile": profile})

    if request.method == "PUT":
        try:
            body = request.body.decode("utf-8") or "{}"
            data = json.loads(body)
            new_profile = data.get("profile") if isinstance(data, dict) and data.get("profile") else data
            if not isinstance(new_profile, dict):
                return HttpResponseBadRequest(json.dumps({"error": "invalid payload"}), content_type="application/json")
            # update allowed small set
            for k in ("phone", "photoUrl", "name", "email"):
                if k in new_profile:
                    DEMO_USER[k] = new_profile[k]
            return JsonResponse({"profile": {"name": DEMO_USER.get("name"), "email": DEMO_USER.get("email"), "phone": DEMO_USER.get("phone"), "photoUrl": DEMO_USER.get("photoUrl")}})
        except Exception as e:
            return HttpResponseBadRequest(json.dumps({"error": str(e)}), content_type="application/json")


@csrf_exempt
def profile_photo_view(request):
    """Accepts multipart/form-data with a file field 'file'. Saves to MEDIA_ROOT/uploads and returns photoUrl."""
    if request.method != "POST":
        return HttpResponse(status=405)
    try:
        # ensure uploads dir exists
        media_root = getattr(settings, "MEDIA_ROOT", None)
        media_url = getattr(settings, "MEDIA_URL", "/media/")
        if not media_root:
            media_root = os.path.join(settings.BASE_DIR, "media")
        uploads_dir = os.path.join(media_root, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        # handle file
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return HttpResponseBadRequest(json.dumps({"error": "no file uploaded"}), content_type="application/json")

        filename = default_storage.get_available_name(os.path.join("uploads", uploaded_file.name))
        path = default_storage.save(filename, ContentFile(uploaded_file.read()))
        photo_url = media_url + os.path.basename(path)

        # Save to demo user
        DEMO_USER["photoUrl"] = photo_url

        return JsonResponse({"photoUrl": photo_url})
    except Exception as e:
        return HttpResponseBadRequest(json.dumps({"error": str(e)}), content_type="application/json")

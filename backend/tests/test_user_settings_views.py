import copy
import json
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402
from django.conf import settings  # noqa: E402
from django.core.files.uploadedfile import SimpleUploadedFile  # noqa: E402
from django.test import Client, override_settings  # noqa: E402

django.setup()

import pytest  # noqa: E402

from user_settings.views import DEMO_USER  # noqa: E402


@pytest.fixture(autouse=True)
def reset_demo_user():
    snapshot = copy.deepcopy(DEMO_USER)
    try:
        yield
    finally:
        DEMO_USER.clear()
        DEMO_USER.update(copy.deepcopy(snapshot))


@pytest.fixture(autouse=True)
def allow_test_host():
    original = list(settings.ALLOWED_HOSTS)
    if "testserver" not in settings.ALLOWED_HOSTS:
        settings.ALLOWED_HOSTS.append("testserver")
    yield
    settings.ALLOWED_HOSTS = original


def test_user_view_get_returns_demo_payload():
    client = Client()
    response = client.get("/api/user/")
    assert response.status_code == 200
    body = response.json()
    assert "user" in body
    assert body["user"]["email"] == DEMO_USER["email"]


def test_user_view_put_updates_demo_payload():
    client = Client()
    payload = {"user": {"name": "New Demo", "notes": "Updated"}}
    response = client.put(
        "/api/user/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json()["user"]["name"] == "New Demo"
    assert DEMO_USER["name"] == "New Demo"
    assert DEMO_USER["notes"] == "Updated"


def test_change_password_view_handles_success_and_failure():
    client = Client()
    bad = client.post(
        "/api/change-password/",
        data=json.dumps({"currentPassword": "wrong", "newPassword": "abc"}),
        content_type="application/json",
    )
    assert bad.status_code == 401
    good = client.post(
        "/api/change-password/",
        data=json.dumps({"currentPassword": "oldpass", "newPassword": "abc"}),
        content_type="application/json",
    )
    assert good.status_code == 200
    assert good.json()["success"] is True


def test_profile_view_get_and_put_roundtrip():
    client = Client()
    response = client.get("/api/profile/")
    assert response.status_code == 200
    assert response.json()["profile"]["email"] == DEMO_USER["email"]

    payload = {"profile": {"phone": "+62 800-1111"}}
    update = client.put(
        "/api/profile/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert update.status_code == 200
    assert update.json()["profile"]["phone"] == "+62 800-1111"
    assert DEMO_USER["phone"] == "+62 800-1111"


def test_user_view_put_invalid_payload_returns_400():
    client = Client()
    response = client.put(
        "/api/user/",
        data="[]",
        content_type="application/json",
    )
    assert response.status_code == 400


def test_profile_photo_upload_and_missing_file(tmp_path):
    uploads = tmp_path / "uploads"
    uploads.mkdir()
    media_root = tmp_path

    @override_settings(MEDIA_ROOT=str(media_root), MEDIA_URL="/media/")
    def run_upload():
        client = Client()
        upload = SimpleUploadedFile("avatar.png", b"fake-bytes", content_type="image/png")
        response = client.post("/api/profile/photo/", {"file": upload})
        assert response.status_code == 200
        assert response.json()["photoUrl"].startswith("/media/")
        assert DEMO_USER["photoUrl"].startswith("/media/")

        missing = client.post("/api/profile/photo/", {})
        assert missing.status_code == 400

    run_upload()

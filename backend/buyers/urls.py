from __future__ import annotations

from django.urls import path

from buyers.views import matches_view, revalidate_view, requirements_view

urlpatterns = [
    path("api/requirements/", requirements_view, name="requirements"),
    path(
        "api/requirements/<int:pk>/matches/",
        matches_view,
        name="requirement_matches",
    ),
    path(
        "api/requirements/<int:pk>/revalidate/",
        revalidate_view,
        name="requirement_revalidate",
    ),
]

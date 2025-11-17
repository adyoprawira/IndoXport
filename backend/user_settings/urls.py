from django.urls import path
from . import views

urlpatterns = [
    path("user/", views.user_view, name="user"),
    path("change-password/", views.change_password_view, name="change_password"),
    path("profile/", views.profile_view, name="profile"),
    path("profile/photo/", views.profile_photo_view, name="profile_photo"),
]

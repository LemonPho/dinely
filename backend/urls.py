# backend/urls.py (or config/urls.py)
from django.urls import path
from .views.authentication.authentication import get_csrf_token, register, login_view, get_current_user

urlpatterns = [
    path("authentication/csrf/", get_csrf_token),
    path("authentication/register/", register),
    path("authentication/login/", login_view),
    path("user/get-current-user/", get_current_user)
]
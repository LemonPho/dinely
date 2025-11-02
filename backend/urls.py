# backend/urls.py (or config/urls.py)
from django.urls import path
from .views.authentication import get_csrf_token

urlpatterns = [
    path("csrf/", get_csrf_token),
]
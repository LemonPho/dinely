# backend/urls.py (or config/urls.py)
from django.urls import path

from backend.views.admin.plates import create_plate_category, edit_plate_category, get_plate_categories
from backend.views.admin.users import create_user
from .views.authentication.authentication import get_csrf_token, register, login_view, get_current_user, set_password

urlpatterns = [
    path("admin/create-user/", create_user),

    path("admin/create-plate-category/", create_plate_category),
    path("admin/edit-plate-category", edit_plate_category),
    path("admin/get-plate-categories/", get_plate_categories),

    path("authentication/csrf/", get_csrf_token),
    path("authentication/register/", register),
    path("authentication/login/", login_view),
    path("authentication/set-password/", set_password),

    path("user/get-current-user/", get_current_user)
]
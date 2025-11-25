# backend/urls.py (or config/urls.py)
from django.urls import path
from backend.views.admin.users import list_users
from backend.views.admin import users
from backend.views.authentication import authentication


from backend.views.admin.users import create_user
from .views.authentication.authentication import get_csrf_token, register, login_view, get_current_user, set_password

urlpatterns = [
    path("admin/create-user/", users.create_user),
    path("admin/list-users/", users.list_users),

    path("authentication/csrf/", authentication.get_csrf_token),
    path("authentication/register/", authentication.register),
    path("authentication/login/", authentication.login_view),
    path("authentication/set-password/", authentication.set_password),
    path("user/get-current-user/", authentication.get_current_user),
]

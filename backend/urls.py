# backend/urls.py (or config/urls.py)
from django.urls import path
from backend.views.admin.users import list_users
from backend.views.admin import users
from backend.views.authentication import authentication


from backend.views.admin.plates import create_plate_category, edit_plate_category, delete_plate_category, get_plate_categories, create_plate, edit_plate, delete_plate, get_plates
from backend.views.admin.users import create_user, edit_user, delete_user
from backend.views.admin.tables import create_table_area, edit_table_area, delete_table_area, get_table_areas, create_table, edit_table, delete_table, get_tables
from backend.views.admin.reservations import create_reservation, edit_reservation, delete_reservation, get_reservations
from .views.authentication.authentication import get_csrf_token, register, login_view, get_current_user, set_password

urlpatterns = [
    path("admin/create-user/", users.create_user),
    path("admin/edit-user/", users.edit_user),
    path("admin/delete-user/", users.delete_user),
    path("admin/list-users/", users.list_users),

    path("admin/create-plate-category/", create_plate_category),
    path("admin/edit-plate-category/", edit_plate_category),
    path("admin/delete-plate-category/", delete_plate_category),
    path("admin/get-plate-categories/", get_plate_categories),
    path("admin/create-plate/", create_plate),
    path("admin/edit-plate/", edit_plate),
    path("admin/delete-plate/", delete_plate),
    path("admin/get-plates/", get_plates),

    path("admin/create-table-area/", create_table_area),
    path("admin/edit-table-area/", edit_table_area),
    path("admin/delete-table-area/", delete_table_area),
    path("admin/get-table-areas/", get_table_areas),
    path("admin/create-table/", create_table),
    path("admin/edit-table/", edit_table),
    path("admin/delete-table/", delete_table),
    path("admin/get-tables/", get_tables),

    path("admin/create-reservation/", create_reservation),
    path("admin/edit-reservation/", edit_reservation),
    path("admin/delete-reservation/", delete_reservation),
    path("admin/get-reservations/", get_reservations),

    path("authentication/csrf/", authentication.get_csrf_token),
    path("authentication/register/", authentication.register),
    path("authentication/login/", authentication.login_view),
    path("authentication/set-password/", authentication.set_password),

    path("user/get-current-user/", authentication.get_current_user),
]
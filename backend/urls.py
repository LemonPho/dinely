# backend/urls.py (or config/urls.py)
from django.urls import path
from backend.views.admin import plates, users, tables, reservations
from backend.views.user import reservations as user_reservations
from backend.views import shared
from backend.views.authentication import authentication
from backend.views.reviews import reviews

urlpatterns = [
    path("admin/create-user/", users.create_user),
    path("admin/edit-user/", users.edit_user),
    path("admin/delete-user/", users.delete_user),
    path("admin/list-users/", users.list_users),

    path("admin/create-plate-category/", plates.create_plate_category),
    path("admin/edit-plate-category/", plates.edit_plate_category),
    path("admin/delete-plate-category/", plates.delete_plate_category),
    path("admin/get-plate-categories/", shared.get_plate_categories),
    path("admin/create-plate/", plates.create_plate),
    path("admin/edit-plate/", plates.edit_plate),
    path("admin/delete-plate/", plates.delete_plate),
    path("admin/get-plates/", shared.get_plates),

    path("admin/create-table-area/", tables.create_table_area),
    path("admin/edit-table-area/", tables.edit_table_area),
    path("admin/delete-table-area/", tables.delete_table_area),
    path("admin/get-table-areas/", shared.get_table_areas),
    path("admin/create-table/", tables.create_table),
    path("admin/edit-table/", tables.edit_table),
    path("admin/delete-table/", tables.delete_table),
    path("admin/get-tables/", shared.get_tables),

    path("admin/create-reservation/", reservations.create_reservation),
    path("admin/edit-reservation/", reservations.edit_reservation),
    path("admin/delete-reservation/", reservations.delete_reservation),
    path("admin/get-reservations/", shared.get_reservations),

    path("authentication/csrf/", authentication.get_csrf_token),
    path("authentication/register/", authentication.register),
    path("authentication/login/", authentication.login_view),
    path("authentication/set-password/", authentication.set_password),
    path("authentication/logout/", authentication.logout_view),

    path("user/get-current-user/", authentication.get_current_user),
    path("user/create-reservation/", user_reservations.create_user_reservation),
    path("user/get-reservation/", user_reservations.get_user_reservation),
    path("user/edit-reservation/", user_reservations.edit_user_reservation),
    path("user/cancel-reservation/", user_reservations.cancel_user_reservation),
    path("user/get-table-areas/", shared.get_table_areas),
    
    path("review/create-review/", reviews.create_review),
    path("review/get-reviews/", reviews.get_reviews),
]
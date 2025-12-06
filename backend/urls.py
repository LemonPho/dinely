# backend/urls.py (or config/urls.py)
from django.urls import path
from backend.views.admin import plates, users, tables, reservations
from backend.views.user import reservations as user_reservations
from backend.views import shared
from backend.views.authentication import authentication
from backend.views.reviews import reviews
from backend.views.waiter import bills as waiter_bills, reservations as waiter_reservations

urlpatterns = [
    path("admin/create-user/", users.create_user),
    path("admin/edit-user/", users.edit_user),
    path("admin/delete-user/", users.delete_user),
    path("admin/list-users/", users.list_users),

    path("admin/create-plate-category/", plates.create_plate_category),
    path("admin/edit-plate-category/", plates.edit_plate_category),
    path("admin/delete-plate-category/", plates.delete_plate_category),
    path("admin/create-plate/", plates.create_plate),
    path("admin/edit-plate/", plates.edit_plate),
    path("admin/delete-plate/", plates.delete_plate),

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
    path("admin/get-bills/", shared.get_bills),

    path("authentication/csrf/", authentication.get_csrf_token),
    path("authentication/register/", authentication.register),
    path("authentication/login/", authentication.login_view),
    path("authentication/set-password/", authentication.set_password),
    path("authentication/verify-email/", authentication.verify_email),
    path("authentication/logout/", authentication.logout_view),

    path("user/get-current-user/", authentication.get_current_user),
    path("user/create-reservation/", user_reservations.create_user_reservation),
    path("user/get-reservation/", user_reservations.get_user_reservation),
    path("user/get-reservations/", user_reservations.get_user_reservations),
    path("user/edit-reservation/", user_reservations.edit_user_reservation),
    path("user/cancel-reservation/", user_reservations.cancel_user_reservation),
    path("user/get-table-areas/", shared.get_table_areas),
    
    path("review/create-review/", reviews.create_review),
    path("review/get-reviews/", reviews.get_reviews),

    path("plates/get-plate-categories/", shared.get_plate_categories),
    path("plates/get-plates/", shared.get_plates),

    path("kitchen/get-bills/", shared.get_bills),
    path("waiter/get-bills/", waiter_bills.get_waiter_bills),
    path("waiter/get-bill/<int:bill_id>/", waiter_bills.get_waiter_bill),
    path("waiter/add-plate-to-bill/<int:bill_id>/", waiter_bills.add_plate_to_bill),
    path("waiter/finalize-bill/<int:bill_id>/", waiter_bills.finalize_bill),
    path("waiter/get-reservations/", waiter_reservations.get_waiter_reservations),
    path("waiter/assign-table-to-reservation/<int:reservation_id>/", waiter_reservations.assign_table_to_reservation),
]
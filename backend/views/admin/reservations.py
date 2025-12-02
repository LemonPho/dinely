import json
from django.http import HttpResponse, JsonResponse

from backend.models import Reservation
from backend.serializers.reservations import AdminCreateReservationSerializer, ReadReservationSerializer
from backend.views.admin.validators import validate_create_reservation

def create_reservation(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)

    # Validate data
    response = validate_create_reservation(data)

    if not response["okay"]:
        response.pop("okay")
        response.pop("data", None)
        return JsonResponse(response, status=400)

    serializer = AdminCreateReservationSerializer(data=data)
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(serializer.errors, status=400)

    reservation = serializer.save()

    # After creating, use read serializer for response
    serializer = ReadReservationSerializer(reservation)

    return JsonResponse(serializer.data, status=201)

def edit_reservation(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    reservation_id = data.get("id", False)

    if not reservation_id:
        return HttpResponse(status=400)

    # Validate that reservation exists
    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return HttpResponse(status=404)

    # Validate data
    response = validate_create_reservation(data)

    if not response["okay"]:
        response.pop("okay")
        response.pop("data", None)
        return JsonResponse(response, status=400)

    # Update reservation using serializer
    serializer = AdminCreateReservationSerializer(reservation, data=data, partial=True)
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(serializer.errors, status=400)

    serializer.save()

    # Return only status code (no data)
    return HttpResponse(status=201)

def delete_reservation(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    reservation_id = data.get("id", False)

    if not reservation_id:
        return HttpResponse(status=400)

    # Validate that reservation exists
    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return HttpResponse(status=404)

    # Delete reservation
    reservation.delete()

    # Return only status code (no data)
    return HttpResponse(status=201)


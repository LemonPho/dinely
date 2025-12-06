import json
from django.http import HttpResponse, JsonResponse

from backend.models import Reservation
from backend.serializers.reservations import UserCreateReservationSerializer, ReadReservationSerializer
from backend.views.user.validators import validate_user_reservation, validate_edit_user_reservation


def _find_reservation_by_code_or_email(code, email, phone_number=None):
    """
    Helper function to find reservation by code, email, or phone number.
    If both email and phone_number are provided, email takes priority as a tie-breaker.
    Returns (reservation, error_dict) tuple.
    """
    if not code and not email and not phone_number:
        return None, {"error": "Either code, email, or phone number is required"}
    
    try:
        if code:
            reservation = Reservation.objects.get(code=code)
        elif email:
            # If searching by email, get the most recent active reservation
            # Email takes priority if both email and phone_number are provided
            reservation = Reservation.objects.filter(email=email, state="active").order_by("-date_time").first()
            if not reservation:
                # If no active reservation, get the most recent one regardless of state
                reservation = Reservation.objects.filter(email=email).order_by("-date_time").first()
                if not reservation:
                    return None, {"error": "Reservation not found"}
        elif phone_number:
            # If searching by phone number, get the most recent active reservation
            reservation = Reservation.objects.filter(phone_number=phone_number, state="active").order_by("-date_time").first()
            if not reservation:
                # If no active reservation, get the most recent one regardless of state
                reservation = Reservation.objects.filter(phone_number=phone_number).order_by("-date_time").first()
                if not reservation:
                    return None, {"error": "Reservation not found"}
    except Reservation.DoesNotExist:
        return None, {"error": "Reservation not found"}
    except Reservation.MultipleObjectsReturned:
        return None, {"error": "Multiple reservations found"}
    
    return reservation, None


def create_user_reservation(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    data = json.loads(request.body)

    # Validate data
    user = request.user if request.user.is_authenticated else None
    response = validate_user_reservation(data, user=user)

    if not response["okay"]:
        response.pop("okay")
        response.pop("data", None)
        return JsonResponse(response, status=400)

    # Pass request context to serializer for client assignment
    serializer = UserCreateReservationSerializer(data=response["data"], context={'request': request})
    if not serializer.is_valid():
        return JsonResponse(serializer.errors, status=400)

    reservation = serializer.save()

    # After creating, use read serializer for response
    serializer = ReadReservationSerializer(reservation)

    return JsonResponse(serializer.data, status=201)


def get_user_reservation(request):
    if not request.method == "GET":
        return HttpResponse(status=405)

    # Get query parameters
    code = request.GET.get("code", None)
    email = request.GET.get("email", None)
    phone_number = request.GET.get("phone_number", None)

    # At least one parameter is required
    if not code and not email and not phone_number:
        return JsonResponse({"error": "Either code, email, or phone number is required"}, status=400)

    # Try to find reservation by code, email, or phone number
    # If both email and phone_number are provided, email takes priority as a tie-breaker
    try:
        if code:
            reservation = Reservation.objects.get(code=code, state="active")
        elif email:
            # If searching by email, get the most recent active reservation
            # Email takes priority if both email and phone_number are provided
            reservation = Reservation.objects.filter(email=email, state="active").order_by("-date_time").first()
            if not reservation:
                # If no active reservation, get the most recent one regardless of state
                reservation = Reservation.objects.filter(email=email).order_by("-date_time").first()
                if not reservation:
                    return JsonResponse({"error": "Reservation not found"}, status=404)
        elif phone_number:
            # If searching by phone number, get the most recent active reservation
            reservation = Reservation.objects.filter(phone_number=phone_number, state="active").order_by("-date_time").first()
            if not reservation:
                # If no active reservation, get the most recent one regardless of state
                reservation = Reservation.objects.filter(phone_number=phone_number).order_by("-date_time").first()
                if not reservation:
                    return JsonResponse({"error": "Reservation not found"}, status=404)
    except Reservation.DoesNotExist:
        return JsonResponse({"error": "Reservation not found"}, status=404)

    # Serialize and return reservation
    serializer = ReadReservationSerializer(reservation)
    return JsonResponse(serializer.data, status=200)


def get_user_reservations(request):
    """
    Get all reservations for the authenticated user, by email, or by phone number.
    Returns all reservations (active and cancelled) ordered by date_time descending.
    """
    if not request.method == "GET":
        return HttpResponse(status=405)

    # Get query parameters
    email = request.GET.get("email", None)
    phone_number = request.GET.get("phone_number", None)
    
    # If user is authenticated, use their email
    if request.user.is_authenticated:
        reservations = Reservation.objects.filter(email=request.user.email).order_by("-date_time")
    elif email:
        # Email takes priority if both email and phone_number are provided
        reservations = Reservation.objects.filter(email=email).order_by("-date_time")
    elif phone_number:
        reservations = Reservation.objects.filter(phone_number=phone_number).order_by("-date_time")
    else:
        return JsonResponse({"error": "Authentication required, or email/phone_number parameter needed"}, status=400)

    # Serialize and return reservations
    serializer = ReadReservationSerializer(reservations, many=True)
    return JsonResponse({"reservations": serializer.data}, status=200)


def edit_user_reservation(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    data = json.loads(request.body)

    # Get code, email, or phone_number from request body
    code = data.get("code", None)
    email = data.get("email", None)
    phone_number = data.get("phone_number", None)

    # Find reservation
    reservation, error = _find_reservation_by_code_or_email(code, email, phone_number)
    if error:
        if "not found" in error["error"].lower():
            return JsonResponse(error, status=404)
        return JsonResponse(error, status=400)

    # Validate edit data
    user = request.user if request.user.is_authenticated else None
    edit_data = {
        "date_time": data.get("date_time"),
        "table_area": data.get("table_area"),
        "amount_people": data.get("amount_people"),
        "notes": data.get("notes"),
    }
    
    validation_response = validate_edit_user_reservation(edit_data, user=user)

    if not validation_response["okay"]:
        validation_response.pop("okay")
        validation_response.pop("data", None)
        return JsonResponse(validation_response, status=400)

    # Update reservation using serializer
    serializer = UserCreateReservationSerializer(
        reservation,
        data=validation_response["data"],
        partial=True,
        context={'request': request}
    )
    
    if not serializer.is_valid():
        return JsonResponse(serializer.errors, status=400)

    updated_reservation = serializer.save()

    # Return updated reservation
    serializer = ReadReservationSerializer(updated_reservation)
    return JsonResponse(serializer.data, status=201)


def cancel_user_reservation(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    data = json.loads(request.body)

    # Get code, email, or phone_number from request body
    code = data.get("code", None)
    email = data.get("email", None)
    phone_number = data.get("phone_number", None)

    # Find reservation
    reservation, error = _find_reservation_by_code_or_email(code, email, phone_number)
    if error:
        if "not found" in error["error"].lower():
            return JsonResponse(error, status=404)
        return JsonResponse(error, status=400)

    # Check if already cancelled
    if reservation.state == "cancelled":
        return JsonResponse({"error": "Reservation is already cancelled"}, status=400)

    # Set state to cancelled
    reservation.state = "cancelled"
    reservation.save()

    # Return updated reservation
    serializer = ReadReservationSerializer(reservation)
    return JsonResponse(serializer.data, status=201)


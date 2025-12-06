import json
from datetime import datetime
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from backend.models import Reservation, Table, Bill
from backend.serializers.reservations import ReadReservationSerializer
from backend.views.validators import validate_assign_table_to_reservation
from backend.views.admin.utils import generate_bill_code, get_waiter_with_least_bills


def get_waiter_reservations(request):
    if not request.method == "GET":
        return HttpResponse(status=405)
    if not request.user.is_authenticated or not (request.user.is_waiter or request.user.is_kitchen or request.user.is_admin):
        return HttpResponse(status=401)
    
    # Get today's date in restaurant's local timezone (America/Mexico_City)
    import pytz
    from datetime import datetime
    restaurant_tz = pytz.timezone('America/Mexico_City')
    utc_tz = pytz.UTC
    
    # Get current time in restaurant's timezone
    now_local = timezone.now().astimezone(restaurant_tz)
    today_local = now_local.date()
    
    # Create start and end of day in restaurant's timezone, then convert to UTC for filtering
    start_of_day_local = restaurant_tz.localize(
        datetime.combine(today_local, datetime.min.time())
    )
    end_of_day_local = restaurant_tz.localize(
        datetime.combine(today_local, datetime.max.time())
    )
    
    # Convert to UTC for database query
    start_of_day_utc = start_of_day_local.astimezone(utc_tz)
    end_of_day_utc = end_of_day_local.astimezone(utc_tz)
    
    reservations = Reservation.objects.filter(
        state="active",
        date_time__gte=start_of_day_utc,
        date_time__lte=end_of_day_utc
    ).order_by('date_time')
    
    serializer = ReadReservationSerializer(reservations, many=True)
    return JsonResponse({"reservations": serializer.data}, status=200)


def assign_table_to_reservation(request, reservation_id):
    if not request.method == "POST":
        return HttpResponse(status=405)
    if not request.user.is_authenticated or not request.user.is_waiter:
        return HttpResponse(status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    table_code = data.get("table_code")
    
    validation_result = validate_assign_table_to_reservation(reservation_id, table_code, request.user)
    
    if not validation_result["okay"]:
        response_data = validation_result.copy()
        response_data.pop("reservation", None)
        response_data.pop("table", None)
        response_data.pop("okay", None)
        return JsonResponse(response_data, status=400)
    
    reservation = validation_result["reservation"]
    table = validation_result["table"]
    
    reservation.table = table
    reservation.state = "in_course"  # Change state to indicate reservation is in progress
    reservation.save()
    
    # Mark table as occupied when assigned to a reservation
    table.state = "occupied"
    table.save()
    
    # Create bill automatically after table assignment
    # Find waiter with least number of current bills
    waiter = get_waiter_with_least_bills()
    
    if waiter is None:
        # If no waiters available, return error
        return JsonResponse({"error": "No waiters available to assign"}, status=500)
    
    # Generate bill code
    bill_code = generate_bill_code()
    
    # Create bill
    bill = Bill.objects.create(
        code=bill_code,
        table=table,
        waiter=waiter,
        state="current",
        total=0.0,
        total_paid=0.0,
        tip=0
    )
    
    reservation.refresh_from_db()
    serializer = ReadReservationSerializer(reservation)
    return JsonResponse(serializer.data, status=200)

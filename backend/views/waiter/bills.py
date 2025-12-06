import json
from django.http import JsonResponse, HttpResponse

from backend.models import Bill, Table, Reservation
from backend.serializers.bills import ReadBillSerializer, CreateBillPlateSerializer
from backend.views.validators import validate_add_plate_to_bill, validate_finalize_bill
from backend.views.admin.utils import generate_bill_code, get_waiter_with_least_bills


def create_bill(request):
    """
    Create a bill with automatic waiter selection.
    Only accessible to authenticated waiters or admins.
    Automatically selects the waiter with the least number of current bills.
    """
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not (request.user.is_waiter or request.user.is_admin):
        return HttpResponse(status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Get table ID from request
    table_id = data.get("table")
    if not table_id:
        return JsonResponse({"error": "Table is required"}, status=400)

    # Validate table exists
    try:
        table = Table.objects.get(id=table_id)
    except Table.DoesNotExist:
        return JsonResponse({"error": "Table not found"}, status=404)

    # Check if table is already occupied by an active bill
    if Bill.objects.filter(table=table, state="current").exists():
        return JsonResponse({"error": "Table is already occupied"}, status=400)

    # Automatically select waiter with least bills
    waiter = get_waiter_with_least_bills()
    if waiter is None:
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

    # Mark table as occupied
    table.state = "occupied"
    table.save()

    # Return created bill
    bill.refresh_from_db()
    serializer = ReadBillSerializer(bill)
    return JsonResponse(serializer.data, status=201)


def get_waiter_bills(request):
    """
    Get bills filtered by the current waiter user.
    Only accessible to authenticated waiters.
    """
    if not request.method == "GET":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_waiter:
        return HttpResponse(status=401)

    # Filter bills by the current waiter user
    bills = Bill.objects.prefetch_related('plates__plate').filter(waiter=request.user)
    serializer = ReadBillSerializer(bills, many=True)

    return JsonResponse({"bills": serializer.data}, status=200)


def get_waiter_bill(request, bill_id):
    """
    Get a single bill by ID, only if it belongs to the current waiter user.
    Only accessible to authenticated waiters.
    """
    if not request.method == "GET":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_waiter:
        return HttpResponse(status=401)

    try:
        # Get bill and verify it belongs to the current waiter
        bill = Bill.objects.prefetch_related('plates__plate').get(id=bill_id, waiter=request.user)
        serializer = ReadBillSerializer(bill)
        return JsonResponse(serializer.data, status=200)
    except Bill.DoesNotExist:
        return JsonResponse({"error": "Bill not found"}, status=404)


def add_plate_to_bill(request, bill_id):
    """
    Add a plate to a bill. Only accessible to authenticated waiters who own the bill.
    Creates multiple BillPlate objects if quantity > 1.
    Updates the bill total automatically.
    """
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_waiter:
        return HttpResponse(status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Validate using validator
    validation_result = validate_add_plate_to_bill(bill_id, data, request.user)

    if not validation_result["okay"]:
        # Return validation result (frontend will extract error messages)
        # Remove bill object, plate object, and okay flag
        response_data = validation_result.copy()
        response_data.pop("bill", None)
        response_data.pop("plate", None)
        response_data.pop("okay", None)
        
        return JsonResponse(response_data, status=400)

    # Get validated objects from result
    bill = validation_result["bill"]
    plate = validation_result["plate"]
    quantity = validation_result["quantity"]
    notes = validation_result["notes"]

    # Create BillPlate objects (one per quantity)
    created_bill_plates = []
    for _ in range(quantity):
        bill_plate_data = {
            "plate_id": plate.id,
            "notes": notes,
        }
        serializer = CreateBillPlateSerializer(data=bill_plate_data)
        if not serializer.is_valid():
            return JsonResponse(serializer.errors, status=400)
        
        bill_plate = serializer.save(account=bill)
        created_bill_plates.append(bill_plate)

    # Update bill total
    bill.total += plate.price * quantity
    bill.save()

    # Return updated bill
    bill.refresh_from_db()
    bill = Bill.objects.prefetch_related('plates__plate').get(id=bill_id)
    serializer = ReadBillSerializer(bill)
    return JsonResponse(serializer.data, status=200)


def finalize_bill(request, bill_id):
    """
    Finalize a bill by updating its state to 'closed' and setting total_paid and tip.
    Only accessible to authenticated waiters who own the bill.
    """
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_waiter:
        return HttpResponse(status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Validate using validator
    validation_result = validate_finalize_bill(bill_id, data, request.user)

    if not validation_result["okay"]:
        # Return validation result (frontend will extract error messages)
        # Remove bill object and okay flag
        response_data = validation_result.copy()
        response_data.pop("bill", None)
        response_data.pop("okay", None)
        
        return JsonResponse(response_data, status=400)

    # Get validated objects from result
    bill = validation_result["bill"]
    amount_paid = validation_result["amount_paid"]
    tip_percentage = validation_result["tip_percentage"]

    # Update bill
    bill.state = "closed"
    bill.total_paid = amount_paid
    bill.tip = int(tip_percentage)
    bill.save()

    # If bill has a table, free it (set to available) and update associated reservations
    if bill.table:
        bill.table.state = 'available'
        bill.table.save()
        
        # Update associated reservations: find reservations with the same table that are in "in_course" state
        # and update them to "finalized"
        reservations_to_update = Reservation.objects.filter(
            table=bill.table,
            state="in_course"
        )
        reservations_to_update.update(state="finalized")

    # Return updated bill
    bill.refresh_from_db()
    bill = Bill.objects.prefetch_related('plates__plate').get(id=bill_id)
    serializer = ReadBillSerializer(bill)
    return JsonResponse(serializer.data, status=200)

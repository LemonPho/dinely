from backend.models import Bill, Plate, Reservation, Table
from django.utils import timezone


def validate_add_plate_to_bill(bill_id, data, user):
    """
    Validate adding a plate to a bill.
    Returns a dictionary with validation results and the bill/plate objects if valid.
    Error messages are assigned to keys when validation fails.
    """
    result = {
        "bill_valid": True,
        "bill": None,
        "plate_valid": True,
        "plate": None,
        "quantity_valid": True,
        "quantity": 1,
        "notes_valid": True,
        "notes": "",
        "okay": True
    }

    # Validate bill_id
    if not bill_id:
        result["bill_valid"] = "Bill ID is required"
        result["okay"] = False
        return result

    # Validate bill exists and belongs to waiter
    try:
        bill = Bill.objects.prefetch_related('plates__plate').get(id=bill_id, waiter=user)
        result["bill"] = bill
    except Bill.DoesNotExist:
        result["bill_valid"] = "Bill not found"
        result["okay"] = False
        return result

    # Check if bill is closed
    if bill.state == "closed":
        result["bill_valid"] = "Cannot add plates to a closed bill"
        result["okay"] = False
        return result

    # Validate plate_id
    plate_id = data.get("plate_id")
    if not plate_id:
        result["plate_valid"] = "plate_id is required"
        result["okay"] = False
        return result

    # Validate plate exists
    try:
        plate = Plate.objects.get(id=plate_id)
        result["plate"] = plate
    except Plate.DoesNotExist:
        result["plate_valid"] = "Plate not found"
        result["okay"] = False
        return result

    # Validate quantity
    quantity = data.get("quantity", 1)
    try:
        quantity = int(quantity)
        if quantity < 1:
            result["quantity_valid"] = "quantity must be at least 1"
            result["okay"] = False
            return result
        result["quantity"] = quantity
    except (ValueError, TypeError):
        result["quantity_valid"] = "quantity must be a valid integer"
        result["okay"] = False
        return result

    # Validate notes (optional, max length 1024)
    notes = data.get("notes", "")
    if notes and len(notes) > 1024:
        result["notes_valid"] = "notes must be less than 1024 characters"
        result["okay"] = False
        return result
    result["notes"] = notes

    return result


def validate_finalize_bill(bill_id, data, user):
    """
    Validate finalizing a bill.
    Returns a dictionary with validation results and the bill object if valid.
    Error messages are assigned to keys when validation fails.
    """
    result = {
        "bill_valid": True,
        "bill": None,
        "amount_paid_valid": True,
        "amount_paid": None,
        "tip_percentage_valid": True,
        "tip_percentage": 0,
        "amount_sufficient_valid": True,
        "okay": True
    }

    # Validate bill_id
    if not bill_id:
        result["bill_valid"] = "Bill ID is required"
        result["okay"] = False
        return result

    # Validate bill exists and belongs to waiter
    try:
        bill = Bill.objects.get(id=bill_id, waiter=user)
        result["bill"] = bill
    except Bill.DoesNotExist:
        result["bill_valid"] = "Bill not found"
        result["okay"] = False
        return result

    # Check if bill is already closed
    if bill.state == "closed":
        result["bill_valid"] = "Bill is already closed"
        result["okay"] = False
        return result

    # Validate amount_paid
    amount_paid = data.get("amount_paid")
    if amount_paid is None:
        result["amount_paid_valid"] = "amount_paid is required"
        result["okay"] = False
        return result

    try:
        amount_paid = float(amount_paid)
        if amount_paid < 0:
            result["amount_paid_valid"] = "amount_paid must be non-negative"
            result["okay"] = False
            return result
        result["amount_paid"] = amount_paid
    except (ValueError, TypeError):
        result["amount_paid_valid"] = "amount_paid must be a valid number"
        result["okay"] = False
        return result

    # Validate tip_percentage
    tip_percentage = data.get("tip_percentage", 0)
    try:
        tip_percentage = float(tip_percentage) if tip_percentage else 0
        if tip_percentage < 0 or tip_percentage > 100:
            result["tip_percentage_valid"] = "tip_percentage must be between 0 and 100"
            result["okay"] = False
            return result
        result["tip_percentage"] = tip_percentage
    except (ValueError, TypeError):
        result["tip_percentage_valid"] = "tip_percentage must be a valid number"
        result["okay"] = False
        return result

    # Check if amount paid is at least the total with tip
    tip_amount = (bill.total * tip_percentage) / 100
    total_with_tip = bill.total + tip_amount
    
    if amount_paid < total_with_tip:
        result["amount_sufficient_valid"] = f"Amount paid must be at least ${total_with_tip:.2f} MXN"
        result["okay"] = False
        return result

    return result


def validate_assign_table_to_reservation(reservation_id, table_code, user):
    """
    Validate assigning a table to a reservation.
    Returns a dictionary with validation results and the reservation/table objects if valid.
    Error messages are assigned to keys when validation fails.
    """
    result = {
        "reservation_valid": True,
        "reservation": None,
        "table_code_valid": True,
        "table": None,
        "okay": True
    }

    # Validate reservation_id
    if not reservation_id:
        result["reservation_valid"] = "Reservation ID is required"
        result["okay"] = False
        return result

    # Validate reservation exists
    try:
        reservation = Reservation.objects.get(id=reservation_id)
        result["reservation"] = reservation
    except Reservation.DoesNotExist:
        result["reservation_valid"] = "Reservation not found"
        result["okay"] = False
        return result

    # Validate reservation state is "active"
    if reservation.state != "active":
        result["reservation_valid"] = "Reservation is not active"
        result["okay"] = False
        return result

    # Validate reservation is for today (in restaurant's local timezone)
    import pytz
    restaurant_tz = pytz.timezone('America/Mexico_City')
    today_local = timezone.now().astimezone(restaurant_tz).date()
    
    # Convert reservation date_time to restaurant's local timezone for comparison
    if reservation.date_time.tzinfo:
        reservation_date_local = reservation.date_time.astimezone(restaurant_tz).date()
    else:
        # If naive, assume UTC
        from django.utils import timezone as tz
        utc_dt = tz.make_aware(reservation.date_time, tz.utc)
        reservation_date_local = utc_dt.astimezone(restaurant_tz).date()
    
    if reservation_date_local != today_local:
        result["reservation_valid"] = "Reservation is not for today"
        result["okay"] = False
        return result

    # Validate table_code
    if not table_code:
        result["table_code_valid"] = "table_code is required"
        result["okay"] = False
        return result

    # Validate table exists by code
    try:
        table = Table.objects.get(code=table_code)
        result["table"] = table
    except Table.DoesNotExist:
        result["table_code_valid"] = "Table not found"
        result["okay"] = False
        return result

    # Validate table is available (state check)
    if table.state != "available":
        result["table_code_valid"] = f"Table is not available (current state: {table.state})"
        result["okay"] = False
        return result

    return result

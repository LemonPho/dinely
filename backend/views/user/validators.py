from django.utils import timezone
from datetime import datetime

from backend.models import TableArea


def validate_user_reservation(data, user=None):
    """
    Validate user reservation data.
    If user is None (not authenticated), name is required.
    If user is authenticated, name/email/phone_number will be overridden by user data.
    """
    result = {
        "valid_name": True,
        "valid_email": True,
        "valid_phone_number": True,
        "valid_date_time": True,
        "valid_table_area": True,
        "valid_amount_people": True,
        "valid_notes": True,
        "data": data,
        "okay": True
    }

    name = data.get("name", False)
    email = data.get("email", False)
    phone_number = data.get("phone_number", False)
    date_time = data.get("date_time", False)
    table_area = data.get("table_area", False)
    amount_people = data.get("amount_people", False)
    notes = data.get("notes", False)

    # Validate name (required only if user is not authenticated)
    if user is None:
        if not name or not name.strip():
            result["valid_name"] = False
            result["okay"] = False
    else:
        result["data"]["name"] = user.name
        result["data"]["email"] = user.email
        result["data"]["phone_number"] = user.phone_number
    # If user is authenticated, name will be overridden by user data, so no validation needed

    # Validate email (optional, but if provided should be valid format)
    if email:
        # Basic email validation
        if "@" not in email or "." not in email.split("@")[1]:
            result["valid_email"] = False
            result["okay"] = False

    # Validate phone_number (optional, no validation needed if provided)

    # Validate date_time (required, valid datetime, not in past)
    if not date_time:
        result["valid_date_time"] = False
        result["okay"] = False
    else:
        try:
            # Parse the datetime string
            if isinstance(date_time, str):
                dt = datetime.fromisoformat(date_time.replace('Z', '+00:00'))
            else:
                dt = date_time
            
            # Check if datetime is in the past
            if dt < timezone.now():
                result["valid_date_time"] = False
                result["okay"] = False
        except (ValueError, TypeError):
            result["valid_date_time"] = False
            result["okay"] = False

    # Validate table_area (optional, but if provided must exist by label)
    if table_area:
        try:
            TableArea.objects.get(label=table_area)
        except TableArea.DoesNotExist:
            result["valid_table_area"] = False
            result["okay"] = False

    # Validate amount_people (required, > 0)
    if not amount_people or amount_people <= 0:
        result["valid_amount_people"] = False
        result["okay"] = False

    # Validate notes (optional, max length 2048 if provided)
    if notes and len(notes) > 2048:
        result["valid_notes"] = False
        result["okay"] = False

    return result


def validate_edit_user_reservation(data, user=None):
    """
    Validate user reservation edit data.
    All fields are optional for partial updates.
    Users cannot edit name, email, phone_number - these are not validated.
    """
    result = {
        "valid_date_time": True,
        "valid_table_area": True,
        "valid_amount_people": True,
        "valid_notes": True,
        "data": data,
        "okay": True
    }

    date_time = data.get("date_time", False)
    table_area = data.get("table_area", False)
    amount_people = data.get("amount_people", False)
    notes = data.get("notes", False)

    # Validate date_time (required if provided, valid datetime, not in past)
    if date_time:
        try:
            # Parse the datetime string
            if isinstance(date_time, str):
                dt = datetime.fromisoformat(date_time.replace('Z', '+00:00'))
            else:
                dt = date_time
            
            # Check if datetime is in the past
            if dt < timezone.now():
                result["valid_date_time"] = False
                result["okay"] = False
        except (ValueError, TypeError):
            result["valid_date_time"] = False
            result["okay"] = False

    # Validate table_area (optional, but if provided must exist by label)
    if table_area:
        try:
            TableArea.objects.get(label=table_area)
        except TableArea.DoesNotExist:
            result["valid_table_area"] = False
            result["okay"] = False

    # Validate amount_people (required if provided, > 0)
    if amount_people is not False and amount_people is not None:
        if amount_people <= 0:
            result["valid_amount_people"] = False
            result["okay"] = False

    # Validate notes (optional, max length 2048 if provided)
    if notes and len(notes) > 2048:
        result["valid_notes"] = False
        result["okay"] = False

    return result


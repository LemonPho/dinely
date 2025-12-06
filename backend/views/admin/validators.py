from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime

from backend.models import PlateCategory, TableArea, Table, Reservation, Bill


def validate_create_user(user):
    User = get_user_model()

    email = user.get("email", False)
    
    response = {
        "name": user.get("name", False),
        "email": email,
        "user_exists": User.objects.filter(email=email).exists() if email else False,
    }

    return response

def validate_create_plate(data):
    result = {
        "valid_price": True,
        "valid_name": True,
        "valid_description": True,
        "valid_category": True,
        "data": data,
        "okay": True
    }

    price = data.get("price", False)
    name = data.get("name", False)
    description = data.get("description", False)
    category = data.get("category", False)

    if not price or price <= 0:
        result["valid_price"] = False
        result["okay"] = False

    if not name or not name.strip():
        result["valid_name"] = False
        result["okay"] = False

    if not category:
        result["valid_category"] = False
        result['okay'] = False
    else:
        # Validar que la categoría existe por label
        try:
            PlateCategory.objects.get(label=category)
        except PlateCategory.DoesNotExist:
            result["valid_category"] = False
            result['okay'] = False

    return result

def validate_edit_plate_category(data):
    result = {
        "valid_id": True,
        "valid_label": True,
        "category_exists": True,
        "label_available": True,
        "category": None,
        "okay": True
    }

    category_id = data.get("id", False)
    new_label = data.get("label", False)

    if not category_id:
        result["valid_id"] = False
        result["okay"] = False
        return result

    if not new_label or not new_label.strip():
        result["valid_label"] = False
        result["okay"] = False
        return result

    # Validar que la categoría existe
    try:
        category = PlateCategory.objects.get(id=category_id)
        result["category"] = category
    except PlateCategory.DoesNotExist:
        result["category_exists"] = False
        result["okay"] = False
        return result

    # Validar que el nuevo label no existe (si es diferente al actual)
    if category.label != new_label.strip():
        try:
            existing_category = PlateCategory.objects.get(label=new_label.strip())
            if existing_category.id != category_id:
                result["label_available"] = False
                result["okay"] = False
        except PlateCategory.DoesNotExist:
            pass  # No existe, está bien

    return result

def validate_edit_user(data):
    User = get_user_model()
    
    result = {
        "valid_id": True,
        "name": True,
        "email": True,
        "user_exists": False,
        "user": None,
        "okay": True
    }

    user_id = data.get("id", False)
    email = data.get("email", False)
    name = data.get("name", False)

    if not user_id:
        result["valid_id"] = False
        result["okay"] = False
        return result

    # Validar que el usuario existe
    try:
        user = User.objects.get(id=user_id)
        result["user"] = user
    except User.DoesNotExist:
        result["valid_id"] = False
        result["okay"] = False
        return result

    # Validar nombre
    if not name or not name.strip():
        result["name"] = False
        result["okay"] = False

    # Validar email
    if not email or not email.strip():
        result["email"] = False
        result["okay"] = False
    else:
        # Validar que el email no esté en uso por otro usuario
        existing_user = User.objects.filter(email=email).first()
        if existing_user and existing_user.id != user_id:
            result["user_exists"] = True
            result["okay"] = False

    return result

def validate_create_table(data):
    result = {
        "valid_code": True,
        "valid_capacity": True,
        "valid_state": True,
        "valid_area": True,
        "data": data,
        "okay": True
    }

    code = data.get("code", False)
    capacity = data.get("capacity", False)
    state = data.get("state", False)
    area = data.get("area", False)

    if not code or not code.strip():
        result["valid_code"] = False
        result["okay"] = False

    if not capacity or capacity <= 0:
        result["valid_capacity"] = False
        result["okay"] = False

    if not state or not state.strip():
        result["valid_state"] = False
        result["okay"] = False

    if not area:
        result["valid_area"] = False
        result['okay'] = False
    else:
        # Validar que el área existe por label
        try:
            TableArea.objects.get(label=area)
        except TableArea.DoesNotExist:
            result["valid_area"] = False
            result['okay'] = False

    return result

def validate_edit_table_area(data):
    result = {
        "valid_id": True,
        "valid_label": True,
        "area_exists": True,
        "label_available": True,
        "area": None,
        "okay": True
    }

    area_id = data.get("id", False)
    new_label = data.get("label", False)

    if not area_id:
        result["valid_id"] = False
        result["okay"] = False
        return result

    if not new_label or not new_label.strip():
        result["valid_label"] = False
        result["okay"] = False
        return result

    # Validar que el área existe
    try:
        area = TableArea.objects.get(id=area_id)
        result["area"] = area
    except TableArea.DoesNotExist:
        result["area_exists"] = False
        result["okay"] = False
        return result

    # Validar que el nuevo label no existe (si es diferente al actual)
    if area.label != new_label.strip():
        try:
            existing_area = TableArea.objects.get(label=new_label.strip())
            if existing_area.id != area_id:
                result["label_available"] = False
                result["okay"] = False
        except TableArea.DoesNotExist:
            pass  # No existe, está bien

    return result

def validate_create_reservation(data):
    result = {
        "valid_name": True,
        "valid_email": True,
        "valid_phone_number": True,
        "valid_date_time": True,
        "valid_table": True,
        "valid_amount_people": True,
        "valid_state": True,
        "valid_notes": True,
        "data": data,
        "okay": True
    }

    name = data.get("name", False)
    email = data.get("email", False)
    phone_number = data.get("phone_number", False)
    date_time = data.get("date_time", False)
    table = data.get("table", False)
    amount_people = data.get("amount_people", False)
    state = data.get("state", False)
    notes = data.get("notes", False)

    # Validate name (required)
    if not name or not name.strip():
        result["valid_name"] = False
        result["okay"] = False

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

    # Validate table (optional, but if provided must exist by code)
    if table:
        try:
            Table.objects.get(code=table)
        except Table.DoesNotExist:
            result["valid_table"] = False
            result["okay"] = False

    # Validate amount_people (required, > 0)
    if not amount_people or amount_people <= 0:
        result["valid_amount_people"] = False
        result["okay"] = False

    # Validate state (required, not empty)
    if not state or not state.strip():
        result["valid_state"] = False
        result["okay"] = False

    # Validate notes (optional, max length 2048 if provided)
    if notes and len(notes) > 2048:
        result["valid_notes"] = False
        result["okay"] = False
    
    return result

def validate_create_bill(data):
    User = get_user_model()
    
    result = {
        "valid_table": True,
        "table_available": True,
        "valid_waiter": True,
        "data": data,
        "okay": True
    }

    table = data.get("table", False)
    waiter = data.get("waiter", False)

    # Validar que exista una mesa
    if not table:
        result["valid_table"] = False
        result["okay"] = False
    else:
        # Validar que la mesa exista en la BD
        try:
            table_obj = Table.objects.get(id=table)
        except Table.DoesNotExist:
            result["valid_table"] = False
            result["okay"] = False
        else:
            # Validar que la mesa no esté siendo usada en otra cuenta activa
            active_bill = Bill.objects.filter(table=table_obj, state="current").first()
            if active_bill:
                result["table_available"] = False
                result["okay"] = False

    # Validar que exista un mesero
    if not waiter:
        result["valid_waiter"] = False
        result["okay"] = False
    else:
        # Validar que el mesero exista en la BD y tenga el rol de mesero
        if not User.objects.filter(id=waiter, is_waiter=True).exists():
            result["valid_waiter"] = False
            result["okay"] = False

    return result


def validate_edit_bill(data, bill_id=None):
    from backend.models import Table, Bill
    User = get_user_model()
    
    result = {
        "valid_table": True,
        "table_available": True,
        "valid_waiter": True,
        "valid_state": True,
        "data": data,
        "okay": True
    }

    table = data.get("table", None)
    waiter = data.get("waiter", None)
    state = data.get("state", None)

    # Validar mesa si se proporciona (opcional para edición)
    if table is not None:
        try:
            table_obj = Table.objects.get(id=table)
        except Table.DoesNotExist:
            result["valid_table"] = False
            result["okay"] = False
        else:
            # Validar que la mesa no esté siendo usada en otra cuenta activa (excluyendo la cuenta actual si se está editando)
            active_bills = Bill.objects.filter(table=table_obj, state="current")
            if bill_id:
                active_bills = active_bills.exclude(id=bill_id)
            
            if active_bills.exists():
                result["table_available"] = False
                result["okay"] = False

    # Validar mesero si se proporciona (opcional para edición)
    if waiter is not None:
        if not User.objects.filter(id=waiter, is_waiter=True).exists():
            result["valid_waiter"] = False
            result["okay"] = False

    # Validar estado si se proporciona (opcional para edición)
    # No hay restricciones específicas de estado, solo validar que no esté vacío si se proporciona
    if state is not None and (not state or not state.strip()):
        result["valid_state"] = False
        result["okay"] = False

    return result

from django.contrib.auth import get_user_model

from backend.models import PlateCategory


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

    if not description or not description.strip():
        result["valid_description"] = False
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
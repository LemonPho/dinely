from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode

from backend.views.authentication.utils import is_email_valid


def validate_registration(data, User):
    response = {
        "passwords_match": False,
        "password_valid": False,
        "email_unique" : False,
        "email_valid": False,
        "valid_data": True,
        "okay": False
    }

    email = data.get("email")
    password = data.get("password")
    confirmation = data.get("passwordConfirmation")

    try:
        User.objects.get(email=email)
    except User.DoesNotExist:
        response["okay"] = True
        response["email_unique"] = True

    if is_email_valid(email):
        response["okay"] = True
        response["email_valid"] = True

    if password == confirmation:
        response["okay"] = True
        response["passwords_match"] = True
    
    if len(password) >= 8:
        response["okay"] = True
        response["password_valid"] = True 

    return response

def validate_set_password(data):
    User = get_user_model()

    password = data.get("password", False)
    uid = data.get("uid", False)
    token = data.get("token", False)

    response = {
        "uid": uid,
        "token": token,
        "password": password,
        "password_short": len(password) < 8 if password else False,
        "user_exists": User.objects.filter(id=urlsafe_base64_decode(uid)).exists() if uid else False,
        "token_valid": True,
        "user_active": False,
        "okay": True
    }

    if not uid or not token or not password or response["password_short"] or not response["user_exists"]:
        response["okay"] = False
        return response

    try:
        user = User.objects.get(id=urlsafe_base64_decode(uid))
        response["user"] = user
    except User.DoesNotExist:
        response["user_exists"] = False
        response["okay"] = False
        return response

    if not default_token_generator.check_token(user, token):
        response["okay"] = False
        response["token_valid"] = False
        return response

    if user.is_active:
        response["okay"] = False
        response["user_active"] = True
        return response

    return response




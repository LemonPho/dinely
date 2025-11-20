from django.contrib.auth import get_user_model


def validate_create_user(user):
    User = get_user_model()

    email = user.get("email", False)
    
    response = {
        "name": user.get("name", False),
        "email": email,
        "user_exists": User.objects.filter(email=email).exists() if email else False,
    }

    return response
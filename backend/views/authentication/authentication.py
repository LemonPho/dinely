from django.http import HttpResponse, JsonResponse
from django.middleware.csrf import get_token
from django.contrib.auth import get_user_model, login, logout

import json

from backend.serializers.Users import UserCreateSerializer, UserReadSerializer
from backend.views.authentication.utils import is_email_valid, is_username_valid
from backend.views.authentication.validators import validate_registration

def get_csrf_token(request):
    get_token(request)  # CSRF
    return HttpResponse(status=200)

def register(request):
    if request.method != "POST":
        return HttpResponse(status=405)
    
    User = get_user_model()
        
    data = json.loads(request.body)
    
    response = validate_registration(data, User)

    serializer = UserCreateSerializer(data=data)
    if not serializer.is_valid():
        print(serializer.errors)
        response["valid_data"] = False
    
    # Check if all validations passed
    keys = response.keys()
    if not all(response.get(key, False) for key in keys):
        return JsonResponse(response, status=400, content_type="application/json")

    user = serializer.save()
    login(request, user)
    return HttpResponse(status=201)

def login_view(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    User = get_user_model()
    data = json.loads(request.body)

    email = data.get("email", False)
    password = data.get("password", False)

    if not email or not password:
        return HttpResponse(status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return HttpResponse(status=404)

    if user.check_password(password):
        login(request, user)
        serializer = UserReadSerializer(user)
        return JsonResponse(serializer.data, status=200, content_type="application/json")
    else:
        return HttpResponse(status=400)

def get_current_user(request):
    if request.method != "GET":
        return HttpResponse(status=405)

    if not request.user.is_authenticated:
        return JsonResponse({
            "user": None
        }, status=200)

    serializer = UserReadSerializer(request.user)
    return JsonResponse({
        "user": serializer.data
    }, status=200)
from django.http import HttpResponse, JsonResponse
from django.middleware.csrf import get_token
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode

import json

from backend.serializers.users import UserCreateSerializer, UserReadSerializer
from backend.views.authentication.validators import validate_registration, validate_set_password

def get_csrf_token(request):
    get_token(request)  # CSRF
    return HttpResponse(status=200)

def register(request):
    if request.method != "POST":
        return HttpResponse(status=405)
    
    User = get_user_model()
        
    data = json.loads(request.body)
    
    response = validate_registration(data, User)

    if not response["okay"]:
        response.pop("okay")
        return JsonResponse(response, status=400)

    serializer = UserCreateSerializer(data=data)
    if not serializer.is_valid():
        print(serializer.errors)
        response["okay"] = False
        response["valid_data"] = False
    
    # Check if all validations passed
    if not response["okay"]:
        response.pop("okay")
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

def set_password(request):
    if request.method != "POST":
        return HttpResponse(status=405)
    
    data = json.loads(request.body)

    response = validate_set_password(data)
    if not response["okay"]:
        return JsonResponse(response, status=400)
    
    user = response["user"]
    user.set_password(response["password"])
    user.is_active = True
    user.save()
    
    return HttpResponse(status=201)

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

def logout_view(request):
    if request.method != "POST":
        return HttpResponse(status=405)
    logout(request)
    return HttpResponse(status=200)
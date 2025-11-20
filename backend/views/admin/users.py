import json
from django.contrib.auth import get_user_model
from django.http import HttpResponse, JsonResponse

from backend.serializers.users import AdminUserCreateSerializer
from backend.views.admin.validators import validate_create_user
from backend.views.authentication.utils import generate_password_setup_token
from backend.email_service import send_password_setup_email

def create_user(request):
    #checar si es admin y que este actualmente en una cuenta (por cualquier cosa)
    if not request.user.is_admin or not request.user.is_authenticated:
        return HttpResponse(status=401)

    if request.method != "POST":
        return HttpResponse(status=405)

    User = get_user_model()

    data = json.loads(request.body)

    response = validate_create_user(data)
    if not response["name"] or not response["email"] or response["user_exists"]:
        return JsonResponse(response, status=400)

    serializer = AdminUserCreateSerializer(data=data)
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(response, status=400)
    
    # Crear el usuario
    user = serializer.save()
    
    # Generar token para establecer contraseña
    uid, token = generate_password_setup_token(user)
    
    # Enviar email con link para establecer contraseña
    send_password_setup_email(user, uid, token, request)
    
    return HttpResponse(status=201)

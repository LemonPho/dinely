import json
from django.contrib.auth import get_user_model
from django.http import HttpResponse, JsonResponse
from backend.serializers.users import UserReadSerializer

from backend.serializers.users import AdminUserCreateSerializer

from backend.views.admin.validators import validate_create_user, validate_edit_user
from backend.views.authentication.utils import generate_password_setup_token
from backend.email_service import send_password_setup_email

def is_user_admin(request):
    """Check if user is authenticated and is an admin"""
    # Try session authentication first
    if request.user.is_authenticated and hasattr(request.user, 'is_admin') and request.user.is_admin:
        return True
    
    # Fall back to token authentication from cookies
    # This would require implementing token validation
    # For now, we'll rely on session auth
    return False

def create_user(request):
    #checar si es admin y que este actualmente en una cuenta (por cualquier cosa)
    if not is_user_admin(request):
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
    
    # Después de crear el usuario, usar el serializer de lectura para la respuesta
    serializer = UserReadSerializer(user)
    
    return JsonResponse(serializer.data, status=201)

def list_users(request):
    # Solo permitir a administradores autenticados
    if not request.user.is_authenticated or not request.user.is_admin:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    User = get_user_model()
    users = User.objects.all()

    serializer = UserReadSerializer(users, many=True)
    return JsonResponse(serializer.data, safe=False)

def get_waiters(request):
    # Solo permitir a administradores autenticados
    if not request.user.is_authenticated or not request.user.is_admin:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    if request.method != "GET":
        return HttpResponse(status=405)

    User = get_user_model()
    waiters = User.objects.filter(is_waiter=True)

    serializer = UserReadSerializer(waiters, many=True)
    return JsonResponse({"waiters": serializer.data}, status=200)

def edit_user(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    #is_authenticated = ingresado en una cuenta
    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)

    # Validar los datos usando el validador
    response = validate_edit_user(data)

    if not response["okay"]:
        response.pop("okay")
        response.pop("user", None)
        return JsonResponse(response, status=400)

    # Actualizar el usuario usando el serializer
    serializer = AdminUserCreateSerializer(response["user"], data=data, partial=True)
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(response, status=400)

    updated_user = serializer.save()

    # Después de usar el serializer de actualización, usar el de lectura
    serializer = UserReadSerializer(updated_user)


    return JsonResponse(serializer.data, status=201)

def delete_user(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    user_id = data.get("id", False)

    if not user_id:
        return HttpResponse(status=400)

    # Validar que el usuario existe
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return HttpResponse(status=404)

    # Prevenir que el usuario elimine su propia cuenta
    if user.id == request.user.id:
        return HttpResponse(status=400)

    # Eliminar el usuario
    user.delete()

    return HttpResponse(status=201)
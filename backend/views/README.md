# Views - Estructura y Prácticas

Este directorio contiene todas las vistas (endpoints) de la API, organizadas por funcionalidad.

## Estructura

```
views/
├── admin/                 # Funcionalidades de administrador
│   ├── users.py          # Gestión de usuarios
│   └── validators.py     # Validadores para operaciones de admin
└── authentication/       # Autenticación y autorización
    ├── authentication.py # Login, registro, establecer contraseña
    ├── validators.py     # Validadores de autenticación
    └── utils.py         # Utilidades (tokens, validaciones de email)
```

## Organización por Módulos

### `admin/`
Vistas relacionadas con operaciones que solo los administradores pueden realizar.
Es muy importante que cualquiera funcion de view de admin tenga:
```python
if  not request.user.is_authenticated or not request.user.is_admin
    return HttpResponse(status=401)
```
Si no lo tiene, entonces cualquier usuario o persona en general puede ejecutar esas funciones

**Archivos:**
- `users.py`: Crear y gestionar usuarios del sistema
- `validators.py`: Validaciones específicas para operaciones de admin

**Ejemplo de uso:**
```python
from backend.views.admin.users import create_user
from backend.views.admin.validators import validate_create_user
```

### `authentication/`
Vistas relacionadas con autenticación, registro y gestión de sesiones.

**Archivos:**
- `authentication.py`: Endpoints principales de autenticación
- `validators.py`: Validaciones de datos de autenticación
- `utils.py`: Funciones auxiliares (generación de tokens, validación de email)

**Ejemplo de uso:**
```python
from backend.views.authentication.authentication import login_view, register
from backend.views.authentication.utils import generate_password_setup_token
from backend.views.authentication.validators import validate_registration
```

## Patrones y Prácticas

### 1. Separación de Validación y Lógica de Negocio

**Patrón recomendado:**
```python
# En la vista
def create_user(request):
    data = json.loads(request.body)
    
    # Validar datos
    response = validate_create_user(data)
    if not response["okay"]:
        return JsonResponse(response, status=400)
    
    # Lógica de negocio checar /serializers para mas informacion sobre los serializers
    serializer = AdminUserCreateSerializer(data=data)
    user = serializer.save()
    # ... más lógica
```

**Ventajas:**
- Validaciones reutilizables
- Código más limpio y testeable
- Separación clara de responsabilidades

### 2. Manejo de Respuestas HTTP

**Códigos de estado comunes:**
- `200`: Operación exitosa (GET)
- `201`: Recurso creado exitosamente (POST)
- `400`: Error de validación o datos inválidos
- `401`: Acceso denegado, usado para funciones de admin
- `404`: Recurso no encontrado
- `405`: Método HTTP no permitido
- `500`: Error interno del servidor

**Ejemplo:**
```python
if request.method != "POST":
    return HttpResponse(status=405)

if not request.user.is_admin or not request.user.is_authenticated:
    return HttpResponse(status=401)

# Validación fallida
if not response["okay"]:
    return JsonResponse(response, status=400)

# Éxito
return HttpResponse(status=201)
```

### 3. Uso de Serializers

Los serializers se usan para:
- Validar datos de entrada
- Transformar datos para guardar en la base de datos

### 4. Validadores

Los validadores retornan diccionarios con el estado de cada validación:

**Estructura típica:**
```python
response = {
    "field1": True/False,  # Estado de validación
    "field2": True/False,
    "okay": True/False     # Estado general
}
```

**Uso:**
```python
response = validate_create_user(data)
if not response["okay"]:
    # Remover "okay" antes de enviar respuesta
    response.pop("okay")
    return JsonResponse(response, status=400)
```

### 5. Utilidades

Las funciones utilitarias se colocan en `utils.py`:
- Funciones reutilizables
- Validaciones de formato (email, username)
- Generación de tokens
- Transformaciones de datos

**Ejemplo:**
```python
from backend.views.authentication.utils import generate_password_setup_token

uid, token = generate_password_setup_token(user)
```

## Flujo Típico de una Vista

1. **Validar método HTTP** (si es necesario)
2. **Parsear datos** del request body
3. **Validar datos** usando validators
4. **Procesar con serializer** (si aplica)
5. **Ejecutar lógica de negocio**
6. **Retornar respuesta** apropiada

**Ejemplo completo:**
```python
def create_user(request):
    if request.method != "POST":
        return HttpResponse(status=405)
    
    data = json.loads(request.body)
    
    # Validar
    response = validate_create_user(data)
    if not response["okay"]:
        return JsonResponse(response, status=400)
    
    # Crear con serializer
    serializer = AdminUserCreateSerializer(data=data)
    if not serializer.is_valid():
        return JsonResponse(serializer.errors, status=400)
    
    user = serializer.save()
    
    # Lógica adicional
    uid, token = generate_password_setup_token(user)
    send_password_setup_email(user, uid, token, request)
    
    return HttpResponse(status=201)
```

## Buenas Prácticas

1. **Siempre validar el método HTTP** si la vista solo acepta uno específico
2. **Siempre validar si es necesario limitar el acceso a solo admins** Si una funcion solo lo debe de poder hacer un admin, hay que validar
2. **Usar validators separados** para mantener el código limpio
3. **Manejar errores apropiadamente** con códigos HTTP correctos
4. **No exponer información sensible** en mensajes de error
5. **Usar serializers** para operaciones CRUD cuando sea posible
6. **Documentar funciones complejas** con comentarios claros


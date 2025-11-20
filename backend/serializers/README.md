# Serializers - Django REST Framework

Este directorio contiene los serializers de Django REST Framework utilizados para validar y transformar datos.

## ¿Qué son los Serializers?

Los serializers en Django REST Framework permiten:
- **Validar** datos de entrada antes de guardarlos
- **Transformar** datos entre formatos (JSON ↔ Modelos de Django)
- **Controlar** qué campos se exponen en las respuestas API

## Estructura Actual

```
serializers/
└── users.py    # Serializers para el modelo User
```

## Serializers Disponibles

### `UserCreateSerializer`
**Propósito**: Crear usuarios cuando se registran normalmente (con contraseña)

**Campos:**
- `email` (requerido)
- `name`
- `password` (write_only, mínimo 8 caracteres)

**Uso:**
```python
serializer = UserCreateSerializer(data={
    'email': 'user@example.com',
    'name': 'Juan Pérez',
    'password': 'password123'
})
if serializer.is_valid():
    user = serializer.save()  # Crea el usuario con contraseña hasheada
```

### `AdminUserCreateSerializer`
**Propósito**: Crear usuarios desde el panel de administración (sin contraseña inicial)

**Campos:**
- `email`
- `name`
- `is_admin`
- `is_waiter`
- `is_kitchen`

**Características especiales:**
- Establece `is_active = False` automáticamente
- Usa `set_unusable_password()` para que el usuario no pueda hacer login hasta establecer contraseña
- El empleado recibirá un email para establecer su contraseña

**Uso:**
```python
serializer = AdminUserCreateSerializer(data={
    'email': 'empleado@dinely.com',
    'name': 'María García',
    'is_waiter': True
})
if serializer.is_valid():
    user = serializer.save()  # Crea usuario inactivo sin contraseña
```

### `UserReadSerializer`
**Propósito**: Serializar datos del usuario para respuestas de lectura

**Campos:**
- `email` (solo lectura)

**Uso:**
```python
serializer = UserReadSerializer(user)
return JsonResponse(serializer.data)  # {'email': 'user@example.com'}
```

## Patrones Comunes

### 1. Campos Write-Only

Para campos que se escriben pero no se leen (como contraseñas):

```python
password = serializers.CharField(
    write_only=True, 
    min_length=8, 
    style={'input_type': 'password'}
)
```

### 2. Método `create()` Personalizado

Para lógica adicional al crear el objeto:

```python
def create(self, validated_data):
    User = get_user_model()
    user = User(**validated_data)
    user.is_active = False
    user.set_unusable_password()
    user.save()
    return user
```

### 3. Campos Requeridos

Especificar campos requeridos:

```python
class Meta:
    model = get_user_model()
    fields = ['email', 'name', 'password']
    extra_kwargs = {
        'email': {'required': True},
    }
```

## Buenas Prácticas

### 1. Un Serializer por Propósito
Cada serializer debe tener un propósito claro:
- Crear vs Leer vs Actualizar
- Admin vs Usuario normal
- Diferentes niveles de permisos

### 2. Validación en el Serializer
Usa las validaciones de DRF cuando sea posible:
```python
password = serializers.CharField(min_length=8)  # Validación automática
```

### 3. Campos Explícitos
Siempre especifica `fields` explícitamente en `Meta`:
```python
class Meta:
    fields = ['email', 'name']  # No uses '__all__' por seguridad
```

### 4. Write-Only para Datos Sensibles
Marca campos sensibles como `write_only=True`:
```python
password = serializers.CharField(write_only=True)
```

### 5. Lógica de Negocio en `create()` o `update()`
Si necesitas lógica adicional al crear/actualizar, usa los métodos `create()` o `update()`:

```python
def create(self, validated_data):
    # Lógica adicional antes de crear
    user = User(**validated_data)
    user.is_active = False
    user.save()
    # Lógica adicional después de crear
    send_activation_email(user)
    return user
```

## Ejemplo Completo

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model

class MyUserSerializer(serializers.ModelSerializer):
    # Campo personalizado con validación
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = get_user_model()
        fields = ['email', 'name', 'password']
        extra_kwargs = {
            'email': {'required': True},
        }
    
    def create(self, validated_data):
        User = get_user_model()
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)  # Hashear contraseña
        user.save()
        return user
    
    def validate_email(self, value):
        # Validación personalizada
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado")
        return value
```

## Agregar Nuevos Serializers

1. **Identifica el propósito**: ¿Crear? ¿Leer? ¿Actualizar? (Si es cambiar el estado de alguna cosa, no es necesario un serializer)
2. **Define los campos**: Qué campos necesitas
3. **Agrega validaciones**: Usa validadores de DRF o métodos `validate_<field>`
4. **Personaliza `create()` o `update()`**: Si necesitas lógica adicional
5. **Documenta**: Comenta el propósito del serializer

## Referencias

- [Django REST Framework - Serializers](https://www.django-rest-framework.org/api-guide/serializers/)
- [ModelSerializer](https://www.django-rest-framework.org/api-guide/serializers/#modelserializer)
- [Field-level validation](https://www.django-rest-framework.org/api-guide/serializers/#field-level-validation)


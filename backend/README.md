# Backend - Dinely

Este directorio contiene toda la lógica del backend de la aplicación Dinely, construida con Django y Django REST Framework.

## Estructura del Proyecto

```
backend/
├── models.py              # Modelos de base de datos (User, Table, Reservation, etc.)
├── admin.py               # Configuración del panel de administración de Django
├── urls.py                # Rutas principales de la API
├── serializers/           # Serializers de Django REST Framework
│   └── users.py          # Serializers para el modelo User
├── views/                 # Vistas y lógica de negocio
│   ├── admin/            # Vistas para funcionalidades de administrador
│   │   ├── users.py      # Gestión de usuarios
│   │   └── validators.py # Validadores para operaciones de admin
│   └── authentication/   # Vistas de autenticación
│       ├── authentication.py  # Login, registro, establecer contraseña
│       ├── validators.py      # Validadores de autenticación
│       └── utils.py           # Utilidades (tokens, validaciones)
├── email_service.py       # Servicio de envío de emails
└── migrations/            # Migraciones de base de datos
```

## Modelos Principales

### User
Modelo de usuario personalizado que extiende `AbstractUser`:
- **Autenticación**: Usa `email` como `USERNAME_FIELD` (no usa username)
- **Roles**: `is_admin`, `is_waiter`, `is_kitchen`
- **Campos**: `name`, `email`, `phone_number`, `date_created`

### Otros Modelos
- `TableArea`: Áreas del restaurante
- `Table`: Mesas del restaurante
- `Reservation`: Reservaciones de clientes
- `PlateCategory`: Categorías de platillos
- `Plate`: Platillos del menú
- `Account`: Cuentas de mesas
- `AccountPlate`: Relación entre cuentas y platillos

## Rutas de la API

Las rutas están definidas en `urls.py` y siguen el prefijo `/api/`:

- `/api/admin/create-user/` - Crear usuario (admin)
- `/api/authentication/csrf/` - Obtener token CSRF
- `/api/authentication/register/` - Registro de usuarios
- `/api/authentication/login/` - Inicio de sesión
- `/api/authentication/set-password/` - Establecer contraseña (empleados)
- `/api/user/get-current-user/` - Obtener usuario actual

## Prácticas y Convenciones

### Autenticación
- El sistema usa autenticación basada en sesiones con CSRF tokens
- Los usuarios se autentican con `email` y `password`
- Los empleados reciben un email para establecer su contraseña inicial

### Validación
- Las validaciones se separan en módulos `validators.py` dentro de cada módulo
- Los validadores retornan diccionarios con el estado de cada validación
- Se usa el patrón `"okay": True/False` para indicar si todas las validaciones pasaron

### Serializers
- Se usan serializers de Django REST Framework para validar y transformar datos
- Cada serializer tiene un propósito específico (crear, leer, admin)
- Ver `serializers/README.md` para más detalles

### Vistas
- Las vistas están organizadas por funcionalidad (admin, authentication)
- Se separa la lógica de validación de la lógica de negocio
- Ver `views/README.md` para más detalles

### Emails
- El servicio de emails (`email_service.py`) maneja el envío de correos
- Usa `settings.FRONTEND_URL` para obtener el url del frontend, ese constante esta ubicado en `/config/settings.py`
- Los emails se envían para activación de cuentas de empleados

## Configuración del Admin de Django

Todos los modelos están registrados en `admin.py` con configuraciones personalizadas:
- Filtros y búsquedas optimizadas
- Campos relevantes en listas
- Relaciones eficientes con `raw_id_fields`

## Migraciones

Las migraciones de base de datos se encuentran en `migrations/`. Para crear nuevas migraciones:

```bash
python manage.py makemigrations
python manage.py migrate
```

## Crear Superusuario

Para crear un superusuario que pueda acceder al admin de Django:

```bash
python manage.py createsuperuser
```

El sistema pedirá:
- Email (usado como username)
- Password

El superusuario tendrá automáticamente `is_admin=True`, `is_staff=True`, e `is_superuser=True`. Es necesario crear este primer usuario para poder hacer acciones como crear platillos, usuarios, etc.


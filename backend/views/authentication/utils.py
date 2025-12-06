import re
import uuid
from datetime import timedelta
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.utils import timezone
from backend.models import EmailValidationCode
    
def is_email_valid(email):
    # Regular expression pattern for basic email validation
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if re.match(pattern, email):
        return True
    else:
        return False

def generate_password_setup_token(user):
    """
    Genera un token seguro para establecer contraseña.
    Retorna una tupla (uid, token) donde uid es el user ID codificado en base64.
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return (uid, token)

def generate_email_validation_code(user):
    """
    Genera un código UUID para validar el email del usuario.
    El código expira después de 15 minutos.
    Retorna el UUID como string.
    """
    # Delete any existing unused codes for this user
    EmailValidationCode.objects.filter(user=user, is_used=False).delete()
    
    # Generate new UUID
    code_uuid = uuid.uuid4()
    
    # Create EmailValidationCode instance
    expires_at = timezone.now() + timedelta(minutes=15)
    validation_code = EmailValidationCode.objects.create(
        user=user,
        code=code_uuid,
        expires_at=expires_at
    )
    
    return str(code_uuid)
import re
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
    
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
from django.core.mail import send_mail
from django.contrib.sites.shortcuts import get_current_site
from django.conf import settings


def send_password_setup_email(user, uid, token, request):
    """
    Envía un email al empleado con un link para establecer su contraseña.
    
    Args:
        user: Instancia del modelo User
        uid: User ID codificado en base64
        token: Token de activación generado
        request: Objeto request de Django para obtener el dominio dinámicamente
    """
    # Obtener dominio y protocolo dinámicamente
    url = settings.FRONTEND_URL
    
    # Construir URL del frontend
    setup_url = f"{url}/set-password/{uid}/{token}/"
    
    # Contenido del email
    subject = "Establece tu contraseña - Dinely"
    message = f"""
        Hola {user.name},

        Se ha creado una cuenta para ti en Dinely. Para activar tu cuenta y establecer tu contraseña, por favor haz clic en el siguiente enlace:

        {setup_url}

        Este enlace expirará en 7 días por seguridad.

        Si no solicitaste esta cuenta, puedes ignorar este mensaje.

        Saludos,
        El equipo de Dinely
        """
    
    # Enviar email
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@dinely.com',
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error al enviar email: {str(e)}")
        return False


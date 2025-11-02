from django.http import HttpResponse
from django.middleware.csrf import get_token

def get_csrf_token(request):
    get_token(request)  # CSRF
    return HttpResponse(status=200)

from pathlib import Path
from django.conf import settings
from django.http import FileResponse, HttpResponseNotFound
from django.middleware.csrf import get_token

def frontend(request):
    index_path = Path(settings.BASE_DIR) / "frontend" / "dist" / "index.html"
    get_token(request)
    try:
        return FileResponse(open(index_path, "rb"), content_type="text/html; charset=utf-8")
    except FileNotFoundError:
        return HttpResponseNotFound(b"Build not found. Did you run `npm run build`?")
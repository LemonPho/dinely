import json
from django.http import HttpResponse, JsonResponse

from backend.models import TableArea, Table
from backend.serializers.tables import AdminCreateTableAreaSerializer, AdminCreateTableSerializer, ReadTableAreaSerializer, ReadTableSerializer
from backend.views.admin.validators import validate_create_table, validate_edit_table_area

def create_table_area(request):
    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)
    
    if not request.method == "POST":
        return HttpResponse(status=405)

    data = json.loads(request.body)
    label = data.get("label", False)

    if not label:
        return HttpResponse(status=400)

    try:
        label = TableArea.objects.get(label=label)
    except TableArea.DoesNotExist:
        label = None

    if label:
        return HttpResponse(status=400)

    serializer = AdminCreateTableAreaSerializer(data=data)
    if not serializer.is_valid():
        return HttpResponse(status=400)

    area = serializer.save()

    serializer = ReadTableAreaSerializer(area)

    return JsonResponse({"area": serializer.data}, status=201)

def edit_table_area(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)

    # Validar los datos usando el validador
    validation_result = validate_edit_table_area(data)

    if not validation_result["okay"]:
        validation_result.pop("okay")
        # Retornar error 400 si alguna validación falla
        return JsonResponse(validation_result, status=400)

    area = validation_result["area"]
    new_label = data.get("label", "").strip()

    # Actualizar el área usando el serializer
    serializer = AdminCreateTableAreaSerializer(area, data={"label": new_label}, partial=True)
    if not serializer.is_valid():
        return HttpResponse(status=400)

    updated_area = serializer.save()

    # Obtener todas las áreas actualizadas
    table_areas = TableArea.objects.all()
    areas_serializer = ReadTableAreaSerializer(table_areas, many=True)

    # Obtener todos los mesas actualizadas (porque pueden tener el área actualizada)
    tables = Table.objects.all()
    tables_serializer = ReadTableSerializer(tables, many=True)

    return JsonResponse({
        "table_areas": areas_serializer.data,
        "tables": tables_serializer.data
    }, status=201)

def create_table(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)

    response = validate_create_table(data)

    if not response["okay"]:
        response.pop("okay")
        return JsonResponse(response, status=400)

    serializer = AdminCreateTableSerializer(data=data)
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(serializer.errors, status=400)

    table = serializer.save()

    #despues de usar el create serializer, ya no se puede usar para el .data
    serializer = ReadTableSerializer(table)

    return JsonResponse(serializer.data, status=201)

def edit_table(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    table_id = data.get("id", False)

    if not table_id:
        return HttpResponse(status=400)

    # Validar que la mesa existe
    try:
        table = Table.objects.get(id=table_id)
    except Table.DoesNotExist:
        return HttpResponse(status=404)

    # Validar los datos usando el mismo validador que create_table
    response = validate_create_table(data)

    if not response["okay"]:
        response.pop("okay")
        return JsonResponse(response, status=400)

    # Actualizar la mesa usando el serializer
    serializer = AdminCreateTableSerializer(table, data=data, partial=True)
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(serializer.errors, status=400)

    updated_table = serializer.save()

    # Después de usar el serializer de actualización, usar el de lectura
    serializer = ReadTableSerializer(updated_table)

    return JsonResponse(serializer.data, status=201)

def delete_table_area(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    area_id = data.get("id", False)

    if not area_id:
        return HttpResponse(status=400)

    # Validar que el área existe
    try:
        area = TableArea.objects.get(id=area_id)
    except TableArea.DoesNotExist:
        return HttpResponse(status=404)

    # Verificar si hay mesas usando esta área
    tables_using_area = Table.objects.filter(area=area)
    if tables_using_area.exists():
        return JsonResponse({
            "error": "No se puede eliminar el área porque hay mesas que la están usando"
        }, status=400)

    # Eliminar el área
    area.delete()

    return HttpResponse(status=201)

def delete_table(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    table_id = data.get("id", False)

    if not table_id:
        return HttpResponse(status=400)

    # Validar que la mesa existe
    try:
        table = Table.objects.get(id=table_id)
    except Table.DoesNotExist:
        return HttpResponse(status=404)

    # Eliminar la mesa
    table.delete()

    return HttpResponse(status=201)


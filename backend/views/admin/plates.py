import json
from django.http import HttpResponse, JsonResponse

from backend.models import PlateCategory, Plate
from backend.serializers.plates import AdminCreatePlateCategorySerializer, AdminCreatePlateSerializer, ReadPlateCategorySerializer, ReadPlateSerializer
from backend.views.admin.validators import validate_create_plate, validate_edit_plate_category

def create_plate_category(request):
    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)
    
    if not request.method == "POST":
        return HttpResponse(status=405)

    data = json.loads(request.body)
    label = data.get("label", False)

    if not label:
        return HttpResponse(status=400)

    try:
        label = PlateCategory.objects.get(label=label)
    except PlateCategory.DoesNotExist:
        label = None

    if label:
        return HttpResponse(status=400)

    serializer = AdminCreatePlateCategorySerializer(data=data)
    if not serializer.is_valid():
        return HttpResponse(status=400)

    plate = serializer.save()

    serializer = ReadPlateCategorySerializer(plate)
    print(serializer.data)

    return JsonResponse({"category": serializer.data}, status=201)

def edit_plate_category(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)

    # Validar los datos usando el validador
    validation_result = validate_edit_plate_category(data)

    if not validation_result["okay"]:
        validation_result.pop("okay")
        # Retornar error 400 si alguna validación falla
        return JsonResponse(validation_result, status=400)

    category = validation_result["category"]
    new_label = data.get("label", "").strip()

    # Actualizar la categoría usando el serializer
    serializer = AdminCreatePlateCategorySerializer(category, data={"label": new_label}, partial=True)
    if not serializer.is_valid():
        return HttpResponse(status=400)

    updated_category = serializer.save()

    # Obtener todas las categorías actualizadas
    plate_categories = PlateCategory.objects.all()
    categories_serializer = ReadPlateCategorySerializer(plate_categories, many=True)

    # Obtener todos los platillos actualizados (porque pueden tener la categoría actualizada)
    plates = Plate.objects.all()
    plates_serializer = ReadPlateSerializer(plates, many=True)

    return JsonResponse({
        "plate_categories": categories_serializer.data,
        "plates": plates_serializer.data
    }, status=201)

def create_plate(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)

    response = validate_create_plate(data)

    if not response["okay"]:
        response.pop("okay")
        return JsonResponse(response, status=400)

    serializer = AdminCreatePlateSerializer(data=data)
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(serializer.errors, status=400)

    plate = serializer.save()

    #despues de usar el create serializer, ya no se puede usar para el .data
    serializer = ReadPlateSerializer(plate)

    return JsonResponse(serializer.data, status=201)

def edit_plate(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    plate_id = data.get("id", False)

    if not plate_id:
        return HttpResponse(status=400)

    # Validar que el platillo existe
    try:
        plate = Plate.objects.get(id=plate_id)
    except Plate.DoesNotExist:
        return HttpResponse(status=404)

    # Validar los datos usando el mismo validador que create_plate
    response = validate_create_plate(data)

    if not response["okay"]:
        response.pop("okay")
        return JsonResponse(response, status=400)

    # Actualizar el platillo usando el serializer
    serializer = AdminCreatePlateSerializer(plate, data=data, partial=True)
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(serializer.errors, status=400)

    updated_plate = serializer.save()

    # Después de usar el serializer de actualización, usar el de lectura
    serializer = ReadPlateSerializer(updated_plate)

    return JsonResponse(serializer.data, status=201)

def delete_plate_category(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    category_id = data.get("id", False)

    if not category_id:
        return HttpResponse(status=400)

    # Validar que la categoría existe
    try:
        category = PlateCategory.objects.get(id=category_id)
    except PlateCategory.DoesNotExist:
        return HttpResponse(status=404)

    # Verificar si hay platillos usando esta categoría
    plates_using_category = Plate.objects.filter(category=category)
    if plates_using_category.exists():
        return JsonResponse({
            "error": "No se puede eliminar la categoría porque hay platillos que la están usando"
        }, status=400)

    # Eliminar la categoría
    category.delete()

    return HttpResponse(status=201)

def delete_plate(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    plate_id = data.get("id", False)

    if not plate_id:
        return HttpResponse(status=400)

    # Validar que el platillo existe
    try:
        plate = Plate.objects.get(id=plate_id)
    except Plate.DoesNotExist:
        return HttpResponse(status=404)

    # Eliminar el platillo
    plate.delete()

    return HttpResponse(status=201)
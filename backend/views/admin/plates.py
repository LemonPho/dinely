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

def get_plate_categories(request):
    if not request.method == "GET":
        return HttpResponse(status=405)

    plate_categories = PlateCategory.objects.all()
    serializer = ReadPlateCategorySerializer(plate_categories, many=True)

    return JsonResponse({"plate_categories": serializer.data}, status=200)

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

def get_plates(request):
    if not request.method == "GET":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    plates = Plate.objects.all()
    serializer = ReadPlateSerializer(plates, many=True)

    return JsonResponse({"plates": serializer.data}, status=200)
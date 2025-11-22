import json
from django.http import HttpResponse, JsonResponse

from backend.models import PlateCategory
from backend.serializers.plates import AdminCreatePlateCategorySerializer, ReadPlateCategorySerializer

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
    pass

def get_plate_categories(request):
    if not request.method == "GET":
        return HttpResponse(status=405)

    plate_categories = PlateCategory.objects.all()
    serializer = ReadPlateCategorySerializer(plate_categories, many=True)

    return JsonResponse({"plate_categories": serializer.data}, status=200)
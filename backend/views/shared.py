## Aqui van funciones que se usan en muchos lados, son funciones que prinpipalmente obtienen informacion
from django.http import JsonResponse, HttpResponse

from backend.models import PlateCategory, Plate, Reservation, Table, TableArea
from backend.serializers.tables import ReadTableSerializer, ReadTableAreaSerializer
from backend.serializers.reservations import ReadReservationSerializer
from backend.serializers.plates import ReadPlateCategorySerializer, ReadPlateSerializer

def get_plate_categories(request):
    if not request.method == "GET":
        return HttpResponse(status=405)

    plate_categories = PlateCategory.objects.all()
    serializer = ReadPlateCategorySerializer(plate_categories, many=True)

    return JsonResponse({"plate_categories": serializer.data}, status=200)


def get_plates(request):
    if not request.method == "GET":
        return HttpResponse(status=405)

    plates = Plate.objects.all()
    serializer = ReadPlateSerializer(plates, many=True)

    return JsonResponse({"plates": serializer.data}, status=200)


def get_reservations(request):
    if not request.method == "GET":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    reservations = Reservation.objects.all()
    serializer = ReadReservationSerializer(reservations, many=True)

    return JsonResponse({"reservations": serializer.data}, status=200)

def get_tables(request):
    if not request.method == "GET":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    tables = Table.objects.all()
    serializer = ReadTableSerializer(tables, many=True)

    return JsonResponse({"tables": serializer.data}, status=200)

def get_table_areas(request):
    if not request.method == "GET":
        return HttpResponse(status=405)

    table_areas = TableArea.objects.all()
    serializer = ReadTableAreaSerializer(table_areas, many=True)

    return JsonResponse({"table_areas": serializer.data}, status=200)
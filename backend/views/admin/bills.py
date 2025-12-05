import json
from django.http import JsonResponse, HttpResponse
from ..models import Bill
from ..serializers.Bill_Serializer import AdminCreateBillSerializer, ReadBillSerializer
from ..validators import validate_create_bill  # Asumiendo que tienes un validador similar

def create_bill(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)

    response = validate_create_bill(data)

    if not response["okay"]:
        response.pop("okay")
        return JsonResponse(response, status=400)

    serializer = AdminCreateBillSerializer(data=data)
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(serializer.errors, status=400)

    bill = serializer.save()

    # Después de usar el create serializer, ya no se puede usar para el .data
    serializer = ReadBillSerializer(bill)

    return JsonResponse(serializer.data, status=201)


def edit_bill(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    bill_id = data.get("id", False)

    if not bill_id:
        return HttpResponse(status=400)

    # Validar que la factura existe
    try:
        bill = Bill.objects.get(id=bill_id)
    except Bill.DoesNotExist:
        return HttpResponse(status=404)

    # Validar los datos usando el mismo validador que create_bill
    response = validate_create_bill(data)

    if not response["okay"]:
        response.pop("okay")
        return JsonResponse(response, status=400)

    # Actualizar la factura usando el serializer
    serializer = AdminCreateBillSerializer(bill, data=data, partial=True)
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(serializer.errors, status=400)

    updated_bill = serializer.save()

    # Después de usar el serializer de actualización, usar el de lectura
    serializer = ReadBillSerializer(updated_bill)

    return JsonResponse(serializer.data, status=201)


def delete_bill(request):
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_admin:
        return HttpResponse(status=401)

    data = json.loads(request.body)
    bill_id = data.get("id", False)

    if not bill_id:
        return HttpResponse(status=400)

    # Validar que la factura existe
    try:
        bill = Bill.objects.get(id=bill_id)
    except Bill.DoesNotExist:
        return HttpResponse(status=404)

    # Eliminar la factura
    bill.delete()

    return HttpResponse(status=201)


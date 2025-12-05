from rest_framework import serializers
from ..models import Bill

# Serializer para crear/editar facturas desde el admin
def AdminCreateBillSerializer(*args, **kwargs):
    class _AdminCreateBillSerializer(serializers.ModelSerializer):
        class Meta:
            model = Bill
            fields = [
                "id",
                "reservation",   # relación con la reserva
                "total_amount",  # monto total
                "status",        # estado de la factura (ej: pagada, pendiente)
                "created_at",    # fecha de creación
                "updated_at",    # fecha de actualización
            ]
    return _AdminCreateBillSerializer(*args, **kwargs)


# Serializer para lectura de facturas (respuesta al cliente/admin)
def ReadBillSerializer(*args, **kwargs):
    class _ReadBillSerializer(serializers.ModelSerializer):
        class Meta:
            model = Bill
            fields = [
                "id",
                "reservation",
                "total_amount",
                "status",
                "created_at",
                "updated_at",
            ]
    return _ReadBillSerializer(*args, **kwargs)

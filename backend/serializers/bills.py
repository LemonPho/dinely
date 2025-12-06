from rest_framework import serializers
from backend.models import Bill, Reservation
from backend.serializers.reservations import ReadReservationSerializer


class AdminCreateBillSerializer(serializers.ModelSerializer):
    reservation = serializers.PrimaryKeyRelatedField(
        queryset=Reservation.objects.all(),
        required=True
    )
    
    class Meta:
        model = Bill
        fields = ["reservation", "status", "created_at", "updated_at"]
        extra_kwargs = {
            "reservation": {"required": True},
            "status": {"required": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }
    
    def create(self, validated_data):
        bill = Bill(**validated_data)
        bill.save()
        return bill
    
    def update(self, instance, validated_data):
        instance.reservation = validated_data.get("reservation", instance.reservation)
        instance.status = validated_data.get("status", instance.status)
        # No modificamos created_at
        instance.save()
        return instance


class ReadBillSerializer(serializers.ModelSerializer):
    reservation = ReadReservationSerializer(read_only=True)
    
    class Meta:
        model = Bill
        fields = ["id", "reservation", "status", "created_at", "updated_at"]

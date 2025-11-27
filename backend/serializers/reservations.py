from rest_framework import serializers
from backend.models import Reservation, Table
from backend.serializers.tables import ReadTableSerializer


class AdminCreateReservationSerializer(serializers.ModelSerializer):
    """
    Serializer para crear/actualizar reservaciones desde el panel de administración.
    Acepta el code de la mesa como string.
    """
    table = serializers.SlugRelatedField(
        queryset=Table.objects.all(),
        slug_field='code',
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Reservation
        fields = ["name", "email", "phone_number", "date_time", "table", "amount_people", "state", "notes"]
        extra_kwargs = {
            "name": {"required": True},
            "email": {"required": False},
            "phone_number": {"required": False},
            "date_time": {"required": True},
            "amount_people": {"required": True},
            "state": {"required": True},
            "notes": {"required": False},
        }
    
    def create(self, validated_data):
        # Import here to avoid circular import
        from backend.views.admin.utils import generate_reservation_code
        
        # Auto-generate code
        validated_data['code'] = generate_reservation_code()
        # Set client to None (admin doesn't set it)
        validated_data['client'] = None
        
        reservation = Reservation(**validated_data)
        reservation.save()
        return reservation
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.email = validated_data.get('email', instance.email)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.date_time = validated_data.get('date_time', instance.date_time)
        instance.table = validated_data.get('table', instance.table)
        instance.amount_people = validated_data.get('amount_people', instance.amount_people)
        instance.state = validated_data.get('state', instance.state)
        instance.notes = validated_data.get('notes', instance.notes)
        # Don't modify code or client
        instance.save()
        return instance

class ReadReservationSerializer(serializers.ModelSerializer):
    table = ReadTableSerializer(read_only=True)
    
    class Meta:
        model = Reservation
        fields = ["id", "code", "name", "email", "phone_number", "date_time", "table", "amount_people", "state", "notes"]


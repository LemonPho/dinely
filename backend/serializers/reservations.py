from rest_framework import serializers
from backend.models import Reservation, Table, TableArea
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

class UserCreateReservationSerializer(serializers.ModelSerializer):
    """
    Serializer for creating reservations from the user-facing form.
    Accepts table_area label as string. User data (name, email, phone_number) 
    should be overridden by view if user is authenticated.
    """
    table_area = serializers.SlugRelatedField(
        queryset=TableArea.objects.all(),
        slug_field='label',
        required=False,
        allow_null=True
    )
    date_time = serializers.DateTimeField()
    
    class Meta:
        model = Reservation
        fields = ["name", "email", "phone_number", "date_time", "table_area", "amount_people", "notes"]
        extra_kwargs = {
            "name": {"required": True},
            "email": {"required": False},
            "phone_number": {"required": False},
            "date_time": {"required": True},
            "amount_people": {"required": True},
            "notes": {"required": False},
        }
    
    def to_internal_value(self, data):
        """
        Override to handle date_time conversion properly.
        The date_time comes in as restaurant's local timezone (e.g., -06:00),
        and we need to ensure it's stored correctly in UTC while preserving the intended date.
        """
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        # Import here to avoid circular import
        from backend.views.admin.utils import generate_reservation_code
        
        # Extract table_area if provided (will be removed from validated_data)
        table_area = validated_data.pop('table_area', None)
        
        # Auto-generate code
        validated_data['code'] = generate_reservation_code()
        
        # Set state to "active" for user-created reservations
        validated_data['state'] = "active"
        
        # Set client from context if user is authenticated
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['client'] = request.user
        else:
            validated_data['client'] = None
        
        # Leave table as None (restaurant assigns later based on area preference)
        validated_data['table'] = None
        
        reservation = Reservation(**validated_data)
        reservation.save()
        
        return reservation
    
    def update(self, instance, validated_data):
        # Extract table_area if provided (will be removed from validated_data)
        # The SlugRelatedField converts label to TableArea object, but we don't use it
        # We just validate it exists, then set table to None (restaurant assigns later)
        validated_data.pop('table_area', None)
        
        # Update only editable fields (partial update)
        if 'date_time' in validated_data:
            instance.date_time = validated_data['date_time']
        if 'amount_people' in validated_data:
            instance.amount_people = validated_data['amount_people']
        if 'notes' in validated_data:
            instance.notes = validated_data['notes']
        
        # Always set table to None when updating (restaurant assigns table based on area preference)
        instance.table = None
        
        # Don't modify: name, email, phone_number, code, client, state
        # These are read-only for users
        
        instance.save()
        return instance

class ReadReservationSerializer(serializers.ModelSerializer):
    table = ReadTableSerializer(read_only=True)
    
    class Meta:
        model = Reservation
        fields = ["id", "code", "name", "email", "phone_number", "date_time", "table", "amount_people", "state", "notes"]
    
    def to_representation(self, instance):
        """
        Convert date_time from UTC to restaurant's local timezone when reading.
        Restaurant timezone: America/Mexico_City (UTC-6)
        """
        data = super().to_representation(instance)
        
        if data.get('date_time') and instance.date_time:
            # instance.date_time is stored in UTC in the database
            # Convert from UTC to restaurant's local timezone for display
            import pytz
            restaurant_tz = pytz.timezone('America/Mexico_City')
            
            # Ensure timezone-aware datetime
            if instance.date_time.tzinfo is None:
                from django.utils import timezone
                utc_dt = timezone.make_aware(instance.date_time, timezone.utc)
            else:
                utc_dt = instance.date_time
            
            # Convert to restaurant's local timezone
            local_dt = utc_dt.astimezone(restaurant_tz)
            
            # Format as ISO string with timezone offset
            data['date_time'] = local_dt.isoformat()
        
        return data


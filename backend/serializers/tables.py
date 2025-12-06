from rest_framework import serializers

from backend.models import TableArea, Table


class AdminCreateTableAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableArea
        fields = ["label"]

    def create(self, validated_data):
        area = TableArea(**validated_data)
        area.save()
        return area
    
    def update(self, instance, validated_data):
        instance.label = validated_data.get('label', instance.label)
        instance.save()
        return instance

class ReadTableAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableArea
        fields = ["label", "id"]


class AdminCreateTableSerializer(serializers.ModelSerializer):
    """
    Serializer para crear mesas desde el panel de administración.
    Acepta el label del área como string.
    """
    area = serializers.SlugRelatedField(
        queryset=TableArea.objects.all(),
        slug_field='label',
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Table
        fields = ["code", "capacity", "state", "area", "notes"]
        extra_kwargs = {
            "code": {"required": True},
            "capacity": {"required": True},
            "state": {"required": True},
        }
    
    def create(self, validated_data):
        table = Table(**validated_data)
        table.save()
        return table
    
    def update(self, instance, validated_data):
        instance.code = validated_data.get('code', instance.code)
        instance.capacity = validated_data.get('capacity', instance.capacity)
        instance.state = validated_data.get('state', instance.state)
        instance.area = validated_data.get('area', instance.area)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.save()
        return instance

class ReadTableSerializer(serializers.ModelSerializer):
    area = ReadTableAreaSerializer(read_only=True)
    active_bill_code = serializers.SerializerMethodField()
    
    class Meta:
        model = Table
        fields = ["id", "code", "capacity", "state", "area", "notes", "active_bill_code"]
    
    def get_active_bill_code(self, obj):
        """
        Get the code of the active bill associated with this table, if any.
        Returns None if no active bill exists.
        """
        from backend.models import Bill
        active_bill = Bill.objects.filter(table=obj, state="current").first()
        return active_bill.code if active_bill else None


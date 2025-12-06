from rest_framework import serializers

from backend.models import Bill, BillPlate
from backend.serializers.plates import ReadPlateSerializer
from backend.serializers.tables import ReadTableSerializer
from backend.serializers.users import UserReadSerializer


class ReadBillPlateSerializer(serializers.ModelSerializer):
    plate = ReadPlateSerializer(read_only=True)
    
    class Meta:
        model = BillPlate
        fields = ["id", "plate", "notes"]


class CreateBillPlateSerializer(serializers.ModelSerializer):
    plate_id = serializers.IntegerField(write_only=True)
    notes = serializers.CharField(max_length=1024, required=False, allow_blank=True, default="")
    
    class Meta:
        model = BillPlate
        fields = ["plate_id", "notes"]
    
    def create(self, validated_data):
        plate_id = validated_data.pop('plate_id')
        from backend.models import Plate
        try:
            plate = Plate.objects.get(id=plate_id)
        except Plate.DoesNotExist:
            raise serializers.ValidationError({"plate_id": "Plate not found"})
        
        validated_data['plate'] = plate
        return super().create(validated_data)


class ReadBillSerializer(serializers.ModelSerializer):
    table = ReadTableSerializer(read_only=True)
    waiter = UserReadSerializer(read_only=True)
    plates = ReadBillPlateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Bill
        fields = ["id", "code", "table", "waiter", "date_time", "state", "total", "total_paid", "tip", "plates"]

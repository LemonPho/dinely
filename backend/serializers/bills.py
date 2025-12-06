from django.contrib.auth import get_user_model
from rest_framework import serializers
from backend.views.admin.utils import generate_bill_code
from backend.models import Bill, BillPlate, Table
from backend.serializers.plates import ReadPlateSerializer
from backend.serializers.tables import ReadTableSerializer
from backend.serializers.users import UserReadSerializer
User = get_user_model()


class AdminCreateBillSerializer(serializers.ModelSerializer):
    table = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all(), required=False)
    waiter = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    state = serializers.CharField(required=False)
    
    class Meta:
        model = Bill
        fields = ["table", "waiter", "state"]
    
    def validate(self, data):
        # For creation, table and waiter are required
        if self.instance is None:  # Creating new instance
            if not data.get("table"):
                raise serializers.ValidationError({"table": "This field is required."})
            if not data.get("waiter"):
                raise serializers.ValidationError({"waiter": "This field is required."})
        return data
    
    def create(self, validated_data):
        # Auto-generate code
        validated_data['code'] = generate_bill_code()
        
        # date_time is auto-set by model (auto_now_add=True)
        # state, total, total_paid, tip have defaults in the model
        
        bill = Bill(**validated_data)
        bill.save()
        return bill
    
    def update(self, instance, validated_data):
        # Update table if provided
        if "table" in validated_data:
            instance.table = validated_data["table"]
        
        # Update waiter if provided
        if "waiter" in validated_data:
            instance.waiter = validated_data["waiter"]
        
        # Update state if provided
        if "state" in validated_data:
            instance.state = validated_data["state"]
        
        instance.save()
        return instance


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

from rest_framework import serializers
from backend.models import Bill, Table, User
from backend.serializers.reservations import ReadReservationSerializer
from backend.views.admin.utils import generate_bill_code


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


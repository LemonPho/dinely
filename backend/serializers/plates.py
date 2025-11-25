from rest_framework import serializers

from backend.models import PlateCategory, Plate


class AdminCreatePlateCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PlateCategory
        fields = ["label"]

    def create(self, validated_data):
        plate = PlateCategory(**validated_data)
        plate.save()
        return plate
    
    def update(self, instance, validated_data):
        instance.label = validated_data.get('label', instance.label)
        instance.save()
        return instance

class ReadPlateCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PlateCategory
        fields = ["label", "id"]


class AdminCreatePlateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear platillos desde el panel de administración.
    Acepta el label de la categoría como string.
    """
    category = serializers.SlugRelatedField(
        queryset=PlateCategory.objects.all(),
        slug_field='label',
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Plate
        fields = ["name", "price", "category", "description"]
        extra_kwargs = {
            "name": {"required": True},
            "price": {"required": True},
            "description": {"required": True},
        }
    
    def create(self, validated_data):
        plate = Plate(**validated_data)
        plate.save()
        return plate

class ReadPlateSerializer(serializers.ModelSerializer):
    category = ReadPlateCategorySerializer(read_only=True)
    
    class Meta:
        model = Plate
        fields = ["id", "name", "price", "category", "description"]

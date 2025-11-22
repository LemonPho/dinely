from rest_framework import serializers

from backend.models import PlateCategory


class AdminCreatePlateCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PlateCategory
        fields = ["label"]

    def create(self, validated_data):
        plate = PlateCategory(**validated_data)
        plate.save()
        return plate

class ReadPlateCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PlateCategory
        fields = ["label", "id"]
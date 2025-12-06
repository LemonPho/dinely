from rest_framework import serializers
from backend.models import Review
from backend.serializers.users import UserReadSerializer


class CreateReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for creating reviews from the user-facing form.
    User is set automatically from the request context.
    """
    
    class Meta:
        model = Review
        fields = ["title", "content", "score"]
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
            "content": {"required": True},
            "score": {"required": False, "allow_null": True},
        }
    
    def create(self, validated_data):
        # Get user from context (set by view)
        user = self.context['request'].user
        validated_data['user'] = user
        
        review = Review(**validated_data)
        review.save()
        return review


class ReadReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for reading review data.
    Includes user information.
    """
    user = UserReadSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ["id", "user", "title", "content", "score", "created_at", "updated_at"]


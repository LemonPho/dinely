import json
from django.http import HttpResponse, JsonResponse

from backend.models import Review
from backend.serializers.reviews import CreateReviewSerializer, ReadReviewSerializer
from backend.views.reviews.validators import validate_create_review


def create_review(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    # User must be authenticated
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=403)

    data = json.loads(request.body)

    # Validate data
    user = request.user
    response = validate_create_review(data, user=user)

    if not response["okay"]:
        response.pop("okay")
        response.pop("data", None)
        return JsonResponse(response, status=400)

    # Create review using serializer
    serializer = CreateReviewSerializer(data=response["data"], context={'request': request})
    if not serializer.is_valid():
        print(serializer.errors)
        return JsonResponse(serializer.errors, status=400)

    review = serializer.save()

    # Return created review using read serializer
    read_serializer = ReadReviewSerializer(review)
    return JsonResponse(read_serializer.data, status=201)


def get_reviews(request):
    if request.method != "GET":
        return HttpResponse(status=405)

    # Get all reviews (public endpoint, no authentication required)
    reviews = Review.objects.all().order_by("-created_at")
    serializer = ReadReviewSerializer(reviews, many=True)

    # Check if authenticated user has already left a review
    user_has_reviewed = False
    if request.user.is_authenticated:
        user_has_reviewed = Review.objects.filter(user=request.user).exists()

    return JsonResponse({
        "reviews": serializer.data,
        "user_has_reviewed": user_has_reviewed
    }, status=200)


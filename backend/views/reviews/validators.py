def validate_create_review(data, user=None):
    """
    Validate review creation data.
    User must be authenticated to create a review.
    User cannot create more than one review.
    """
    from backend.models import Review
    
    result = {
        "valid_title": True,
        "valid_content": True,
        "valid_score": True,
        "data": data,
        "okay": True
    }

    # User must be authenticated
    if not user or not user.is_authenticated:
        result["okay"] = False
        result["error"] = "User must be authenticated to create a review"
        return result

    # Check if user has already created a review
    if Review.objects.filter(user=user).exists():
        result["okay"] = False
        result["error"] = "User has already created a review"
        result["user_has_reviewed"] = True
        return result

    title = data.get("title", None)
    content = data.get("content", None)
    score = data.get("score", None)

    # Validate title (optional, max length 100 if provided)
    if title is not None:
        title = title.strip() if isinstance(title, str) else None
        if title and len(title) > 100:
            result["valid_title"] = False
            result["okay"] = False
        result["data"]["title"] = title if title else None
    else:
        result["data"]["title"] = None

    # Validate content (required, must not be empty)
    if not content or not content.strip():
        result["valid_content"] = False
        result["okay"] = False
    else:
        result["data"]["content"] = content.strip()

    # Validate score (optional, must be between 1 and 5 if provided)
    if score is not None:
        try:
            score_int = int(score)
            if score_int < 1 or score_int > 5:
                result["valid_score"] = False
                result["okay"] = False
            else:
                result["data"]["score"] = score_int
        except (ValueError, TypeError):
            result["valid_score"] = False
            result["okay"] = False
    else:
        result["data"]["score"] = None

    return result


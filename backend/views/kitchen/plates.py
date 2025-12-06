import json
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from backend.models import BillPlate


def mark_plate_cooked(request, bill_plate_id):
    """
    Mark a plate as cooked (or uncooked if already cooked).
    Only accessible to authenticated kitchen staff.
    """
    if not request.method == "POST":
        return HttpResponse(status=405)

    if not request.user.is_authenticated or not request.user.is_kitchen:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Get the cooked status from request (default to True if not provided)
    cooked = data.get("cooked", True)

    # Get the BillPlate
    try:
        bill_plate = BillPlate.objects.get(id=bill_plate_id)
    except BillPlate.DoesNotExist:
        return JsonResponse({"error": "Bill plate not found"}, status=404)

    # Update cooking status directly on BillPlate
    bill_plate.cooked = cooked
    if cooked:
        bill_plate.cooked_at = timezone.now()
    else:
        bill_plate.cooked_at = None
    bill_plate.save()

    # Return success response
    return JsonResponse({
        "success": True,
        "bill_plate_id": bill_plate_id,
        "cooked": bill_plate.cooked,
        "cooked_at": bill_plate.cooked_at.isoformat() if bill_plate.cooked_at else None
    }, status=200)


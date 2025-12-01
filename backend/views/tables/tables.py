from django.http import HttpResponse, JsonResponse

from backend.models import TableArea
from backend.serializers.tables import ReadTableAreaSerializer


def get_table_areas(request):
    if not request.method == "GET":
        return HttpResponse(status=405)

    table_areas = TableArea.objects.all()
    serializer = ReadTableAreaSerializer(table_areas, many=True)

    return JsonResponse({"table_areas": serializer.data}, status=200)


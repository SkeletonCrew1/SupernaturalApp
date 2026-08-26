"""Views for user grading"""

# pylint: skip-file

import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Architect, User


@csrf_exempt
@require_POST
def change_status(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)

    grade = data.get("grade")
    alias = data.get("alias")

    if not User.objects.filter(alias=alias).exists():
        return JsonResponse(
            {"status": "error", "message": "There is no user with such an alias"},
            status=400,
        )

    user = User.objects.get(alias=alias)
    if grade == "up":
        if user.status == "copper":
            user.status = "silver"
        else:
            user.status = "gold"
    else:
        if user.status == "gold":
            user.status = "silver"
        else:
            user.status = "copper"

    user.save(update_fields=["status"])
    return JsonResponse({"status": "ok", "message": user.status})


@csrf_exempt
@require_GET
def architectors(request):
    list_archs = Architect.objects.all()
    id_list = list_archs.values_list("user_id", flat=True)
    users = list(User.objects.filter(id__in=id_list).values("id", "alias"))
    return JsonResponse({"users": users})

"""View for blocking part, this is where the logic lies"""

import ipaddress
import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Banned


@csrf_exempt
@require_POST
def report_ip(request):
    """This is where well be getting our IP and putting it into a DB
    First i need to parse the jwt and get a user status
    My guess is that it will be great to get IP as
    a JSON this is the way i found to decode a json request
    https://stackoverflow.com/questions/19573747/parsing-json-fields-in-python
    www.geeksforgeeks.org/python/creating-a-json-response-using-django-and-python/
    https://docs.djangoproject.com/en/6.0/ref/models/querysets/
    https://stackoverflow.com/questions/32848472/better-option-to-check-if-a-particular-instance-exists-django
    https://www.youtube.com/watch?v=Da5abtjf0Bg&t=22s

    """
    try:
        jsonbody = json.loads(request.body)
        ip_address = jsonbody["ip_address"]
    except (json.JSONDecodeError, KeyError):
        return JsonResponse(
            {"status": "error", "message": "Bad request, No ipv4 was provided"},
            status=400,
        )

    if not isinstance(ip_address, str):
        return JsonResponse(
            {"status": "error", "message": "Bad request, Invalid ip address"},
            status=400,
        )
    try:
        ipaddress.IPv4Address(ip_address)

    except ValueError:
        return JsonResponse(
            {"status": "error", "message": "Bad request, Invalid ip address"},
            status=400,
        )

    if Banned.objects.filter(ip_address=ip_address).exists():
        return JsonResponse(
            {"status": "ok", "message": "IP is already banned"},
            status=200,
        )

    Banned.objects.create(ip_address=ip_address)
    return JsonResponse(
        {"status": "ok", "message": "IP reported and banned"},
        status=200,
    )


@csrf_exempt
@require_GET
def check_ip(request):
    """Checking if ip is banned"""

    header = request.META["HTTP_X_FORWARDED_FOR"]
    if not header:
        header = request.META["REMOTE_ADDR"]
    ipaddresses = header.split(",")
    ip_address = ipaddresses[0].strip()
    if not ip_address:
        return JsonResponse(
            {"status": "error", "message": "Bad request, No ipv4 was provided"},
            status=400,
        )

    try:
        ipaddress.ip_address(ip_address)
    except ValueError:
        return JsonResponse(
            {"status": "error", "message": "Bad request, Invalid IP address"},
            status=400,
        )

    try:
        ipaddress.IPv4Address(ip_address)
    except ValueError:
        return JsonResponse(
            {"status": "error", "message": "Bad request, Invalid ip address"},
            status=400,
        )

    if Banned.objects.filter(ip_address=ip_address).exists():
        return JsonResponse(
            {"status": "true", "message": "IP is banned"},
            status=403,
        )

    return JsonResponse(
        {"status": "false", "message": "IP is not banned"},
        status=200,
    )

"""Simple health check view"""

from django.http import JsonResponse


def health(_request):
    """Lightweight health check"""
    return JsonResponse({"status": "ok"})

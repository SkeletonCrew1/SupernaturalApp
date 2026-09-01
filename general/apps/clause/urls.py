"""URLS for clause ai agent"""

# pylint: skip-file
from django.urls import path
from .tools import mcp
from .views import ai_chat_endpoint
from . import views

urlpatterns = [
    path("api/chat/", ai_chat_endpoint, name="ai_chat"),
]

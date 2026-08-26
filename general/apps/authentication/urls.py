"""URL routes for votes"""

from django.urls import path

from . import views

urlpatterns = [
    path("change_status/", views.change_status, name="change_status"),
    path("architectors/", views.architectors, name="architectors"),
]

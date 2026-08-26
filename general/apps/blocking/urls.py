"""URLS for blocking part of our app"""

from django.urls import path

from . import views

urlpatterns = [
    path("report/", views.report_ip, name="report"),
    path("check/", views.check_ip, name="check"),
]

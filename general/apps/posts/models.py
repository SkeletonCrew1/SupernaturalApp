"""Models for posts"""

from django.db import models

from ..authentication.models import User

# pylint: disable=too-few-public-methods


class Post(models.Model):
    """Posts table"""

    VISIBILITY_CHOICES = [
        ("copper", "Copper"),
        ("silver", "Silver"),
        ("gold", "Gold"),
    ]

    name = models.CharField(max_length=100)
    description = models.CharField(max_length=300)
    latitude = models.CharField(max_length=100)
    longitude = models.CharField(max_length=100)
    image_key = models.CharField(max_length=500, blank=True, null=True)
    visibility_level = models.CharField(
        max_length=10, choices=VISIBILITY_CHOICES, default="copper"
    )
    seen_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        """Meta for Posts"""

        db_table = "posts"
        verbose_name = "Post"

    def __str__(self) -> str:
        return f"{self.name}"


class Report(models.Model):
    """Reports table"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        """Meta for Reports"""

        db_table = "reports"
        verbose_name = "Report"

    def __str__(self) -> str:
        return f"{self.user_id} {self.post_id}"

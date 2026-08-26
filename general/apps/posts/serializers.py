"""Serializers for posts"""

from rest_framework import serializers

from .models import Post, Report
from .storage import get_presigned_url

# pylint: disable=too-few-public-methods


class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model"""

    already_seen = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        """Meta options for PostSerializer"""

        model = Post
        fields = [
            "id",
            "name",
            "description",
            "latitude",
            "longitude",
            "image_url",
            "visibility_level",
            "seen_count",
            "created_at",
            "already_seen",
        ]
        read_only_fields = [
            "id",
            "image_url",
            "seen_count",
            "created_at",
            "already_seen",
        ]

    def get_already_seen(self, obj):
        """Check whether the current authenticated user already reported seeing this post"""
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return Report.objects.filter(user=user, post=obj).exists()

    def get_image_url(self, obj):
        """Generate a fresh presigned URL for the post's image, if one exists"""
        if not obj.image_key:
            return None
        return get_presigned_url(obj.image_key)


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for Report model"""

    class Meta:
        """Meta options for ReportSerializer"""

        model = Report
        fields = ["id", "user", "post"]

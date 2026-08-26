"""Serializers for votes"""

from rest_framework import serializers

from .models import Vote, VoteRes

# pylint: disable=too-few-public-methods


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for Vote model"""

    user_alias = serializers.ReadOnlyField(source="user.alias")

    class Meta:
        """Meta for VoteSerializer"""

        model = Vote
        fields = "__all__"


class VoteResSerializer(serializers.ModelSerializer):
    """Serializer for VoteRes model"""

    class Meta:
        """Meta for VoteResSerializer"""

        model = VoteRes
        fields = "__all__"

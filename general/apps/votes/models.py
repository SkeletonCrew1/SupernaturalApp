"""Models for votes"""

from django.db import models

from ..authentication.models import User

# pylint: disable=too-few-public-methods


class Vote(models.Model):
    """Votes table"""

    type = models.CharField(max_length=100)
    description = models.CharField(max_length=300)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    agree = models.IntegerField()
    disagree = models.IntegerField()
    time_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta for Votes"""

        db_table = "votes"
        verbose_name = "Vote"

    def __str__(self) -> str:
        return f"{self.user_id} {self.type}"


class VoteRes(models.Model):
    """Votes results table"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    vote = models.ForeignKey(Vote, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        """Meta for Votes results"""

        db_table = "votes_res"
        verbose_name = "Vote_res"

    def __str__(self) -> str:
        return f"{self.user_id} {self.vote_id}"

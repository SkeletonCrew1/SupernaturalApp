"""Models for authentication"""

from django.db import models

# pylint: disable=too-few-public-methods


class User(models.Model):
    """Users table"""

    alias = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=300)
    status = models.CharField(max_length=100)
    inquisitor = models.BooleanField(default=False)
    is_architect = models.BooleanField(default=False)
    banned = models.BooleanField(default=False)

    class Meta:
        """Meta for Users"""

        db_table = "users"
        verbose_name = "User"

    def __str__(self) -> str:
        return f"{self.alias}"


class WebsitePassword(models.Model):
    """Website password table"""

    password = models.CharField(max_length=300)
    is_active = models.BooleanField()

    class Meta:
        """Meta for Password"""

        db_table = "website_passwords"
        verbose_name = "Website passwords"

    def __str__(self) -> str:
        return f"{self.pk}"


class Architect(models.Model):
    """Architect table"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        """Meta for Password"""

        db_table = "architect"
        verbose_name = "Architect"

    def __str__(self) -> str:
        return f"{self.user}"

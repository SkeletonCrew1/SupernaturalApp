"""Models for general"""

from django.db import models

# pylint: disable=too-few-public-methods


class Banned(models.Model):
    """Banned table"""

    ip_address = models.GenericIPAddressField()

    class Meta:
        """Meta for Banned"""

        db_table = "banned"
        verbose_name = "Banned"

    def __str__(self) -> str:
        return f"{self.ip_address}"

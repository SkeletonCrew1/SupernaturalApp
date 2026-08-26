"""App config for votes"""

import os

from django.apps import AppConfig

# pylint: disable=too-few-public-methods,import-outside-toplevel


class VotesConfig(AppConfig):
    """Configuration for votes schedule"""

    name = "apps.votes"

    def ready(self):
        """Starting scheduler with application"""
        if os.environ.get("RUN_MAIN") != "true":
            return
        from .scheduler.scheduler import start  # isort: skip

        start()

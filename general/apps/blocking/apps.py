"""App config for main"""

import os

from django.apps import AppConfig

# pylint: disable=too-few-public-methods,import-outside-toplevel


class MainConfig(AppConfig):
    """Configuration for main schedule"""

    name = "apps.blocking"

    def ready(self):
        """Starting scheduler with application"""
        if os.environ.get("RUN_MAIN") != "true":
            return
        from .scheduler.scheduler import start  # isort: skip

        start()

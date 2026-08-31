import os
from django.core.asgi import get_asgi_application
from starlette.applications import Starlette
from starlette.routing import Mount

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django_application = get_asgi_application()

from apps.clause.tools import mcp

application = Starlette(
    routes=[
        Mount("/mcp", app=mcp.sse_app()),
        Mount("/", app=django_application),
    ]
)

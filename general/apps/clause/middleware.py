import os
from http.cookies import SimpleCookie

import jwt as pyjwt
from fastmcp.exceptions import ToolError
from fastmcp.server.dependencies import get_http_headers
from fastmcp.server.middleware import Middleware, MiddlewareContext

from ..authentication.models import User

JWT_SECRET = os.getenv("JWT_KEY")


async def get_user_from_token(token: str) -> User:
    """Validate an application JWT and load its user."""
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return await User.objects.aget(pk=int(payload["sub"]))
    except pyjwt.ExpiredSignatureError as exc:
        raise ToolError("Your login session has expired") from exc
    except pyjwt.InvalidTokenError as exc:
        raise ToolError("Your login session is invalid") from exc
    except (KeyError, TypeError, ValueError) as exc:
        raise ToolError("Your login session has an invalid user ID") from exc
    except User.DoesNotExist as exc:
        raise ToolError("The logged-in user no longer exists") from exc


class UserAuthMiddleware(Middleware):
    """Gets user from JWT token"""

    async def on_call_tool(self, context: MiddlewareContext, call_next):
        cookies = SimpleCookie()
        cookies.load(get_http_headers().get("cookie", ""))
        jwt_cookie = cookies.get("jwt")
        if jwt_cookie is None:
            raise ToolError("You must be logged in to use this tool")

        user = await get_user_from_token(jwt_cookie.value)

        context.fastmcp_context.set_state("user", user)
        return await call_next(context)

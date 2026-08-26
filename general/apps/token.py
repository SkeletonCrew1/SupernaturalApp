"""Retrieving authentication data from JWT token stored in HTTP cookie"""

import os

import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .authentication.models import User

JWT_SECRET = os.getenv("JWT_KEY")


class CookieJWTAuthentication(BaseAuthentication):
    """Authentication handler reading JWT from HTTP cookies"""

    def authenticate(self, request):
        """Authenticating with JWT cookie value"""
        token = request.COOKIES.get("jwt")
        if not token:
            return None

        if isinstance(token, bytes):
            token = token.decode("utf-8")

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user_id = payload.get("sub")
            if not user_id:
                raise AuthenticationFailed("Token payload missing 'sub'")
            user = User.objects.get(pk=int(user_id))
            user.is_authenticated = True
        except jwt.ExpiredSignatureError as exc:
            raise AuthenticationFailed("Token expired") from exc
        except jwt.InvalidTokenError as exc:
            raise AuthenticationFailed("Invalid token") from exc
        except jwt.DecodeError as exc:
            raise AuthenticationFailed("Invalid format") from exc
        except (ValueError, TypeError) as exc:
            raise AuthenticationFailed("Invalid token payload") from exc
        except User.DoesNotExist as exc:
            raise AuthenticationFailed("User not found") from exc

        return (user, token)

    def authenticate_header(self, _request):
        """Return authenticate header value"""
        return "Bearer"

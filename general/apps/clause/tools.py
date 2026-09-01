from typing import Annotated, Literal

# pylint: skip-file
from asgiref.sync import sync_to_async
from django.core.exceptions import PermissionDenied
from fastmcp import Context, FastMCP
from fastmcp.exceptions import ToolError
from pydantic import Field

from . import services
from .middleware import UserAuthMiddleware

mcp = FastMCP("Circle Tools", middleware=[UserAuthMiddleware()])


async def _call(service_fn, ctx: Context, **kwargs) -> str:
    user = ctx.get_state("user")
    try:
        return await sync_to_async(service_fn, thread_sensitive=True)(user, **kwargs)
    except PermissionDenied as exc:
        raise ToolError(str(exc)) from exc


@mcp.tool
async def create_vote(
    ctx: Context,
    vote_type: Literal["promotion", "excommunication", "architect"],
    user_alias: str,
    description: Annotated[str, Field(min_length=1, max_length=300)],
) -> str:
    """Create a vote for a user.

    vote_type must be promotion, excommunication, or architect. If the user asks
    you to choose the description, create a short sensible description yourself.
    """
    return await _call(
        services.create_vote,
        ctx,
        vote_type=vote_type,
        user_alias=user_alias,
        description=description,
    )


@mcp.tool
async def set_vote(
    ctx: Context,
    vote_id: Annotated[int, Field(gt=0)],
    stat: Literal["+", "-"],
) -> str:
    """Vote on an existing vote. stat must be '+' (agree) or '-' (disagree)."""
    return await _call(services.set_vote, ctx, vote_id=vote_id, stat=stat)


@mcp.tool
async def grade(ctx: Context, user_alias: str, stat: Literal["up", "down"]) -> str:
    """Directly upgrade or downgrade a user as an architect administrator.

    stat must be 'up' or 'down'. For an ordinary request to promote a user,
    use create_vote with vote_type='promotion' instead.
    """
    return await _call(services.grade, ctx, user_alias=user_alias, stat=stat)


@mcp.tool
async def create_post(
    ctx: Context,
    name: Annotated[str, Field(min_length=1, max_length=100)],
    description: Annotated[str, Field(min_length=1, max_length=300)],
    latitude: Annotated[float, Field(ge=-90, le=90)],
    longitude: Annotated[float, Field(ge=-180, le=180)],
) -> str:
    """Create a post. Latitude must be -90..90 and longitude -180..180."""
    return await _call(
        services.create_post,
        ctx,
        name=name,
        description=description,
        latitude=latitude,
        longitude=longitude,
    )


@mcp.tool
async def seen_post(ctx: Context, post_id: Annotated[int, Field(gt=0)]) -> str:
    """Mark post as seen"""
    return await _call(services.seen_post, ctx, post_id=post_id)


@mcp.tool
async def report_ip(ctx: Context, ip_address: str) -> str:
    """Report and ban a suspicious IPv4 address. Available to every tier."""
    return await _call(services.report_ip, ctx, ip_address=ip_address)


@mcp.tool
async def invite(ctx: Context, email: str) -> str:
    """Send invite"""
    return await _call(services.invite, ctx, email=email)


@mcp.tool
async def send_mail(
    ctx: Context,
    target_statuses: Annotated[
        list[Literal["copper", "silver", "gold"]], Field(min_length=1)
    ],
    subject: Annotated[str, Field(min_length=1, max_length=200)],
    body: Annotated[str, Field(min_length=1, max_length=5000)],
) -> str:
    """Send mail to registered users in one or more tiers.

    Use all three target statuses when the user asks to email all users. This
    tool cannot send ordinary mail to an arbitrary external email address.
    """
    return await _call(
        services.send_mail,
        ctx,
        target_statuses=target_statuses,
        subject=subject,
        body=body,
    )


@mcp.tool
async def current_user(ctx: Context) -> str:
    """Return the current user's alias, status, and special permissions."""
    return await _call(services.current_user, ctx)


@mcp.tool
async def list_votes(ctx: Context) -> str:
    """List the current votes and their IDs, targets, and vote totals."""
    return await _call(services.list_votes, ctx)

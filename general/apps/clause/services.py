"""Tools for ai agent"""

# pylint: skip-file
import ipaddress

import requests
from django.core.exceptions import PermissionDenied

from ..authentication.models import *
from ..blocking.models import *
from ..posts.models import *
from ..posts.views import viewsets
from ..votes.models import *


def current_user(user) -> str:
    """Describe the user attached to the current tool request."""
    capabilities = ["list votes", "report IP addresses", "cast votes"]
    if user.status in {"silver", "gold"} or user.is_architect:
        capabilities.extend(["create posts", "create votes", "send tier mail"])
    if user.status == "gold" or user.is_architect:
        capabilities.append("invite users")
    if user.inquisitor or user.is_architect:
        capabilities.append("create excommunication votes")
    if user.is_architect:
        capabilities.extend(["directly promote users", "directly demote users"])

    return (
        f"Current user: alias='{user.alias}', status='{user.status}', "
        f"inquisitor={user.inquisitor}, architect={user.is_architect}. "
        f"Capabilities: {', '.join(capabilities)}"
    )


def list_votes(_user) -> str:
    """Return a compact list of current votes."""
    votes = Vote.objects.select_related("user").order_by("-time_created")[:50]
    if not votes:
        return "There are no votes"

    return "\n".join(
        (
            f"ID {vote.pk}: {vote.type} for "
            f"'{vote.user.alias if vote.user else 'deleted user'}' - "
            f"agree={vote.agree}, disagree={vote.disagree}; "
            f"description={vote.description}"
        )
        for vote in votes
    )


def seen_post(user, post_id: int) -> str:
    """Set seen in post"""
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return f"There is no post with ID {post_id}"

    if Report.objects.filter(user=user, post=post).exists():
        return "You have already marked this post as seen"

    Report.objects.create(user=user, post=post)
    post.seen_count += 1
    post.save(update_fields=["seen_count"])
    return f"Marked post {post.name} as seen"


def create_post(
    user, name: str, description: str, latitude: str, longitude: str
) -> str:
    """Create post"""
    if user.status == "copper" and not user.is_architect:
        raise PermissionDenied("You cannot create posts")

    try:
        latitude_value = float(latitude)
        longitude_value = float(longitude)
    except (TypeError, ValueError) as exc:
        raise PermissionDenied("Latitude and longitude must be numbers") from exc

    if not -90 <= latitude_value <= 90:
        raise PermissionDenied("Latitude must be between -90 and 90")
    if not -180 <= longitude_value <= 180:
        raise PermissionDenied("Longitude must be between -180 and 180")

    Post.objects.create(
        name=name,
        description=description,
        latitude=str(latitude_value),
        longitude=str(longitude_value),
    )
    return f"Post created"


def set_vote(user, vote_id: int, stat: str) -> str:
    """Set vote"""
    if stat not in {"+", "-"}:
        raise PermissionDenied("Vote must be '+' or '-'")

    try:
        vote = Vote.objects.get(pk=vote_id)
    except Vote.DoesNotExist:
        return f"There is no vote with ID {vote_id}"

    if VoteRes.objects.filter(user=user, vote=vote).exists():
        return "You have already voted on this"

    if stat == "+":
        vote.agree = vote.agree + 1
    else:
        vote.disagree = vote.disagree + 1

    vote.save(update_fields=["agree", "disagree"])
    VoteRes.objects.create(user=user, vote=vote)
    return f"Vote {stat} set"


def create_vote(user, vote_type: str, user_alias: str, description: str) -> str:
    """Create vote"""

    vote_type = vote_type.strip().lower()
    description = description.strip()
    if not description:
        raise PermissionDenied("Vote description cannot be empty")

    if user_alias.strip().lower() in {"me", "myself", "self"}:
        user_v = user
        user_alias = user.alias
    else:
        try:
            user_v = User.objects.get(alias=user_alias)
        except User.DoesNotExist:
            return f"There is no user with alias '{user_alias}'"

    if vote_type == "promotion":
        if user.status == "copper" and not user.is_architect:
            raise PermissionDenied("You cannot create votes")
        if user_v.status != "copper":
            raise PermissionDenied(
                "Promotion votes can only promote a copper user to silver"
            )

    elif vote_type == "excommunication":
        if not user.inquisitor and not user.is_architect:
            raise PermissionDenied("You cannot create excommunication votes")

    elif vote_type == "architect":
        if user_v.status != "gold":
            raise PermissionDenied("Only gold users can be nominated architect")

    else:
        return f"Unknown vote type: {vote_type}"

    Vote.objects.create(
        type=vote_type,
        user=user_v,
        description=description,
        agree=0,
        disagree=0,
    )
    return f"{vote_type} vote for '{user_alias}' successfully created"


def send_mail(user, target_statuses: list[str], subject: str, body: str) -> str:
    """Send mail to registered users belonging to selected tiers."""
    if user.status == "copper" and not user.is_architect:
        raise PermissionDenied("You cannot send mail")

    allowed_statuses = {"copper", "silver", "gold"}
    normalized_statuses = list(dict.fromkeys(target_statuses))
    if not normalized_statuses or not set(normalized_statuses) <= allowed_statuses:
        raise PermissionDenied("Mail targets must be copper, silver, or gold")

    try:
        resp = requests.post(
            "http://mail_service:8074/mail",
            json={
                "TargetStatus": normalized_statuses,
                "Subject": subject.strip(),
                "BodyText": body.strip(),
            },
            timeout=30,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        return f"Could not send mail: {exc}"

    return f"Mail sent to registered {', '.join(normalized_statuses)} users"


def grade(user, user_alias: str, stat: str) -> str:
    """Grade user"""
    if not user.is_architect:
        raise PermissionDenied("You cannot upgrade/downgrade users")

    stat = stat.strip().lower()
    if stat not in {"up", "down"}:
        raise PermissionDenied("Grade direction must be 'up' or 'down'")

    if user_alias.strip().lower() in {"me", "myself", "self"}:
        user_g = user
        user_alias = user.alias
    else:
        try:
            user_g = User.objects.get(alias=user_alias)
        except User.DoesNotExist:
            return f"There is no user with alias '{user_alias}'"

    if stat == "up":
        if user_g.status == "copper":
            user_g.status = "silver"
        else:
            user_g.status = "gold"
    else:
        if user_g.status == "gold":
            user_g.status = "silver"
        else:
            user_g.status = "copper"

    user_g.save(update_fields=["status"])
    return f"{user_alias} is now {user_g.status}."


def invite(user, email: str) -> str:
    """Invite user"""
    if user.status != "gold" and not user.is_architect:
        raise PermissionDenied("You cannot send invites")

    try:
        resp = requests.post(
            f"http://mail_service:8074/invite",
            json={"email": email},
            timeout=5,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        return f"Could not send invite: {exc}"

    return f"Invite successfully sent to {email}"


def report_ip(user, ip_address: str) -> str:
    """Report ip"""
    try:
        ipaddress.IPv4Address(ip_address)
    except ValueError:
        return "Invalid IPv4 address"

    if Banned.objects.filter(ip_address=ip_address).exists():
        return "IP is already banned"

    Banned.objects.create(ip_address=ip_address)
    return f"IP address {ip_address} successfully reported"


def compromised(user):
    """Cleanup"""
    raise PermissionDenied(
        "This action can only be done manually. Please go to admin page to do this"
    )

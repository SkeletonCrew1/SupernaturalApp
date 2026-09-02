"""AI chat endpoint backed by Groq Cloud and local FastMCP tools."""

# pylint: skip-file

import json
import os

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from fastmcp import Client
from fastmcp.client.transports import SSETransport
from openai import AsyncOpenAI

from .middleware import get_user_from_token


def allowed_tool_names(user) -> set[str]:
    """Return only the MCP actions this user is authorized to request."""
    names = {"current_user", "list_votes", "set_vote", "seen_post", "report_ip"}
    if user.status in {"silver", "gold"} or user.is_architect:
        names.update({"create_vote", "create_post", "send_mail"})
    if user.inquisitor:
        names.add("create_vote")
    if user.status == "gold" or user.is_architect:
        names.add("invite")
    if user.is_architect:
        names.add("grade")
    return names


@csrf_exempt
async def ai_chat_endpoint(request):
    """Answer chat messages and execute authorized application tools."""
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    user_message = data.get("message", "")
    history = data.get("history", [])
    if not isinstance(user_message, str) or not user_message.strip():
        return JsonResponse({"error": "Message is required"}, status=400)

    conversation = []
    for item in history[-10:]:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        message_text = item.get("text")
        if role in {"user", "agent"} and isinstance(message_text, str):
            conversation.append(f"{role}: {message_text[:1500]}")

    jwt_cookie = request.COOKIES.get("jwt")
    if not jwt_cookie:
        return JsonResponse({"error": "You must be logged in"}, status=401)

    try:
        user = await get_user_from_token(jwt_cookie)
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=401)

    special_roles = []
    if user.is_architect:
        special_roles.append("architect")
    if user.inquisitor:
        special_roles.append("inquisitor")

    prompt = """You are an action-oriented assistant for the Supernatural app.
Authenticated user: {alias}. Tier: {status}. Special roles: {roles}.

Always respond in English. Keep answers concise and natural. Do not use Markdown
tables, headings, bold text, or repeat the user's message. Use an authorized tool
whenever the user requests an action. Infer harmless details, such as a short
vote description, when asked to choose. "Me" and "myself" mean the authenticated
user above. Normal promotion means creating a promotion vote; direct grading is
only for architects.

Vote meanings are strict: promotion only moves a copper target to silver;
architect votes can only nominate gold targets; excommunication votes ban a
target and require an Inquisitor or Architect. Inquisitor is an assigned special
role and cannot be granted with a promotion vote. Never invent role transitions.
Mail sends to registered users selected by tier, not arbitrary external email
addresses. Invitations to an external address are a separate Gold-only action.

Only tools authorized for this user are provided. When asked what you can do,
describe only the available actions in a short bullet list. Do not mention
unavailable internal tool names or actions. Never claim an action succeeded
unless its tool succeeded. If a tool fails, state its exact returned error.

Conversation:
{history}
user: {message}
""".format(
        alias=user.alias,
        status=user.status,
        roles=", ".join(special_roles) or "none",
        history="\n".join(conversation),
        message=user_message.strip(),
    )

    transport = SSETransport(
        "http://127.0.0.1:8000/mcp/sse",
        headers={"Cookie": f"jwt={jwt_cookie}"},
    )

    try:
        groq_client = AsyncOpenAI(
            api_key=os.environ["GROQ_API_KEY"],
            base_url="https://api.groq.com/openai/v1",
        )
        async with Client(transport) as mcp_client:
            mcp_tools = await mcp_client.session.list_tools()
            permitted_names = allowed_tool_names(user)
            openai_tools = [
                {
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description or "",
                        "parameters": tool.inputSchema,
                    },
                }
                for tool in mcp_tools.tools
                if tool.name in permitted_names
            ]

            messages = [{"role": "user", "content": prompt}]
            for _ in range(10):
                response = await groq_client.chat.completions.create(
                    model="openai/gpt-oss-20b",
                    messages=messages,
                    tools=openai_tools,
                    tool_choice="auto",
                )
                assistant_message = response.choices[0].message
                messages.append(assistant_message)

                if not assistant_message.tool_calls:
                    return JsonResponse({"reply": assistant_message.content or ""})

                for call in assistant_message.tool_calls:
                    try:
                        arguments = json.loads(call.function.arguments)
                        mcp_result = await mcp_client.session.call_tool(
                            call.function.name,
                            arguments=arguments,
                        )
                        result_text = "\n".join(
                            content.text
                            for content in mcp_result.content
                            if content.type == "text"
                        )
                    except Exception as exc:
                        result_text = f"Error: {exc}"

                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": call.id,
                            "content": result_text,
                        }
                    )

        return JsonResponse(
            {"error": "The assistant exceeded the tool-call limit"}, status=500
        )
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=500)

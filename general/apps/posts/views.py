"""Views for posts"""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..token import CookieJWTAuthentication
from .models import Post, Report
from .serializers import PostSerializer
from .storage import upload_image


class PostViewSet(viewsets.ModelViewSet):
    """ViewSet for Post model - handles list, create, retrieve, update, delete"""

    queryset = Post.objects.all().order_by("-created_at")
    serializer_class = PostSerializer
    authentication_classes = [CookieJWTAuthentication]

    def get_serializer_context(self):
        """Pass the request into the serializer so it can check the current user"""
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_permissions(self):
        """Require authentication only for creating a post"""
        if self.action == "create":
            return [IsAuthenticated()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):  # pylint: disable=unused-argument
        """Creates a post, uploading an image if provided (copper users are not allowed)"""
        if request.user.status == "copper":
            raise PermissionDenied("Copper masons are not allowed to create posts")

        data = request.data.copy()
        image = request.FILES.get("image")
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        image_key = upload_image(image) if image else None
        serializer.save(image_key=image_key)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated],
    )
    def seen(self, request, pk=None):  # pylint: disable=unused-argument
        """Marks a post as seen by the current user ('I saw that too' button)"""
        post = self.get_object()
        user = request.user

        if Report.objects.filter(user=user, post=post).exists():
            return Response(
                {"detail": "You have already marked this post as seen"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Report.objects.create(user=user, post=post)
        post.seen_count += 1
        post.save(update_fields=["seen_count"])
        return Response({"seen_count": post.seen_count}, status=status.HTTP_200_OK)

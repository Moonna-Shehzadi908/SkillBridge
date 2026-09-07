from django.db.models import Q

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Resource, ResourceProgress

from .serializers import (
    ResourceSerializer,
    ResourceRecommendationSerializer,
    ResourceProgressSerializer,
)

from .services import get_recommended_resources


class ResourceListCreateView(generics.ListCreateAPIView):
    """
    List and create learning resources.

    Supported query parameters:

    ?search=Python
    ?skill=4
    ?resource_type=video
    """

    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Resource.objects.select_related("skill").all()

        search = self.request.query_params.get("search")
        skill = self.request.query_params.get("skill")
        resource_type = self.request.query_params.get("resource_type")

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(skill__name__icontains=search)
            )

        if skill:
            queryset = queryset.filter(skill_id=skill)

        if resource_type:
            queryset = queryset.filter(
                resource_type__iexact=resource_type
            )

        return queryset


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a learning resource.
    """

    queryset = Resource.objects.select_related("skill").all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]


class ResourceRecommendationView(APIView):
    """
    Return personalized learning resources for
    the currently authenticated user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        recommendations = get_recommended_resources(
            request.user
        )

        data = []

        for recommendation in recommendations:
            serializer = ResourceRecommendationSerializer(
                recommendation["resource"]
            )

            item = serializer.data

            item["match_score"] = recommendation["match_score"]
            item["reason"] = recommendation["reason"]

            data.append(item)

        return Response(data)


class ResourceProgressListCreateView(APIView):
    """
    List the current user's learning progress
    and create/update progress for a resource.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Return all progress records belonging to
        the currently authenticated user.
        """

        progress_records = (
            ResourceProgress.objects
            .select_related(
                "resource",
                "resource__skill",
            )
            .filter(user=request.user)
        )

        serializer = ResourceProgressSerializer(
            progress_records,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        """
        Create progress for a resource.

        If progress already exists for the same user
        and resource, update that existing record.
        """

        resource_id = request.data.get("resource")

        if not resource_id:
            return Response(
                {
                    "detail": "Resource ID is required."
                },
                status=400,
            )

        try:
            resource = Resource.objects.select_related(
                "skill"
            ).get(id=resource_id)

        except Resource.DoesNotExist:
            return Response(
                {
                    "detail": "Resource not found."
                },
                status=404,
            )

        progress, created = ResourceProgress.objects.get_or_create(
            user=request.user,
            resource=resource,
        )

        serializer = ResourceProgressSerializer(
            progress,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            progress = serializer.save()

            return Response(
                ResourceProgressSerializer(progress).data,
                status=201 if created else 200,
            )

        return Response(
            serializer.errors,
            status=400,
        )


class ResourceProgressDetailView(APIView):
    """
    Retrieve and update progress for a specific resource.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, request, resource_id):
        try:
            return ResourceProgress.objects.select_related(
                "resource",
                "resource__skill",
            ).get(
                user=request.user,
                resource_id=resource_id,
            )

        except ResourceProgress.DoesNotExist:
            return None

    def get(self, request, resource_id):
        """
        Return progress for one resource.
        """

        progress = self.get_object(
            request,
            resource_id,
        )

        if progress is None:
            return Response(
                {
                    "detail": "Progress not found."
                },
                status=404,
            )

        serializer = ResourceProgressSerializer(progress)

        return Response(serializer.data)

    def patch(self, request, resource_id):
        """
        Update progress for one resource.
        """

        progress = self.get_object(
            request,
            resource_id,
        )

        if progress is None:
            return Response(
                {
                    "detail": "Progress not found."
                },
                status=404,
            )

        serializer = ResourceProgressSerializer(
            progress,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            progress = serializer.save()

            return Response(
                ResourceProgressSerializer(progress).data
            )

        return Response(
            serializer.errors,
            status=400,
        )
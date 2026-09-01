
from django.db.models import Q

from rest_framework import generics, permissions

from .models import Resource
from .serializers import ResourceSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    ResourceSerializer,
    ResourceRecommendationSerializer,
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
        # Ask the service layer to calculate personalized
        # resources based on the user's selected skills.
        recommendations = get_recommended_resources(
            request.user
        )

        data = []

        for recommendation in recommendations:
            # Serialize the actual Resource object.
            serializer = ResourceRecommendationSerializer(
                recommendation["resource"]
            )

            item = serializer.data

            # These two values are calculated by the
            # recommendation service rather than stored
            # permanently in the database.
            item["match_score"] = recommendation["match_score"]
            item["reason"] = recommendation["reason"]

            data.append(item)

        return Response(data)

from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Opportunity
from .serializers import (
    OpportunitySerializer,
    OpportunityRecommendationSerializer,
)
from .services import get_recommended_opportunities


class OpportunityListCreateView(generics.ListCreateAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Opportunity.objects
            .select_related("skill")
            .all()
        )

        search = self.request.query_params.get("search")
        skill = self.request.query_params.get("skill")
        opportunity_type = self.request.query_params.get(
            "opportunity_type"
        )
        remote = self.request.query_params.get("remote")

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(company__icontains=search)
                | Q(description__icontains=search)
                | Q(skill__name__icontains=search)
            )

        if skill:
            queryset = queryset.filter(skill_id=skill)

        if opportunity_type:
            queryset = queryset.filter(
                opportunity_type__iexact=opportunity_type
            )

        if remote is not None:
            queryset = queryset.filter(
                is_remote=remote.lower() == "true"
            )

        return queryset


class OpportunityDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Opportunity.objects.select_related("skill").all()
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]


class OpportunityRecommendationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        recommendations = get_recommended_opportunities(
            request.user
        )

        data = []

        for recommendation in recommendations:
            serializer = OpportunityRecommendationSerializer(
                recommendation["opportunity"]
            )

            item = serializer.data
            item["match_score"] = recommendation["match_score"]
            item["match_reason"] = recommendation["match_reason"]

            data.append(item)

        return Response(data)
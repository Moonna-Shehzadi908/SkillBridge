from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Career
from .serializers import CareerSerializer
from .services import get_career_recommendations


class CareerListCreateView(generics.ListCreateAPIView):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer


class CareerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer


class CareerRecommendationView(APIView):
    """
    Return career recommendations based on
    the authenticated user's skills.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        recommendations = get_career_recommendations(
            request.user
        )

        data = []

        for item in recommendations:
            career = item["career"]

            data.append(
                {
                    "id": career.id,
                    "title": career.title,
                    "description": career.description,
                    "average_salary": career.average_salary,
                    "demand_level": career.demand_level,
                    "career_url": career.career_url,
                    "match_percentage": item[
                        "match_percentage"
                    ],
                    "matched_skills_count": item[
                        "matched_skills_count"
                    ],
                    "required_skills_count": item[
                        "required_skills_count"
                    ],
                    "required_skills": [
                        skill.name
                        for skill in career.required_skills.all()
                    ],
                }
            )

        return Response(
            {
                "count": len(data),
                "recommendations": data,
            }
        )
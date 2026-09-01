

from django.urls import path

from .views import (
    SkillDetailView,
    SkillListCreateView,
    SkillRecommendationView,
)


urlpatterns = [
    path(
        "",
        SkillListCreateView.as_view(),
        name="skill-list-create",
    ),

    path(
        "recommendations/",
        SkillRecommendationView.as_view(),
        name="skill-recommendations",
    ),

    path(
        "<int:pk>/",
        SkillDetailView.as_view(),
        name="skill-detail",
    ),
]
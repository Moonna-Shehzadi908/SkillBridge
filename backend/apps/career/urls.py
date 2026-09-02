from django.urls import path

from .views import (
    CareerListCreateView,
    CareerDetailView,
    CareerRecommendationView,
)


urlpatterns = [
    path(
        "",
        CareerListCreateView.as_view(),
        name="career-list-create",
    ),

    path(
        "recommendations/",
        CareerRecommendationView.as_view(),
        name="career-recommendations",
    ),

    path(
        "<int:pk>/",
        CareerDetailView.as_view(),
        name="career-detail",
    ),
]
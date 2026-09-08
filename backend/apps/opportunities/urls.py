from django.urls import path

from .views import (
    OpportunityListCreateView,
    OpportunityDetailView,
    OpportunityRecommendationView,
)


urlpatterns = [
    path(
        "",
        OpportunityListCreateView.as_view(),
        name="opportunity-list-create",
    ),
    path(
        "recommendations/",
        OpportunityRecommendationView.as_view(),
        name="opportunity-recommendations",
    ),
    path(
        "<int:pk>/",
        OpportunityDetailView.as_view(),
        name="opportunity-detail",
    ),
]
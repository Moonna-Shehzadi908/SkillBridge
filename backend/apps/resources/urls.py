
from django.urls import path

from .views import (
    ResourceDetailView,
    ResourceListCreateView,
    ResourceRecommendationView,
)


urlpatterns = [
    path(
        "",
        ResourceListCreateView.as_view(),
        name="resource-list-create",
    ),

    # Personalized resources based on the user's skills.
    path(
        "recommendations/",
        ResourceRecommendationView.as_view(),
        name="resource-recommendations",
    ),

    path(
        "<int:pk>/",
        ResourceDetailView.as_view(),
        name="resource-detail",
    ),
]

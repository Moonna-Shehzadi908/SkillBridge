from django.urls import path

from .views import (
    ResourceDetailView,
    ResourceListCreateView,
    ResourceRecommendationView,
    ResourceProgressListCreateView,
    ResourceProgressDetailView,
)


urlpatterns = [
    path(
        "",
        ResourceListCreateView.as_view(),
        name="resource-list-create",
    ),

    path(
        "progress/",
        ResourceProgressListCreateView.as_view(),
        name="resource-progress-list-create",
    ),

    path(
        "progress/<int:resource_id>/",
        ResourceProgressDetailView.as_view(),
        name="resource-progress-detail",
    ),

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
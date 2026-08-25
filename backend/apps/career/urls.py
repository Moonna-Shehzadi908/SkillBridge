from django.urls import path

from .views import CareerListCreateView, CareerDetailView


urlpatterns = [
    path("", CareerListCreateView.as_view(), name="career-list-create"),
    path("<int:pk>/", CareerDetailView.as_view(), name="career-detail"),
]
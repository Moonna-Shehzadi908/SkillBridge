from rest_framework import generics

from .models import Career
from .serializers import CareerSerializer


class CareerListCreateView(generics.ListCreateAPIView):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer


class CareerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer
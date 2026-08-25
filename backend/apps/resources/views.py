from rest_framework import generics, permissions

from .models import Resource
from .serializers import ResourceSerializer


class ResourceListCreateView(generics.ListCreateAPIView):
    """
    List learning resources and create new resources.
    """

    queryset = Resource.objects.select_related("skill").all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a learning resource.
    """

    queryset = Resource.objects.select_related("skill").all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
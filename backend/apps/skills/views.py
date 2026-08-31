
from django.db.models import Q

from rest_framework import generics, permissions

from .models import Skill
from .serializers import SkillSerializer


class SkillListCreateView(generics.ListCreateAPIView):
    """
    List all available skills.

    Only admins can create new skills.

    Supported query parameters:

    ?search=python
    ?category=programming
    """

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]

        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Skill.objects.all()

        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(category__icontains=search)
            )

        if category:
            queryset = queryset.filter(
                category__iexact=category
            )

        return queryset


class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve a skill.

    Only admins can update or delete skills.
    """

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAdminUser()]

        return [permissions.IsAuthenticated()]

from rest_framework import generics, permissions

from .models import Skill
from .serializers import SkillSerializer


class SkillListCreateView(generics.ListCreateAPIView):
    """
    List all skills and allow admins to create new skills.
    """

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]

        return [permissions.IsAuthenticated()]


class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a skill.
    """

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAdminUser()]

        return [permissions.IsAuthenticated()]
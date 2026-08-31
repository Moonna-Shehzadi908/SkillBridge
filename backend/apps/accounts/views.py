
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import RegisterSerializer, UserSerializer
from apps.skills.models import Skill


class RegisterView(generics.CreateAPIView):
    """
    Register a new SkillBridge user.
    """

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CurrentUserView(APIView):
    """
    Return and update the currently authenticated user's profile.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


class UserSkillsView(APIView):
    """
    Add and view skills for the authenticated user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        skills = request.user.skills.all()

        data = [
            {
                "id": skill.id,
                "name": skill.name,
                "description": skill.description,
                "category": skill.category,
            }
            for skill in skills
        ]

        return Response(data)

    def post(self, request):
        skill_id = request.data.get("skill_id")

        if not skill_id:
            return Response(
                {"error": "skill_id is required."},
                status=400,
            )

        try:
            skill = Skill.objects.get(id=skill_id)
        except Skill.DoesNotExist:
            return Response(
                {"error": "Skill not found."},
                status=404,
            )

        if request.user.skills.filter(id=skill.id).exists():
            return Response(
                {
                    "error": "You have already added this skill."
                },
                status=400,
            )

        request.user.skills.add(skill)

        return Response(
            {
                "message": "Skill added successfully.",
                "skill": {
                    "id": skill.id,
                    "name": skill.name,
                    "category": skill.category,
                },
            },
            status=201,
        )


class RemoveUserSkillView(APIView):
    """
    Remove a skill from the authenticated user's profile.
    """

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, skill_id):
        try:
            skill = Skill.objects.get(id=skill_id)
        except Skill.DoesNotExist:
            return Response(
                {"error": "Skill not found."},
                status=404,
            )

        if not request.user.skills.filter(id=skill.id).exists():
            return Response(
                {"error": "This skill is not in your profile."},
                status=404,
            )

        request.user.skills.remove(skill)

        return Response(
            {"message": "Skill removed successfully."}
        )
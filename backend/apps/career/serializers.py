from rest_framework import serializers

from .models import Career


class CareerSerializer(serializers.ModelSerializer):
    required_skills = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Career
        fields = [
            "id",
            "title",
            "description",
            "required_skills",
            "average_salary",
            "demand_level",
            "career_url",
            "created_at",
            "updated_at",
        ]
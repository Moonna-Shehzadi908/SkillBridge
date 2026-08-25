from rest_framework import serializers

from .models import Resource


class ResourceSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(
        source="skill.name",
        read_only=True,
    )

    class Meta:
        model = Resource
        fields = [
            "id",
            "title",
            "description",
            "url",
            "resource_type",
            "skill",
            "skill_name",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "skill_name",
        ]
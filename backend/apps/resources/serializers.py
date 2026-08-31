
from rest_framework import serializers

from .models import Resource


class ResourceSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(
        source="skill.name",
        read_only=True,
    )

    resource_type_display = serializers.CharField(
        source="get_resource_type_display",
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
            "resource_type_display",
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
            "resource_type_display",
        ]

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Resource title cannot be empty."
            )

        return value

    def validate_description(self, value):
        return value.strip()

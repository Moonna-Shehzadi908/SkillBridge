
from rest_framework import serializers

from .models import Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill

        fields = [
            "id",
            "name",
            "description",
            "category",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Skill name cannot be empty."
            )

        return value

    def validate_category(self, value):
        return value.strip()

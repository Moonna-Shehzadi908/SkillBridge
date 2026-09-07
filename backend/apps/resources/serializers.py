
from rest_framework import serializers

from .models import Resource, ResourceProgress


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

class ResourceRecommendationSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(
        source="skill.name",
        read_only=True,
    )

    resource_type_display = serializers.CharField(
        source="get_resource_type_display",
        read_only=True,
    )

    match_score = serializers.IntegerField(read_only=True)

    reason = serializers.CharField(read_only=True)

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
            "match_score",
            "reason",
        ]
class ResourceProgressSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(
        source="resource.title",
        read_only=True,
    )

    resource_type = serializers.CharField(
        source="resource.resource_type",
        read_only=True,
    )

    skill_name = serializers.CharField(
        source="resource.skill.name",
        read_only=True,
    )

    class Meta:
        model = ResourceProgress

        fields = [
            "id",
            "resource",
            "resource_title",
            "resource_type",
            "skill_name",
            "status",
            "progress_percentage",
            "started_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "resource_title",
            "resource_type",
            "skill_name",
            "started_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def validate_progress_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Progress percentage must be between 0 and 100."
            )

        return value

    def validate(self, attrs):
        status = attrs.get(
            "status",
            getattr(
                self.instance,
                "status",
                ResourceProgress.Status.NOT_STARTED,
            ),
        )

        progress = attrs.get(
            "progress_percentage",
            getattr(
                self.instance,
                "progress_percentage",
                0,
            ),
        )

        if status == ResourceProgress.Status.COMPLETED:
            progress = 100
            attrs["progress_percentage"] = progress

        return attrs
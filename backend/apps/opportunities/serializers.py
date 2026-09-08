from rest_framework import serializers
from .models import Opportunity


class OpportunitySerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(
        source="skill.name",
        read_only=True,
    )
    opportunity_type_display = serializers.CharField(
        source="get_opportunity_type_display",
        read_only=True,
    )

    class Meta:
        model = Opportunity
        fields = [
            "id",
            "title",
            "company",
            "description",
            "opportunity_type",
            "opportunity_type_display",
            "location",
            "is_remote",
            "url",
            "skill",
            "skill_name",
            "deadline",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "skill_name",
            "opportunity_type_display",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Opportunity title cannot be empty."
            )

        return value

    def validate_company(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Company name cannot be empty."
            )

        return value


class OpportunityRecommendationSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(
        source="skill.name",
        read_only=True,
    )
    opportunity_type_display = serializers.CharField(
        source="get_opportunity_type_display",
        read_only=True,
    )
    match_score = serializers.IntegerField(read_only=True)
    match_reason = serializers.CharField(read_only=True)

    class Meta:
        model = Opportunity
        fields = [
            "id",
            "title",
            "company",
            "description",
            "opportunity_type",
            "opportunity_type_display",
            "location",
            "is_remote",
            "url",
            "skill",
            "skill_name",
            "deadline",
            "match_score",
            "match_reason",
        ]
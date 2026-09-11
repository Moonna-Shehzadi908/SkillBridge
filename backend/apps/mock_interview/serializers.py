
from rest_framework import serializers

from .models import Interview, InterviewQuestion


class InterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewQuestion
        fields = [
            "id",
            "question",
            "expected_answer",
            "user_answer",
            "score",
            "feedback",
        ]


class InterviewSerializer(serializers.ModelSerializer):
    questions = InterviewQuestionSerializer(
        many=True,
        read_only=True,
    )

    career_title = serializers.CharField(
        source="career.title",
        read_only=True,
    )

    class Meta:
        model = Interview
        fields = [
            "id",
            "career",
            "career_title",
            "score",
            "total_questions",
            "completed",
            "created_at",
            "questions",
        ]


class CreateInterviewSerializer(serializers.Serializer):
    career_id = serializers.IntegerField()

    number_of_questions = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=20,
        default=5,
    )


class SubmitAnswerSerializer(serializers.Serializer):
    user_answer = serializers.CharField(
        allow_blank=True,
    )
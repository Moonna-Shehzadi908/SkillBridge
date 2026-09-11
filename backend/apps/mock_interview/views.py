from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.career.models import Career

from .models import Interview
from .serializers import (
    CreateInterviewSerializer,
    InterviewSerializer,
    SubmitAnswerSerializer,
)
from .services import (
    calculate_interview_score,
    create_interview,
)


class InterviewListCreateView(APIView):
    """
    GET:
        Return all mock interviews of the logged-in user.

    POST:
        Create a new mock interview for a career.
    """

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):
        interviews = Interview.objects.filter(
            user=request.user
        ).select_related(
            "career"
        ).prefetch_related(
            "questions"
        )

        serializer = InterviewSerializer(
            interviews,
            many=True,
        )

        return Response(
            serializer.data
        )

    def post(self, request):
        serializer = CreateInterviewSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        career = get_object_or_404(
            Career,
            id=serializer.validated_data["career_id"],
        )

        number_of_questions = serializer.validated_data.get(
            "number_of_questions",
            5,
        )

        interview = create_interview(
            user=request.user,
            career=career,
            number_of_questions=number_of_questions,
        )

        response_serializer = InterviewSerializer(
            interview
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class InterviewDetailView(APIView):
    """
    Return one mock interview belonging to
    the authenticated user.
    """

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request, interview_id):
        interview = get_object_or_404(
            Interview.objects.prefetch_related(
                "questions"
            ),
            id=interview_id,
            user=request.user,
        )

        serializer = InterviewSerializer(
            interview
        )

        return Response(
            serializer.data
        )


class SubmitInterviewAnswerView(APIView):
    """
    Submit an answer for an interview question.
    """

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request,
        interview_id,
        question_id,
    ):
        interview = get_object_or_404(
            Interview,
            id=interview_id,
            user=request.user,
        )

        question = get_object_or_404(
            interview.questions,
            id=question_id,
        )

        serializer = SubmitAnswerSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user_answer = serializer.validated_data[
            "user_answer"
        ]

        question.user_answer = user_answer

        # Temporary scoring system.
        # Later we can replace this with AI evaluation.
        if user_answer.strip():
            question.score = 100
            question.feedback = (
                "Answer submitted successfully. "
                "AI evaluation can be added later."
            )
        else:
            question.score = 0
            question.feedback = (
                "No answer was provided."
            )

        question.save(
            update_fields=[
                "user_answer",
                "score",
                "feedback",
            ]
        )

        completed_questions = interview.questions.filter(
            user_answer__gt=""
        ).count()

        if completed_questions == interview.total_questions:
            calculate_interview_score(
                interview
            )

        return Response(
            {
                "message": "Answer submitted successfully.",
                "question_id": question.id,
                "score": question.score,
                "feedback": question.feedback,
                "interview_completed": interview.completed,
                "interview_score": interview.score,
            }
        )
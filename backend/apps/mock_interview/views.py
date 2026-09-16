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


def evaluate_answer(user_answer, expected_answer):
    """
    Basic answer evaluation based on keyword overlap.

    Returns:
        score: integer from 0 to 100
        feedback: evaluation message
    """

    user_answer = user_answer.strip().lower()
    expected_answer = expected_answer.strip().lower()

    # Empty answer
    if not user_answer:
        return 0, "No answer was provided."

    # Exact match
    if user_answer == expected_answer:
        return 100, "Excellent answer. Your response matches the expected answer very well."

    # Convert answers into words
    user_words = set(
        word.strip(".,!?;:()[]{}\"'")
        for word in user_answer.split()
        if len(word.strip(".,!?;:()[]{}\"'")) > 2
    )

    expected_words = set(
        word.strip(".,!?;:()[]{}\"'")
        for word in expected_answer.split()
        if len(word.strip(".,!?;:()[]{}\"'")) > 2
    )

    if not expected_words:
        return 50, "Your answer was submitted, but it could not be evaluated properly."

    # Find common keywords
    common_words = user_words.intersection(expected_words)

    match_percentage = (
        len(common_words) / len(expected_words)
    ) * 100

    # Strong answer
    if match_percentage >= 80:
        return (
            90,
            "Very good answer. Your response contains most of the important concepts."
        )

    # Good answer
    if match_percentage >= 60:
        return (
            75,
            "Good answer. You covered several important concepts, but some details are missing."
        )

    # Partial answer
    if match_percentage >= 40:
        return (
            55,
            "Partially correct. Your answer contains some relevant concepts, but it needs more explanation."
        )

    # Weak answer
    if match_percentage >= 20:
        return (
            30,
            "Your answer has limited relevance to the expected answer. Try to include the key concepts."
        )

    # Wrong / irrelevant answer
    return (
        10,
        "Your answer does not closely match the expected concepts. Review the topic and try again."
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

        # Evaluate answer instead of automatically giving 100.
        score, feedback = evaluate_answer(
            user_answer=user_answer,
            expected_answer=question.expected_answer,
        )

        question.score = score
        question.feedback = feedback

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
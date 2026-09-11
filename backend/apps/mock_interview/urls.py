from django.urls import path

from .views import (
    InterviewDetailView,
    InterviewListCreateView,
    SubmitInterviewAnswerView,
)


urlpatterns = [
    path(
        "",
        InterviewListCreateView.as_view(),
        name="interview-list-create",
    ),

    path(
        "<int:interview_id>/",
        InterviewDetailView.as_view(),
        name="interview-detail",
    ),

    path(
        "<int:interview_id>/questions/<int:question_id>/answer/",
        SubmitInterviewAnswerView.as_view(),
        name="submit-interview-answer",
    ),
]
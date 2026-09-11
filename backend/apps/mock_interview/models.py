from django.conf import settings
from django.db import models

from apps.career.models import Career


class Interview(models.Model):
    """
    Represents one mock interview session taken by a user.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mock_interviews",
    )

    career = models.ForeignKey(
        Career,
        on_delete=models.CASCADE,
        related_name="mock_interviews",
    )

    score = models.PositiveIntegerField(
        default=0
    )

    total_questions = models.PositiveIntegerField(
        default=0
    )

    completed = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user} - {self.career.title}"


class InterviewQuestion(models.Model):
    """
    Represents one question inside a mock interview.
    """

    interview = models.ForeignKey(
        Interview,
        on_delete=models.CASCADE,
        related_name="questions",
    )

    question = models.TextField()

    expected_answer = models.TextField(
        blank=True,
        default="",
    )

    user_answer = models.TextField(
        blank=True,
        default="",
    )

    score = models.PositiveIntegerField(
        default=0
    )

    feedback = models.TextField(
        blank=True,
        default="",
    )

    def __str__(self):
        return self.question[:80]
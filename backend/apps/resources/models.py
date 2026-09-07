
from django.db import models

from apps.skills.models import Skill


class Resource(models.Model):
    """
    Learning resource linked to a specific skill.
    """

    class ResourceType(models.TextChoices):
        ARTICLE = "article", "Article"
        VIDEO = "video", "Video"
        COURSE = "course", "Course"
        DOCUMENTATION = "documentation", "Documentation"

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    url = models.URLField()

    resource_type = models.CharField(
        max_length=30,
        choices=ResourceType.choices,
        default=ResourceType.ARTICLE,
    )

    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="resources",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Learning Resource"
        verbose_name_plural = "Learning Resources"

    def __str__(self):
        return self.title
class ResourceProgress(models.Model):
    """
    Track a user's learning progress for a resource.
    """

    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not Started"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="resource_progress",
    )

    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name="progress_records",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NOT_STARTED,
    )

    progress_percentage = models.PositiveIntegerField(
        default=0,
    )

    started_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    completed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "resource"],
                name="unique_user_resource_progress",
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.resource.title} - "
            f"{self.progress_percentage}%"
        )
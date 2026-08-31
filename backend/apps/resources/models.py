
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

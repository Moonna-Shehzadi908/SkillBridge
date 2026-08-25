from django.db import models

from apps.skills.models import Skill


class Career(models.Model):
    """
    Represents a career path available on SkillBridge.
    """

    class DemandLevel(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"

    title = models.CharField(max_length=150, unique=True)
    description = models.TextField()

    required_skills = models.ManyToManyField(
        Skill,
        related_name="careers",
        blank=True,
    )

    average_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    demand_level = models.CharField(
        max_length=10,
        choices=DemandLevel.choices,
        default=DemandLevel.MEDIUM,
    )

    career_url = models.URLField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title
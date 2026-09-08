from django.db import models
from apps.skills.models import Skill


class Opportunity(models.Model):
    class OpportunityType(models.TextChoices):
        JOB = "job", "Job"
        INTERNSHIP = "internship", "Internship"
        FREELANCE = "freelance", "Freelance"
        SCHOLARSHIP = "scholarship", "Scholarship"

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    opportunity_type = models.CharField(
        max_length=20,
        choices=OpportunityType.choices,
        default=OpportunityType.JOB,
    )
    location = models.CharField(max_length=150, blank=True)
    is_remote = models.BooleanField(default=False)
    url = models.URLField()
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="opportunities",
    )
    deadline = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Opportunity"
        verbose_name_plural = "Opportunities"

    def __str__(self):
        return f"{self.title} - {self.company}"
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for SkillBridge.
    """

    email = models.EmailField(unique=True)

    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True,
    )

    bio = models.TextField(
        blank=True,
        max_length=500,
    )

    location = models.CharField(
        max_length=150,
        blank=True,
    )

    skills = models.ManyToManyField(
        "skills.Skill",
        blank=True,
        related_name="users",
    )

    def __str__(self):
        return self.username
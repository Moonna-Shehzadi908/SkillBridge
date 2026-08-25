from django.urls import path

from .views import (
    CurrentUserView,
    RegisterView,
    RemoveUserSkillView,
    UserSkillsView,
)


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user",
    ),

    path(
        "me/skills/",
        UserSkillsView.as_view(),
        name="user-skills",
    ),

    path(
        "me/skills/<int:skill_id>/",
        RemoveUserSkillView.as_view(),
        name="remove-user-skill",
    ),
]
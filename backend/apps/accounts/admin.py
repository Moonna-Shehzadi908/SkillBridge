from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    SkillBridge User management in Django Admin.
    """

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_active",
    )

    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
    )

    list_filter = (
        "is_staff",
        "is_active",
        "is_superuser",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "SkillBridge Profile",
            {
                "fields": (
                    "profile_picture",
                    "bio",
                    "location",
                )
            },
        ),
    )

from django.contrib import admin

from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "skill",
        "resource_type",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "title",
        "description",
        "skill__name",
    )

    list_filter = (
        "resource_type",
        "skill",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

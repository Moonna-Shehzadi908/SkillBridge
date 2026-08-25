from django.contrib import admin

from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "resource_type",
        "skill",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "resource_type",
        "skill",
    )

    search_fields = (
        "title",
        "description",
        "skill__name",
    )

    ordering = ("-created_at",)
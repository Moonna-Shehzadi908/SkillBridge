from django.contrib import admin

from .models import Career


@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "demand_level",
        "average_salary",
        "created_at",
    )

    list_filter = (
        "demand_level",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
    )

    filter_horizontal = (
        "required_skills",
    )
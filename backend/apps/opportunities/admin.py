from django.contrib import admin

from .models import Opportunity


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "opportunity_type",
        "skill",
        "is_remote",
        "deadline",
        "created_at",
    )

    search_fields = (
        "title",
        "company",
        "description",
        "skill__name",
    )

    list_filter = (
        "opportunity_type",
        "is_remote",
        "skill",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )
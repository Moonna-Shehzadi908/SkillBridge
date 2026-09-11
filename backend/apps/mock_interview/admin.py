from django.contrib import admin

from .models import Interview, InterviewQuestion


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "career",
        "score",
        "total_questions",
        "completed",
        "created_at",
    )

    list_filter = (
        "completed",
        "career",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "career__title",
    )


@admin.register(InterviewQuestion)
class InterviewQuestionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "interview",
        "score",
    )

    search_fields = (
        "question",
        "user_answer",
    )
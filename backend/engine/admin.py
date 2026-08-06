from django.contrib import admin
from .models import TestCase, Submission, SavedCode


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ("problem", "order", "is_sample")
    list_filter = ("is_sample", "problem")
    search_fields = ("problem__title",)


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "problem",
        "status",
        "language",
        "passed_test_cases",
        "total_test_cases",
        "created_at",
    )
    list_filter = ("status", "language")
    search_fields = ("user__username", "problem__title")
    readonly_fields = (
        "runtime",
        "memory",
        "stdout",
        "error_message",
        "created_at",
    )


@admin.register(SavedCode)
class SavedCodeAdmin(admin.ModelAdmin):
    list_display = ("user", "problem", "language", "updated_at")
    list_filter = ("language",)
    search_fields = ("user__username", "problem__title")
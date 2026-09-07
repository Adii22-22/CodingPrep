"""
Wipes all Category/Topic/Lesson/Problem/TestCase/Submission/SavedCode data.
Leaves Users untouched.

Usage:
    python manage.py wipe_curriculum
    python manage.py wipe_curriculum --yes   (skip the confirmation prompt)
"""

from django.core.management.base import BaseCommand
from curriculum.models import Category, Topic, Lesson, Problem
from engine.models import TestCase, Submission, SavedCode


class Command(BaseCommand):
    help = "Deletes all curriculum content and submission history. Users are NOT deleted."

    def add_arguments(self, parser):
        parser.add_argument(
            "--yes",
            action="store_true",
            help="Skip the confirmation prompt.",
        )

    def handle(self, *args, **options):
        if not options["yes"]:
            confirm = input(
                "This will permanently delete ALL Categories, Topics, Lessons, "
                "Problems, TestCases, Submissions, and SavedCode.\n"
                "Users will NOT be touched.\n"
                "Type 'yes' to continue: "
            )
            if confirm.strip().lower() != "yes":
                self.stdout.write(self.style.WARNING("Aborted. Nothing was deleted."))
                return

        counts = {}
        counts["SavedCode"] = SavedCode.objects.all().delete()[0]
        counts["Submission"] = Submission.objects.all().delete()[0]
        counts["TestCase"] = TestCase.objects.all().delete()[0]
        counts["Problem"] = Problem.objects.all().delete()[0]
        counts["Lesson"] = Lesson.objects.all().delete()[0]
        counts["Topic"] = Topic.objects.all().delete()[0]
        counts["Category"] = Category.objects.all().delete()[0]

        self.stdout.write(self.style.SUCCESS("Wipe complete:"))
        for model_name, count in counts.items():
            self.stdout.write(f"  {model_name}: {count} deleted")

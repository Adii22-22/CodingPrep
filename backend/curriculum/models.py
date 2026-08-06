from django.db import models
from django.utils.text import slugify

# Create your models here.

class Category(models.Model):
    """
    A high-level grouping of topics, e.g. 'Data Structures', 'System Design', 'Algorithms'.
    Think of this as the 'Stage' in the curriculum.
    """
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=1, help_text="Display order on the dashboard.")

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Topic(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="topics",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True,blank=True)   

    def save(self,*args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Lesson(models.Model):
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="lessons",
        )
    title = models.CharField(max_length=100)
    content = models.TextField()

    def __str__(self):
        return self.title

class Problem(models.Model):

    class Difficulty(models.TextChoices):
        EASY = 'easy', 'Easy'
        MEDIUM = 'medium','Medium'
        HARD = 'hard','Hard'

    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="problems",
    )
    title = models.CharField(max_length=100)
    description = models.TextField()
    difficulty = models.CharField(
        max_length=10,
        choices=Difficulty.choices,
    )
    function_name = models.CharField(
        max_length=100,
        default='solution',
        help_text="The name of the function the user must define (e.g., 'two_sum')."
    )
    parameter_names = models.JSONField(
        default=list,
        blank=True,
        help_text="List of parameter names for the function signature, e.g. [\"nums\", \"target\"]. "
                  "These must match the keys in each TestCase's input_data JSON."
    )
    is_special = models.BooleanField(default=False)

    def __str__(self):
        return self.title


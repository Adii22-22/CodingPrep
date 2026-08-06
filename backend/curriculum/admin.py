from django.contrib import admin
from .models import Category, Topic, Lesson, Problem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('order',)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'slug')
    list_filter = ('category',)
    prepopulated_fields = {'slug': ('title',)}


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic')
    list_filter = ('topic',)


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic', 'difficulty', 'function_name')
    list_filter = ('difficulty', 'topic')

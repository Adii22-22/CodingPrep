from rest_framework import serializers
from .models import Category, Topic, Lesson, Problem


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = '__all__'

class TopicSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    problems = ProblemSerializer(many=True, read_only=True)
    class Meta:
        model = Topic
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    class Meta:
        model = Category
        fields = ['id', 'title', 'slug', 'description', 'order', 'topics']
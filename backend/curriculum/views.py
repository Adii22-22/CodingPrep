from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Category, Topic, Lesson, Problem
from .serializers import CategorySerializer, TopicSerializer, LessonSerializer, ProblemSerializer

# Create your views here.
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.prefetch_related('topics__lessons', 'topics__problems')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Topic.objects.prefetch_related('lessons', 'problems')
    serializer_class = TopicSerializer
    permission_classes = [AllowAny]

class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [AllowAny]

class ProblemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [AllowAny]

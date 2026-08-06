from rest_framework import serializers
from .models import TestCase, Submission, SavedCode


class SampleTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'input_data', 'expected_output', 'order']


class SubmissionSerializer(serializers.ModelSerializer):
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    problem_difficulty = serializers.CharField(source='problem.difficulty', read_only=True)
    topic_title = serializers.CharField(source='problem.topic.title', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'problem', 'problem_title', 'problem_difficulty', 'topic_title',
            'code', 'language', 'status',
            'passed_test_cases', 'total_test_cases',
            'runtime', 'stdout', 'error_message', 'created_at',
        ]


class SavedCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedCode
        fields = ['id', 'problem', 'code', 'language', 'updated_at']
        read_only_fields = ['id', 'updated_at']

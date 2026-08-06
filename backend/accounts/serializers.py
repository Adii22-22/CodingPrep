from django.contrib.auth.models import User
from rest_framework import serializers
from engine.models import Submission


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "date_joined"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "confirm_password",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError(
                {"username": "Username already exists."}
            )

        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError(
                {"email": "Email already exists."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data["email"],
            password=validated_data["password"],
        )

        return user


class ProfileSerializer(serializers.ModelSerializer):
    total_solved = serializers.SerializerMethodField()
    easy_solved = serializers.SerializerMethodField()
    medium_solved = serializers.SerializerMethodField()
    hard_solved = serializers.SerializerMethodField()
    total_submissions = serializers.SerializerMethodField()
    acceptance_rate = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name", "email", "date_joined",
            "total_solved", "easy_solved", "medium_solved", "hard_solved",
            "total_submissions", "acceptance_rate",
        ]

    def _get_solved_problems(self, obj):
        """Get distinct problems that have at least one ACCEPTED submission."""
        return Submission.objects.filter(
            user=obj, status='ACCEPTED'
        ).values_list('problem', flat=True).distinct()

    def get_total_solved(self, obj):
        return self._get_solved_problems(obj).count()

    def get_easy_solved(self, obj):
        solved_ids = self._get_solved_problems(obj)
        return Submission.objects.filter(
            user=obj, status='ACCEPTED', problem__difficulty='easy',
            problem__id__in=solved_ids
        ).values('problem').distinct().count()

    def get_medium_solved(self, obj):
        solved_ids = self._get_solved_problems(obj)
        return Submission.objects.filter(
            user=obj, status='ACCEPTED', problem__difficulty='medium',
            problem__id__in=solved_ids
        ).values('problem').distinct().count()

    def get_hard_solved(self, obj):
        solved_ids = self._get_solved_problems(obj)
        return Submission.objects.filter(
            user=obj, status='ACCEPTED', problem__difficulty='hard',
            problem__id__in=solved_ids
        ).values('problem').distinct().count()

    def get_total_submissions(self, obj):
        return Submission.objects.filter(user=obj).count()

    def get_acceptance_rate(self, obj):
        total = Submission.objects.filter(user=obj).count()
        if total == 0:
            return 0
        accepted = Submission.objects.filter(user=obj, status='ACCEPTED').count()
        return round((accepted / total) * 100, 1)
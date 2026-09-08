from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import UserRateThrottle
from django.shortcuts import get_object_or_404
from curriculum.models import Problem
from .models import Submission, TestCase, SavedCode
from .grader import run_submission
from .serializers import SampleTestCaseSerializer, SavedCodeSerializer
from .ai_interviewer import start_interview, generate_chat_response, generate_interview_grade
from .tasks import execute_submission


class CodeExecutionThrottle(UserRateThrottle):
    scope = "code_execution"


class AIInterviewThrottle(UserRateThrottle):
    scope = "ai_interview"


# Maximum code size: 100 KB
MAX_CODE_SIZE = 100 * 1024
MAX_INTERVIEW_MESSAGE_SIZE = 10 * 1024
MAX_INTERVIEW_HISTORY_ITEMS = 50
MAX_INTERVIEW_TRANSCRIPT_SIZE = 50 * 1024
SUPPORTED_LANGUAGES = {"python", "java", "c"}

class SampleTestCasesView(APIView):
    """Return sample (visible) test cases for a given problem."""
    permission_classes = [AllowAny]

    def get(self, request, problem_id):
        problem = get_object_or_404(Problem, id=problem_id)
        sample_cases = TestCase.objects.filter(problem=problem, is_sample=True).order_by('order', 'id')
        serializer = SampleTestCaseSerializer(sample_cases, many=True)
        return Response(serializer.data)


class CodeRunView(APIView):
    """Run code against SAMPLE test cases only (no submission record saved).
    This powers the 'Run' button — quick feedback without affecting stats."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [CodeExecutionThrottle]

    def post(self, request):
        problem_id = request.data.get("problem_id")
        code = request.data.get("code")
        language = request.data.get("language","python")

        if not problem_id or not isinstance(code, str) or not code:
            return Response(
                {"error": "Missing problem_id or code payload attributes."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate code size to prevent DoS
        if len(code) > MAX_CODE_SIZE:
            return Response(
                {"error": f"Code exceeds maximum size of {MAX_CODE_SIZE // 1024}KB"},
                status=status.HTTP_413_PAYLOAD_TOO_LARGE
            )

        if language not in SUPPORTED_LANGUAGES:
            return Response({"error": "Unsupported language."}, status=status.HTTP_400_BAD_REQUEST)

        problem = get_object_or_404(Problem, id=problem_id)
        

        sample_cases = problem.test_cases.filter(is_sample=True).order_by('order', 'id')

        if not sample_cases.exists():
            return Response({
                "status": "ERROR",
                "passed_test_cases": 0,
                "total_test_cases": 0,
                "runtime": 0,
                "stdout": "",
                "error_message": "No sample test cases configured for this problem."
            })

        result = run_submission(language,code, problem, sample_cases)

        return Response({
            "status": result["status"],
            "passed_test_cases": result["passed"],
            "total_test_cases": result["total"],
            "runtime": result["runtime"],
            "stdout": result["stdout"],
            "error_message": result["error_message"],
        })


import logging
logger = logging.getLogger(__name__)

class CodeSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [CodeExecutionThrottle]

    def post(self, request):
        problem_id = request.data.get("problem_id")
        code = request.data.get("code")
        language = request.data.get("language", "python")

        if not problem_id or not isinstance(code, str) or not code:
            return Response(
                {"error": "Missing problem_id or code payload attributes."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate code size to prevent DoS
        if len(code) > MAX_CODE_SIZE:
            return Response(
                {"error": f"Code exceeds maximum size of {MAX_CODE_SIZE // 1024}KB"},
                status=status.HTTP_413_PAYLOAD_TOO_LARGE
            )

        if language not in SUPPORTED_LANGUAGES:
            return Response({"error": "Unsupported language."}, status=status.HTTP_400_BAD_REQUEST)

        problem = get_object_or_404(Problem, id=problem_id)
        user = request.user

        # Create submission record
        submission = Submission.objects.create(
            user=user,
            problem=problem,
            code=code,
            language=language,
            status='PENDING'
        )

        # Update status to RUNNING and auto-save code
        submission.status = "RUNNING"
        submission.save(update_fields=["status"])

        SavedCode.objects.update_or_create(
            user=user,
            problem=problem,
            defaults={
                'code': code,
                'language': language,
            }
        )

        # Queue async task to execute code via Celery (non-blocking)
        try:
            execute_submission.delay(submission.id)
            return Response({
                "submission_id": submission.id,
                "status": submission.status,
                "passed_test_cases": 0,
                "total_test_cases": 0,
                "runtime": 0,
                "stdout": "",
                "error_message": "Execution queued. Check back for results."
            }, status=status.HTTP_202_ACCEPTED)
        except Exception as exc:
            # Celery/Redis broker is unavailable - reject request instead of hanging
            logger.warning(f"Celery task queue unavailable ({exc}), rejecting submission")
            submission.status = "ERROR"
            submission.error_message = "Task queue unavailable. Please try again later."
            submission.save()
            
            return Response(
                {"error": "Task queue unavailable. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class SubmissionStatusView(APIView):
    """Check the status and results of an asynchronous code submission."""
    permission_classes = [IsAuthenticated]

    def get(self, request, submission_id):
        submission = get_object_or_404(Submission, id=submission_id, user=request.user)
        return Response({
            "submission_id": submission.id,
            "status": submission.status,
            "passed_test_cases": submission.passed_test_cases,
            "total_test_cases": submission.total_test_cases,
            "runtime": submission.runtime,
            "stdout": submission.stdout,
            "error_message": submission.error_message,
        })


class SavedCodeView(APIView):
    """Load or save a user's latest code for a specific problem."""
    permission_classes = [IsAuthenticated]

    def get(self, request, problem_id):
        """Load the user's saved code for this problem."""
        problem = get_object_or_404(Problem, id=problem_id)
        try:
            saved = SavedCode.objects.get(user=request.user, problem=problem)
            serializer = SavedCodeSerializer(saved)
            return Response(serializer.data)
        except SavedCode.DoesNotExist:
            return Response({"code": None, "language": "python"})

    def put(self, request, problem_id):
        """Save/update the user's code for this problem."""
        problem = get_object_or_404(Problem, id=problem_id)
        code = request.data.get("code", "")
        language = request.data.get("language", "python")

        # Validate code size
        if not isinstance(code, str):
            return Response({"error": "Code must be text."}, status=status.HTTP_400_BAD_REQUEST)
        if len(code) > MAX_CODE_SIZE:
            return Response(
                {"error": f"Code exceeds maximum size of {MAX_CODE_SIZE // 1024}KB"},
                status=status.HTTP_413_PAYLOAD_TOO_LARGE
            )
        if language not in SUPPORTED_LANGUAGES:
            return Response({"error": "Unsupported language."}, status=status.HTTP_400_BAD_REQUEST)

        saved, created = SavedCode.objects.update_or_create(
            user=request.user,
            problem=problem,
            defaults={
                'code': code,
                'language': language,
            }
        )
        serializer = SavedCodeSerializer(saved)
        return Response(serializer.data)

class InterviewStartView(APIView):
    """Start an AI mock interview by returning problems based on level and the first AI message."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIInterviewThrottle]

    def post(self, request):
        level = request.data.get("level", "easy")
        
        easy_count, med_count, hard_count = 0, 0, 0
        if level == "easy":
            easy_count = 2
        elif level == "intermediate":
            easy_count = 1
            med_count = 1
        elif level == "pro":
            med_count = 1
            hard_count = 1
        else:
            easy_count = 2 # fallback
            
        problems = []
        if easy_count > 0:
            problems.extend(list(Problem.objects.filter(difficulty="easy").order_by('?')[:easy_count]))
        if med_count > 0:
            problems.extend(list(Problem.objects.filter(difficulty="medium").order_by('?')[:med_count]))
        if hard_count > 0:
            problems.extend(list(Problem.objects.filter(difficulty="hard").order_by('?')[:hard_count]))
            
        if not problems:
            problems = list(Problem.objects.order_by('?')[:2])
            if not problems:
                return Response({"error": "No problems available."}, status=status.HTTP_404_NOT_FOUND)
        
        problem_data_list = [{
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "difficulty": p.difficulty,
            "function_name": p.function_name,
            "parameter_names": p.parameter_names
        } for p in problems]
        
        initial_message = start_interview(problems[0])
        return Response({
            "problems": problem_data_list,
            "initial_message": initial_message
        })

class InterviewChatView(APIView):
    """Handle chat interaction with the AI interviewer."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIInterviewThrottle]

    def post(self, request):
        problem_id = request.data.get("problem_id")
        chat_history = request.data.get("chat_history", [])
        current_code = request.data.get("current_code", "")
        new_message = request.data.get("new_message", "")

        if not isinstance(chat_history, list) or len(chat_history) > MAX_INTERVIEW_HISTORY_ITEMS:
            return Response({"error": "Invalid or oversized chat history."}, status=status.HTTP_400_BAD_REQUEST)
        if not all(isinstance(message, dict) for message in chat_history):
            return Response({"error": "Invalid chat history."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(current_code, str) or not isinstance(new_message, str):
            return Response({"error": "Interview content must be text."}, status=status.HTTP_400_BAD_REQUEST)
        if len(current_code) > MAX_CODE_SIZE or len(new_message) > MAX_INTERVIEW_MESSAGE_SIZE:
            return Response({"error": "Interview content is too large."}, status=status.HTTP_413_PAYLOAD_TOO_LARGE)

        problem = get_object_or_404(Problem, id=problem_id)
        
        response_text = generate_chat_response(problem, chat_history, current_code, new_message)
        
        return Response({"response": response_text})

class InterviewNextProblemView(APIView):
    """Get the initial AI prompt for the next problem in the sequence."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIInterviewThrottle]

    def get(self, request, problem_id):
        problem = get_object_or_404(Problem, id=problem_id)
        initial_message = start_interview(problem)
        return Response({
            "initial_message": initial_message
        })

class InterviewGradeView(APIView):
    """Grade an interview transcript."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIInterviewThrottle]
    
    def post(self, request):
        transcript = request.data.get("transcript", "")
        if not transcript:
            return Response({"error": "Missing transcript."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(transcript, str) or len(transcript) > MAX_INTERVIEW_TRANSCRIPT_SIZE:
            return Response({"error": "Interview transcript is too large."}, status=status.HTTP_413_PAYLOAD_TOO_LARGE)
            
        grade_text = generate_interview_grade(transcript)
        return Response({"grade_report": grade_text})

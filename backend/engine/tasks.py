"""
Celery tasks for the engine app.
Async code execution, grading, and interview AI tasks.
"""

from celery import shared_task
from .grader import run_submission
from .models import Submission
from curriculum.models import Problem
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=1)
def execute_submission(self, submission_id):
    """
    Async task to execute a code submission against all test cases.
    Updates the Submission record with results.
    
    Args:
        submission_id: Primary key of the Submission record to execute.
        
    Raises:
        Submission.DoesNotExist if submission is not found (task will be retried).
    """
    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist as exc:
        logger.error(f"Submission {submission_id} not found")
        # Retry after 10 seconds in case DB is being written
        raise self.retry(exc=exc, countdown=10)
    
    try:
        problem = submission.problem
        test_cases = problem.test_cases.all().order_by('order', 'id')
        
        # Execute code against all test cases
        result = run_submission(submission.language, submission.code, problem, test_cases)
        
        # Update submission with results
        submission.status = result["status"]
        submission.passed_test_cases = result["passed"]
        submission.total_test_cases = result["total"]
        submission.runtime = result["runtime"]
        submission.stdout = result["stdout"]
        submission.error_message = result["error_message"]
        submission.save()
        
        logger.info(f"Submission {submission_id} completed with status {result['status']}")
        return {
            "submission_id": submission_id,
            "status": result["status"],
            "passed": result["passed"],
            "total": result["total"],
        }
        
    except Exception as exc:
        logger.exception(f"Error executing submission {submission_id}: {exc}")
        submission.status = "ERROR"
        submission.error_message = f"Task execution failed: {str(exc)[:500]}"
        submission.save()
        raise

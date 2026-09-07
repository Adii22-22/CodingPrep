from django.db import models
from django.contrib.auth.models import User
from curriculum.models import Problem 

class TestCase(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='test_cases')
    
    input_data = models.JSONField(help_text="The input parameters (e.g., arrays, strings, integers) as JSON objects.")
    expected_output = models.JSONField(help_text="The expected return value or output as a JSON object.")
    
    is_sample = models.BooleanField(default=False, help_text="If True, this is visible to the user as an example.")
    order = models.PositiveIntegerField(default=1, help_text="The execution sequence for the test cases.")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Test Case #{self.id} for {self.problem.title} (Sample: {self.is_sample})"


class Submission(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('RUNNING', 'Running'),
        ('ACCEPTED', 'Accepted'),
        ('WRONG_ANSWER', 'Wrong Answer'),
        ('TIME_LIMIT_EXCEEDED', 'Time Limit Exceeded'),
        ('RUNTIME_ERROR', 'Runtime Error'),
        ('COMPILE_ERROR', 'Compile Error'),
        ('ERROR', 'Error')
    ]

    LANGUAGE_CHOICES = [
        ('python', 'Python 3'),
        ('c', 'C'),
        ('java', 'Java'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='submissions')
    code = models.TextField(help_text="The user's source code submission.")
    

    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='python')
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='PENDING')
    

    passed_test_cases = models.IntegerField(default=0)
    total_test_cases = models.IntegerField(default=0)
    
    runtime = models.FloatField(null=True, blank=True, help_text="Execution time in seconds.")
    memory = models.IntegerField(null=True, blank=True, help_text="Memory usage in KB.")
    
    stdout = models.TextField(blank=True, null=True, help_text="Standard output from the user's program execution.")
    error_message = models.TextField(blank=True, null=True, help_text="Stderr or stack trace if a runtime/compile error occurs.")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission #{self.id} by {self.user.username} - {self.status} ({self.passed_test_cases}/{self.total_test_cases})"


class SavedCode(models.Model):
    """
    Stores the latest code a user has written for each problem.
    Like LeetCode — when you revisit a problem, your last code is restored.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_codes')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='saved_codes')
    code = models.TextField(help_text="The user's latest code for this problem.")
    language = models.CharField(max_length=20, choices=Submission.LANGUAGE_CHOICES, default='python')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'problem')
        ordering = ['-updated_at']

    def __str__(self):
        return f"SavedCode for {self.user.username} on {self.problem.title}"
from django.urls import path
from .views import CodeSubmitView, CodeRunView, SampleTestCasesView, SavedCodeView, InterviewStartView, InterviewChatView, InterviewNextProblemView, InterviewGradeView

urlpatterns = [
    path('submit/', CodeSubmitView.as_view(), name='code-submit'),
    path('run/', CodeRunView.as_view(), name='code-run'),
    path('testcases/<int:problem_id>/', SampleTestCasesView.as_view(), name='sample-testcases'),
    path('saved-code/<int:problem_id>/', SavedCodeView.as_view(), name='saved-code'),
    path('interview/start/', InterviewStartView.as_view(), name='interview-start'),
    path('interview/chat/', InterviewChatView.as_view(), name='interview-chat'),
    path('interview/next/<int:problem_id>/', InterviewNextProblemView.as_view(), name='interview-next'),
    path('interview/grade/', InterviewGradeView.as_view(), name='interview-grade'),
]
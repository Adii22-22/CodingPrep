from rest_framework import routers
from .views import CategoryViewSet, LessonViewSet, TopicViewSet, ProblemViewSet

router = routers.DefaultRouter()

router.register('categories', CategoryViewSet)
router.register('topics', TopicViewSet)
router.register('lessons', LessonViewSet)
router.register('problems', ProblemViewSet)

urlpatterns = router.urls
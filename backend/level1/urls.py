from django.urls import path
from . import views

urlpatterns = [
    path('fetch_comments/', views.fetch_comments, name='fetch_latest_video_comments'),
    # path('analysis/', views.analyze_comments, name="analyze_comments"),
]

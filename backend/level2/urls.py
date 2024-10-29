from django.urls import path
from . import views;
urlpatterns = [
    path('upload/', views.upload_view, name='upload_video'),
    path('videos/', views.video_carousel_view, name='video_carousel'),
    path('subscribers/<str:channel_name>/', views.get_subscriber_count, name='get_subscriber_count'),
    # path('api/signup/', signup_view, name='signup'),
    path('api/channel-info/<str:channel_name>/', views.channel_info_view, name='channel-info'),

]

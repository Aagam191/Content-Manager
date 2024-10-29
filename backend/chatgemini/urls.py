from django.urls import path
from . import views

urlpatterns = [
    path('save-chat/', views.save_chat_history, name='save_chat_history'),
    path('get-chats/', views.get_chat_history, name='get_chat_history'),
]

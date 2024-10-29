from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router for CreatorViewSet


urlpatterns = [
    # Todo URLs
    path('todos/', views.todo_list_create, name='todo-list-create'),
    path('todos/<int:pk>/', views.todo_retrieve_update_destroy, name='todo-retrieve-update-destroy'),


    # Creator URLs
    path('get-profile/', views.get_profile, name='get_profile'),
    path('update-profile/', views.update_profile, name='update_profile'),
]
    
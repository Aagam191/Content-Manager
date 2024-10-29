from django.urls import path
from . import views

urlpatterns = [
    path('combined/', views.combined_chart, name='combined_chart'),
]

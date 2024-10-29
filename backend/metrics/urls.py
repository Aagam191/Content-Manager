from django.urls import path
from .views import get_metrics_data  # Import the view function

urlpatterns = [
    path('fetch/metrics/', get_metrics_data, name='get_metrics_data'),  # Define the URL pattern
]

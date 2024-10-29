from django.urls import path
from . import views

urlpatterns = [
    path('combined-growth/', views.display_combined_graph, name='combined-growth'),
    # path('aud-views/', views.combined_audience_views_graph_view, name='display_audience_and_views'),  # For Audience Demographics & Views Over Time

]

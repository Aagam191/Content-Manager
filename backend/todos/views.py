from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Todo, Profile1
from .serializers import TodoSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Profile1
from .serializers import Profile1Serializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser
# List all todos or create a new todo
@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def todo_list_create(request):
    if request.method == 'GET':
        todos = Todo.objects.all()
        serializer = TodoSerializer(todos, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = TodoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Retrieve, update, or delete a specific todo
@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def todo_retrieve_update_destroy(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == 'GET':
        serializer = TodoSerializer(todo)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = TodoSerializer(todo, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        todo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# PROFILE

# Retrieve profile
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def get_profile(request):
    profile = Profile1.objects.order_by('-id').first()  # Fetch the most recent profile
    if not profile:
        return JsonResponse({'error': 'Profile not found'}, status=404)

    serializer = Profile1Serializer(profile)
    return JsonResponse(serializer.data)

# Update profile
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Profile1

@csrf_exempt
def update_profile(request):
    if request.method == 'POST':
        try:
            # Parse the form data
            name = request.POST.get('name')
            profile_pic = request.FILES.get('profile_pic', None)

            # Create a new profile or update an existing one
            # Assuming one profile per user or a new profile
            profile = Profile1.objects.first()  # Get the first profile or create one if needed
            if profile is None:
                profile = Profile1()  # Create a new profile if none exists

            profile.name = name
            if profile_pic:
                # Handle file saving
                if profile.profile_pic:
                    profile.profile_pic.delete()  # Delete old file
                profile.profile_pic = profile_pic

            profile.save()
            return JsonResponse({'message': 'Profile updated successfully!'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

# todos/serializers.py

from rest_framework import serializers
from .models import Todo
# from .models import UserProfile

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ['id', 'title', 'completed', 'due_date']  # Include due_date

# for profile
from rest_framework import serializers
from .models import Profile1

class Profile1Serializer(serializers.ModelSerializer):
    class Meta:
        model = Profile1
        fields = ['name', 'profile_pic']



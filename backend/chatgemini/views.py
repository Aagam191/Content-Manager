from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import ChatHistory
from .serializers import ChatHistorySerializer

@api_view(['POST'])
def save_chat_history(request):
    serializer = ChatHistorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_chat_history(request):
    chats = ChatHistory.objects.all().order_by('-created_at')
    serializer = ChatHistorySerializer(chats, many=True)
    return Response(serializer.data)

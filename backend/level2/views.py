import os
import logging
import requests
from django.http import JsonResponse
from django.core.cache import cache
from django.views.decorators.csrf import csrf_exempt
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.http import MediaFileUpload
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.utils.datastructures import MultiValueDictKeyError  # Import this

import json

logger = logging.getLogger(__name__)

# Set the scope for YouTube API
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
CLIENT_SECRET_FILE = 'C:/Users/aagam shah/Documents/College Stuff/SEM-4/Projects/aagamindi/backend/level2/client_secret.json'
API_KEY = "AIzaSyAWJBykUr_1cnG8Nh5ZSdCoWCLyXk3TL1o"

CACHE_TIMEOUT = 60 * 60  # Cache timeout in seconds (1 hour)
# CACHE_TIMEOUT = 600  # Cache timeout of 10 minutes

# Helper function to get channelId by channel name, with caching
def get_channel_id_by_name(channel_name):
    cache_key = f'channel_id_{channel_name}'
    channel_id = cache.get(cache_key)

    if not channel_id:
        url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={channel_name}&key={API_KEY}'
        response = requests.get(url)
        data = response.json()

        if 'items' in data and len(data['items']) > 0:
            channel_id = data['items'][0]['snippet']['channelId']
            cache.set(cache_key, channel_id, CACHE_TIMEOUT)  # Cache the channel_id
        else:
            return None

    return channel_id

# Helper function to fetch channel profile pic, with caching
def fetch_youtube_channel_profile_pic(channel_id):
    cache_key = f'channel_profile_pic_{channel_id}'
    profile_pic_url = cache.get(cache_key)

    if not profile_pic_url:
        url = f'https://www.googleapis.com/youtube/v3/channels?part=snippet&id={channel_id}&key={API_KEY}'
        response = requests.get(url)
        data = response.json()

        if 'items' in data and len(data['items']) > 0:
            profile_pic_url = data['items'][0]['snippet']['thumbnails']['high']['url']
            cache.set(cache_key, profile_pic_url, CACHE_TIMEOUT)  # Cache the profile pic URL
        else:
            return None

    return profile_pic_url

# Helper function to fetch YouTube videos, with caching
import requests
from django.core.cache import cache
from django.http import JsonResponse


def fetch_youtube_videos(channel_id):
    cache_key = f'channel_videos_{channel_id}'
    videos = cache.get(cache_key)

    if not videos:
        # Step 1: Fetch a larger set of videos from the YouTube search API
        search_url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={channel_id}&part=snippet&type=video&order=date&maxResults=10"
        search_response = requests.get(search_url)
        search_data = search_response.json()

        if 'items' in search_data:
            video_ids = []
            videos = []

            # Step 2: Collect the video IDs
            for item in search_data['items']:
                video_id = item['id']['videoId']
                video_ids.append(video_id)

            video_id_str = ",".join(video_ids)
            stats_url = f"https://www.googleapis.com/youtube/v3/videos?key={API_KEY}&id={video_id_str}&part=statistics"
            stats_response = requests.get(stats_url)
            stats_data = stats_response.json()

            # Step 3: Combine video details with their statistics
            for i, item in enumerate(search_data['items']):
                video_id = item['id']['videoId']
                video_stats = stats_data['items'][i]['statistics']

                video_data = {
                    'title': item['snippet']['title'],
                    'thumbnail': get_hd_thumbnail_base64(video_id),
                    'video_url': f"https://www.youtube.com/watch?v={video_id}",
                    'views': int(video_stats.get('viewCount', 0)),  # Convert views to integer
                    'likes': int(video_stats.get('likeCount', 0)),  # Convert likes to integer
                }
                videos.append(video_data)

            # Step 4: Sort the videos by views in descending order
            videos = sorted(videos, key=lambda x: x['views'], reverse=True)

            # Step 5: Cache the video data for optimization
            cache.set(cache_key, videos, CACHE_TIMEOUT)

    return videos if videos else []

# Django view to return the top-performing videos as JSON
def video_carousel_view(request):
    channel_name = 'SuperSuper'  # Change to the desired channel name
    channel_id = get_channel_id_by_name(channel_name)

    if not channel_id:
        return JsonResponse({'error': f'Channel not found for name: {channel_name}'}, status=404)

    videos = fetch_youtube_videos(channel_id)

    # Return the top 5 performing videos based on views
    top_videos = videos[:5]

    return JsonResponse({'videos': top_videos})



# Function to get subscriber count, with caching
def get_subscriber_count(request, channel_name):
    cache_key = f'subscriber_count_{channel_name}'
    subscriber_count = cache.get(cache_key)
    print(channel_name)
    if not subscriber_count:
        channel_id = get_channel_id_by_name(channel_name)
        if not channel_id:
            return JsonResponse({'error': 'Channel not found'}, status=404)

        youtube_url = f'https://www.googleapis.com/youtube/v3/channels?part=statistics&id={channel_id}&key={API_KEY}'

        try:
            response = requests.get(youtube_url)
            data = response.json()
            if 'items' in data and len(data['items']) > 0:
                subscriber_count = data['items'][0]['statistics']['subscriberCount']
                cache.set(cache_key, subscriber_count, CACHE_TIMEOUT)  # Cache the subscriber count
                return JsonResponse({'subscriber_count': subscriber_count}, status=200)
            else:
                return JsonResponse({'error': 'No subscriber data available'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'subscriber_count': subscriber_count}, status=200)

# Function to upload a video to YouTube

import os
import tempfile
from django.http import JsonResponse
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
# from django.utils.datastructures import MultiValueDictKeyError
from googleapiclient.http import MediaIoBaseUpload


# Ensure you have your CLIENT_SECRET_FILE and SCOPES defined


def upload_video_to_youtube(request):
    print(request)
    if request.method == 'POST':
        try:
            # Extract file and other fields from the request
            video_file = request.FILES['video']  # 'video' is the key in formData
            title = request.POST.get('title', '')
            description = request.POST.get('description', '')
            category_id = request.POST.get('category', '22')  # default category as 'People & Blogs'
            privacy_status = request.POST.get('privacy_status', 'public')
            print(video_file,title,description)
            # Authentication
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
            credentials = flow.run_local_server(port=0)

            youtube = build('youtube', 'v3', credentials=credentials)

            # Save the file to a temporary location (required for uploading to YouTube)
            with open('/tmp/uploaded_video.mp4', 'wb+') as destination:
                for chunk in video_file.chunks():
                    destination.write(chunk)

            # Prepare the media file upload
            media = MediaFileUpload('/tmp/uploaded_video.mp4', chunksize=-1, resumable=True)

            # Create video metadata for YouTube
            request_body = {
                'snippet': {
                    'title': title,
                    'description': description,
                    'categoryId': category_id
                },
                'status': {
                    'privacyStatus': privacy_status,
                    'selfDeclaredMadeForKids': False,
                }
            }

            # Upload the video to YouTube
            youtube_response = youtube.videos().insert(
                part='snippet,status',
                body=request_body,
                media_body=media
            ).execute()

            # Return success response
            return JsonResponse({'youtube_response': youtube_response}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


# CSRF-exempt for receiving YouTube uploads
@csrf_exempt
def video_upload_view(request):
    return upload_video_to_youtube(request)

# Function to upload video metadata and other info (e.g., creator's name, title)
def get_authenticated_service():
    try:
        flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
        credentials = flow.run_local_server(port=0)
        youtube = build('youtube', 'v3', credentials=credentials)
        return youtube
    except Exception as e:
        logger.error(f"Error during authentication: {e}")
        raise


@csrf_exempt
def upload_view(request):
    if request.method == 'POST':
        try:
            # Extract file and other fields from the request
            video_file = request.FILES['video_file']  # 'video_file' should match formData key
            title = request.POST.get('title', '')
            description = request.POST.get('description', '')
            category_id = request.POST.get('category_id', '22')  # Default category ID if not provided
            privacy_status = request.POST.get('privacy_status', 'public')

            # Authentication: Initialize the YouTube API
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
            credentials = flow.run_local_server(port=0)
            youtube = build('youtube', 'v3', credentials=credentials)

            # Prepare the file as an in-memory stream
            video_io = BytesIO(video_file.read())
            media = MediaIoBaseUpload(video_io, mimetype=video_file.content_type, chunksize=-1, resumable=True)

            # Prepare the metadata for the video
            request_body = {
                'snippet': {
                    'title': title,
                    'description': description,
                    'categoryId': category_id
                },
                'status': {
                    'privacyStatus': privacy_status,
                    'selfDeclaredMadeForKids': False,
                }
            }

            # Upload the video to YouTube
            youtube_response = youtube.videos().insert(
                part='snippet,status',
                body=request_body,
                media_body=media
            ).execute()

            # Return the YouTube response to the frontend
            return JsonResponse({'youtube_response': youtube_response}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


import requests

# def fetch_youtube_videos(channel_id):
#     # Step 1: Fetch basic video details from the YouTube search API
#     search_url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={channel_id}&part=snippet&type=video&order=date&maxResults=5"
#     search_response = requests.get(search_url)
#     search_data = search_response.json()

#     if 'items' in search_data:
#         video_ids = []
#         videos = []
        
#         # Step 2: Extract video IDs from the search response
#         for item in search_data['items']:
#             video_id = item['id']['videoId']
#             video_ids.append(video_id)

#         # Step 3: Fetch video statistics using the video IDs
#         video_id_str = ",".join(video_ids)
#         stats_url = f"https://www.googleapis.com/youtube/v3/videos?key={API_KEY}&id={video_id_str}&part=statistics"
#         stats_response = requests.get(stats_url)
#         stats_data = stats_response.json()

#         # Step 4: Combine video details with statistics
#         for i, item in enumerate(search_data['items']):
#             video_id = item['id']['videoId']
#             video_stats = stats_data['items'][i]['statistics']

#             video_data = {
#                 'title': item['snippet']['title'],
#                 'thumbnail': f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
#                 'video_url': f"https://www.youtube.com/watch?v={video_id}",
#                 'views': video_stats.get('viewCount', 0),
#                 'likes': video_stats.get('likeCount', 0),
#             }
#             videos.append(video_data)

#         return videos
#     else:
#         return []



# # Django view to return the latest videos as JSON
# def video_carousel_view(request):
#     channel_name = 'SuperSuper'  # Change to the channel name
#     channel_id = get_channel_id_by_name(channel_name)

#     if not channel_id:
#         return JsonResponse({'error': f'Channel not found for name: {channel_name}'}, status=404)

#     videos = fetch_youtube_videos(channel_id)
#     print("Backend Response:", videos)

#     return JsonResponse({'videos':videos})


# Signup view function
# @csrf_exempt
# def signup_view(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         username = data.get('username')
#         password = data.get('password')

#         # Check if user already exists
#         if User.objects.filter(username=username).exists():
#             return JsonResponse({'error': 'Username already taken'}, status=400)

#         # Create a new user
#         user = User.objects.create_user(username=username, password=password)
#         user.save()

#         return JsonResponse({'message': 'User created successfully'}, status=201)
    
#     return JsonResponse({'error': 'Invalid request method'}, status=400)

# # Login view function
# @csrf_exempt
# def login_view(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         username = data.get('username')
#         password = data.get('password')

#         user = authenticate(username=username, password=password)

#         if user is not None:
#             login(request, user)
#             return JsonResponse({'message': 'Login successful'}, status=200)
#         else:
#             return JsonResponse({'error': 'Invalid credentials'}, status=400)

#     return JsonResponse({'error': 'Invalid request method'}, status=400)

def channel_info_view(request, channel_name):
    cache_key_info = f'channel_info_{channel_name}'
    channel_info = cache.get(cache_key_info)

    if not channel_info:
        # If channel info is not cached, fetch from API
        url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={channel_name}&key={API_KEY}'
        response = requests.get(url)
        data = response.json()

        if 'items' in data and len(data['items']) > 0:
            channel_id = data['items'][0]['snippet']['channelId']
            profile_pic = data['items'][0]['snippet']['thumbnails']['high']['url']
            title = data['items'][0]['snippet']['title']

            # Cache the channel info (id, title, profile picture)
            channel_info = {
                'channel_id': channel_id,
                'title': title,
                'profile_pic': profile_pic
            }
            cache.set(cache_key_info, channel_info, CACHE_TIMEOUT)
        else:
            return JsonResponse({'error': 'Channel not found'}, status=404)

    return JsonResponse(channel_info)



import requests
from PIL import Image
from io import BytesIO
import base64

def get_hd_thumbnail_base64(video_id):
    # URL format for HD thumbnail
    hd_thumbnail_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    
    # Fetch the image
    response = requests.get(hd_thumbnail_url)
    
    if response.status_code == 200:
        # Convert the image content to a PIL image
        img = Image.open(BytesIO(response.content))
        
        # Convert the image to a byte stream
        img_buffer = BytesIO()
        img.save(img_buffer, format="JPEG")
        img_buffer.seek(0)
        
        # Encode the byte stream as base64
        img_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
        
        return img_base64  # Return the base64 string of the image
    else:
        print("Could not retrieve HD thumbnail. It may not be available for this video.")
        return None


import requests
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError
from transformers import pipeline

API_KEY = "AIzaSyAhhbaibqxDfBycyyAM5RtuXVWivvVCXx8"  # Replace with your YouTube API Key

def get_channel_id_by_name(channel_name):
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={channel_name}&key={API_KEY}"
    response = requests.get(url)
    data = response.json()
    if 'items' in data and len(data['items']) > 0:
        return data['items'][0]['snippet']['channelId']
    return None

def get_latest_video_id(channel_id):
    url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={channel_id}&part=snippet,id&order=date&maxResults=1"
    response = requests.get(url)
    data = response.json()
    if 'items' in data and len(data['items']) > 0:
        return data['items'][0]['id']['videoId'], data['items'][0]['snippet']['title']
    return None, None

def get_video_id_by_title(channel_id, video_title):
    url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={channel_id}&part=snippet,id&q={video_title}&order=date&maxResults=1"
    response = requests.get(url)
    data = response.json()
    if 'items' in data and len(data['items']) > 0:
        return data['items'][0]['id']['videoId'], data['items'][0]['snippet']['title']
    return None, None

def get_comments(video_id):
    url = f"https://www.googleapis.com/youtube/v3/commentThreads?key={API_KEY}&textFormat=plainText&part=snippet&videoId={video_id}&maxResults=50"
    response = requests.get(url)
    data = response.json()
    comments = []
    if 'items' in data:
        for item in data['items']:
            comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
            comments.append(comment)
    return comments

@api_view(['POST'])
def fetch_comments(request):
    try:
        data = request.data
        channel_name = data.get('channel_name')
        video_title = data.get('video_title')

        if not channel_name:
            raise ValidationError("Channel name is required.")

        # Get Channel ID
        channel_id = get_channel_id_by_name(channel_name)
        if not channel_id:
            return JsonResponse({'error': 'Channel not found.'}, status=404)

        if video_title:
            # Get Video ID by Title if provided
            video_id, video_title = get_video_id_by_title(channel_id, video_title)
        else:
            # Get Latest Video ID and title if no title is provided
            video_id, video_title = get_latest_video_id(channel_id)

        if not video_id:
            return JsonResponse({'error': 'No videos found for this channel.'}, status=404)

        # Get Comments for the Video
        comments = get_comments(video_id)

        # Analyze Comments
        sentiment_results = analyze_comments_internal(comments)

        return JsonResponse({'comments': sentiment_results, 'video_title': video_title or 'Latest Video'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def analyze_comments_internal(comments):
    def filter_comments(comment_list, min_length=5):
        return [comment for comment in comment_list if len(comment) >= min_length]

    filtered_comments = filter_comments(comments)
    sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    results = sentiment_pipeline(filtered_comments)

    def map_sentiment(label, score):
        if label == "POSITIVE":
            return "positive"
        elif label == "NEGATIVE":
            return "negative"
        return "neutral"

    sentiment_results = [
        {
            'Comment': comment,
            'Sentiment_Label': map_sentiment(result['label'], result['score']),
            'Sentiment_Score': round(result['score'], 3)
        }
        for comment, result in zip(filtered_comments, results)
    ]
    
    return sentiment_results
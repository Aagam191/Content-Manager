# import requests
# from django.http import JsonResponse
# from rest_framework.decorators import api_view
# from rest_framework.exceptions import ValidationError

# API_KEY = "AIzaSyBcxp2n31_bRFWWRgTgaM7pdo0ZsK0Dlzs"  # Replace with your YouTube API Key
# # channel_name='Content Flow'
# def get_channel_id_by_name(channel_name):
#     url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={channel_name}&key={API_KEY}"
#     response = requests.get(url)
#     data = response.json()
#     if 'items' in data and len(data['items']) > 0:
#         return data['items'][0]['snippet']['channelId']
#     return None

# def get_latest_video_id(channel_id):
#     url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={channel_id}&part=snippet,id&order=date&maxResults=1"
#     response = requests.get(url)
#     data = response.json()
#     if 'items' in data and len(data['items']) > 0:
#         return data['items'][0]['id']['videoId']
#     return None

# def get_comments(video_id):
#     url = f"https://www.googleapis.com/youtube/v3/commentThreads?key={API_KEY}&textFormat=plainText&part=snippet&videoId={video_id}&maxResults=50"
#     response = requests.get(url)
#     data = response.json()
#     comments = []
#     if 'items' in data:
#         for item in data['items']:
#             comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
#             comments.append(comment)
#     return comments

# @api_view(['POST'])
# def fetch_latest_video_comments(request):
#     try:
#         data = request.data
#         channel_name = data.get('channel_name')
#         print(channel_name)

#         if not channel_name:
#             raise ValidationError("Channel name is required.")

#         # Step 1: Get Channel ID
#         channel_id = get_channel_id_by_name(channel_name)
#         if not channel_id:
#             return JsonResponse({'error': 'Channel not found.'}, status=404)

#         # Step 2: Get Latest Video ID
#         video_id = get_latest_video_id(channel_id)
#         if not video_id:
#             return JsonResponse({'error': 'No videos found for this channel.'}, status=404)

#         # Step 3: Get Comments for the Latest Video
#         comments = get_comments(video_id)

#         return JsonResponse({'comments': comments}, status=200)
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=400)

# # analyzing
# from django.http import JsonResponse
# from rest_framework.decorators import api_view
# from rest_framework.exceptions import ValidationError
# from transformers import pipeline

# # Load the sentiment-analysis model (ensure it is loaded once)
# sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

# def analyze_comments_internal(comments):
#     # Filter comments for better accuracy
#     def filter_comments(comment_list, min_length=5):
#         return [comment for comment in comment_list if len(comment) >= min_length]

#     filtered_comments = filter_comments(comments)
#     results = sentiment_pipeline(filtered_comments)

#     def map_sentiment(label, score):
#         if label == "POSITIVE":
#             return "positive"
#         elif label == "NEGATIVE":
#             return "negative"
#         return "neutral"

#     sentiment_results = [
#         {
#             'Comment': comment,
#             'Sentiment_Label': map_sentiment(result['label'], result['score']),
#             'Sentiment_Score': round(result['score'], 3)
#         }
#         for comment, result in zip(filtered_comments, results)
#     ]
    
#     return sentiment_results

# @api_view(['POST'])
# def analyze_comments(request):
#     try:
#         data = request.data
#         comments = data.get('comments', [])

#         if not isinstance(comments, list) or not all(isinstance(comment, str) for comment in comments):
#             raise ValidationError("Invalid input. 'comments' should be a list of strings.")

#         sentiment_results = analyze_comments_internal(comments)
#         return JsonResponse(sentiment_results, safe=False)
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=400)

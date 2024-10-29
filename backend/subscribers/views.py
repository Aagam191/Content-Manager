import os
import datetime
import matplotlib.pyplot as plt
from io import BytesIO
from django.http import HttpResponse
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import matplotlib.dates as mdates
SCOPES = ['https://www.googleapis.com/auth/yt-analytics.readonly']
TOKEN_PATH = 'token.json'
CREDENTIALS_PATH = 'C:/Users/aagam shah/Documents/College Stuff/SEM-4/Projects/aagamindi/backend/subscribers/client analytics.json'


def get_authenticated_service():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=8081)
        with open(TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())

    return creds


def fetch_subscriber_growth():
    creds = get_authenticated_service()
    youtube_analytics = build('youtubeAnalytics', 'v2', credentials=creds)

    today = datetime.date.today()
    first_day_of_this_month = today.replace(day=1)
    last_day_of_last_month = first_day_of_this_month - datetime.timedelta(days=1)
    first_day_of_last_month = last_day_of_last_month.replace(day=1)

    analytics_response = youtube_analytics.reports().query(
        ids="channel==MINE",
        startDate="2024-09-01",
        endDate="2024-09-20",
        metrics="subscribersGained",
        dimensions="day"
    ).execute()

    days_of_month = []
    subscribers_gained = []
    for row in analytics_response['rows']:
        day_of_month = int(row[0].split('-')[2])
        days_of_month.append(day_of_month)
        subscribers_gained.append(int(row[1]))

    return days_of_month, subscribers_gained


import requests

API_KEY = 'AIzaSyBcxp2n31_bRFWWRgTgaM7pdo0ZsK0Dlzs'  # Replace with your actual API key

def fetch_latest_videos_views(channel_id):
    video_titles = []
    video_views = []

    try:
        # Step 1: Fetch a larger set of videos from the YouTube search API
        search_url = (
            f"https://www.googleapis.com/youtube/v3/search?"
            f"key={API_KEY}&channelId={channel_id}&part=snippet&type=video&order=date&maxResults=5"
        )
        search_response = requests.get(search_url)
        search_data = search_response.json()

        if 'items' in search_data:
            video_ids = [item['id']['videoId'] for item in search_data['items']]
            video_id_str = ",".join(video_ids)

            # Step 2: Fetch video statistics
            stats_url = (
                f"https://www.googleapis.com/youtube/v3/videos?"
                f"key={API_KEY}&id={video_id_str}&part=statistics"
            )
            stats_response = requests.get(stats_url)
            stats_data = stats_response.json()

            # Step 3: Extract video titles and views
            for item in search_data['items']:
                video_id = item['id']['videoId']
                video_title = item['snippet']['title'][:12]

                # Find corresponding statistics for the video
                video_stat = next(
                    (stat for stat in stats_data['items'] if stat['id'] == video_id), {}
                ).get('statistics', {})

                video_view_count = int(video_stat.get('viewCount', 0))  # Convert views to integer

                # Append results
                video_titles.append(video_title)
                video_views.append(video_view_count)

    except Exception as e:
        print(f"An error occurred: {e}")

    return video_titles, video_views





import matplotlib.pyplot as plt
from io import BytesIO

def plot_combined_graph(dates, subscribers_gained, video_titles, video_views):
    # Create side-by-side subplots with same height ratio
    fig, ax = plt.subplots(1, 2, figsize=(18, 8))  # Increased width and height for zoomed view

    # Plot subscriber growth (with grid)
    ax[0].plot(dates, subscribers_gained, marker='o', color='b', label='Subscribers Gained')
    ax[0].set_xlabel('Date')
    ax[0].set_ylabel('Subscribers Gained')
    ax[0].set_title('Subscriber Growth Over the Last Month')
    ax[0].tick_params(axis='x', rotation=45)  # Rotate dates slightly for readability
    ax[0].grid(True)  # Add grid for the first graph

    # Plot video views
    bars = ax[1].bar(video_titles, video_views, color='c')
    ax[1].set_xlabel('Video Title')
    ax[1].set_ylabel('Views')
    ax[1].set_title('Views of Latest 5 Videos')
    ax[1].tick_params(axis='x', rotation=90)  # Set video titles to be vertical

    # Add value labels above the bars
    for bar in bars:
        height = bar.get_height()
        ax[1].text(
            bar.get_x() + bar.get_width() / 2.0, height,
            f'{height:,}',
            ha='center', va='bottom'
        )

    # Adjust the layout for better spacing
    plt.tight_layout()

    # Save plot to buffer
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    return buffer



def display_combined_graph(request):
    dates, subscribers_gained = fetch_subscriber_growth()
    video_titles, video_views = fetch_latest_videos_views('UCv6JhmcvEtUN8EYKJSrbo7w')
    plot_buffer = plot_combined_graph(dates, subscribers_gained, video_titles, video_views)

    return HttpResponse(plot_buffer, content_type='image/png')



# new two graphs


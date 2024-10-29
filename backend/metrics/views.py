import os
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from django.http import JsonResponse
from google.oauth2.credentials import Credentials
import datetime

# Scopes for YouTube Analytics and Data API
SCOPES = ['https://www.googleapis.com/auth/yt-analytics.readonly', 'https://www.googleapis.com/auth/youtube.readonly']
API_KEY='AIzaSyAWJBykUr_1cnG8Nh5ZSdCoWCLyXk3TL1o'
# Path to store the OAuth2 token
TOKEN_PATH = 'token.json'
CREDENTIALS_PATH = 'C:/Users/aagam shah/Documents/College Stuff/SEM-4/Projects/aagamindi/backend/metrics/client analytics.json'  # OAuth credentials file path

# Helper function to authenticate and get credentials
def get_authenticated_service():
    creds = None
    # Check if token exists and is valid
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    # If no valid token, initiate OAuth2 flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=8080)

        # Save the credentials for the future
        with open(TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())

    return creds


# Fetch total subscribers and total videos using YouTube Data API v3
def fetch_channel_statistics(youtube):
    request = youtube.channels().list(
        part="statistics",
        mine=True  # This needs OAuth2
    )
    response = request.execute()
    return response['items'][0]['statistics']['subscriberCount'], response['items'][0]['statistics']['videoCount']



# Fetch YouTube Analytics Data for the last month
def fetch_youtube_analytics_data():
    # Authenticate and build the service for YouTube Analytics API
    import datetime


    creds = get_authenticated_service()
    youtube_analytics = build('youtubeAnalytics', 'v2', credentials=creds)

    # Get the current date
    today = datetime.date.today()
    # Calculate startDate and endDate for the last month
    month_back = today.month - 1

# Handle the year change if the month goes below January
    if month_back <= 0:
        new_month = 12 + month_back  # Adjust for negative month (e.g., -1 becomes 11, -2 becomes 10)
        new_year = today.year - 1
    else:
        new_month = month_back
        new_year = today.year

# Set the first day of two months ago
    first_day_two_months_back = today.replace(year=new_year, month=new_month, day=1)

# Ending date is today's date
    end_date = today
    print(f'First day={first_day_two_months_back}')
    print(f'Last day={end_date}')

# Request for YouTube Analytics data from two months ago until today
    analytics_response = youtube_analytics.reports().query(
    ids="channel==MINE",
    startDate=str(first_day_two_months_back),
    endDate=str(end_date),
        metrics="views,estimatedMinutesWatched,subscribersGained,subscribersLost,averageViewDuration,",
        dimensions="day",
    ).execute()

    # Process the analytics response to sum up totals
    total_views = 0
    total_watch_time = 0
    total_subscribers_gained = 0
    total_subscribers_lost = 0
    average_view_duration = 0
    # total_videos=analytics_response['items'][0]['statistics']['videoCount']
    for row in analytics_response['rows']:
        total_views += int(row[1])  # Total views for the day
        total_watch_time += int(row[2])  # Watch time in minutes
        total_subscribers_gained += int(row[3])  # Subscribers gained for the day
        total_subscribers_lost += int(row[4])  # Subscribers lost for the day
        average_view_duration += int(row[5])  # Average view duration

    # Calculate net subscriber count (gained - lost)
    total_subscribers = total_subscribers_gained - total_subscribers_lost

    # Return the data as a dictionary
    return {
        "last_month_views": total_views,
        "last_month_watch_time": total_watch_time,
        "last_month_subscribers_gained": total_subscribers_gained,
        "total_subscribers": total_subscribers,  # Net subscribers
        "average_view_duration": average_view_duration
    }


# Django view to handle the metrics request
def get_metrics_data(request):
    # Fetch the YouTube Analytics and Data API data
    analytics_data = fetch_youtube_analytics_data()

    # Return the data as JSON
    return JsonResponse(analytics_data)

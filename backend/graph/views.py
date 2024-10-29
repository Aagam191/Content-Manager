import io
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from django.http import HttpResponse
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os

# Define YouTube Analytics scope
SCOPES = ['https://www.googleapis.com/auth/yt-analytics.readonly']

# Paths to your OAuth token and client secret files
TOKEN_PATH = 'token.json'
CREDENTIALS_PATH = 'C:/Users/aagam shah/Documents/College Stuff/SEM-4/Projects/aagamindi/backend/graph/client analytics.json'

def get_authenticated_service():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=8080)
            with open(TOKEN_PATH, 'w') as token:
                token.write(creds.to_json())

    return build('youtubeAnalytics', 'v2', credentials=creds)

def combined_chart(request):
    youtube_analytics = get_authenticated_service()

    # Fetch audience demographics data
    demographics_response = youtube_analytics.reports().query(
        ids="channel==MINE",
        startDate="2024-08-20",
        endDate="2024-09-17",
        metrics="viewerPercentage",
        dimensions="ageGroup,gender",
    ).execute()

    age_groups = []
    age_percentages = []
    gender_groups = []
    gender_percentages = []

    for row in demographics_response.get('rows', []):
        age_group = row[0]
        gender = row[1]
        percentage = float(row[2])

        if 'age' in age_group:
            age_groups.append(age_group)
            age_percentages.append(percentage)
        elif 'gender' in gender:
            gender_groups.append(gender)
            gender_percentages.append(percentage)

    # Combine age and gender data for the pie chart
    combined_labels = age_groups + gender_groups
    combined_percentages = age_percentages + gender_percentages

    # Fetch views over time data
    views_response = youtube_analytics.reports().query(
        ids="channel==MINE",
        startDate="2024-08-20",
        endDate="2024-09-17",
        metrics="views",
        dimensions="day",
    ).execute()

    dates = []
    views = []

    for row in views_response.get('rows', []):
        dates.append(row[0])
        views.append(int(row[1]))

    # Create combined plots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(18, 8))

    # Audience Demographics Pie Chart
    ax1.pie(combined_percentages, labels=combined_labels, autopct='%1.1f%%')
    ax1.set_title('Audience Demographics')

    # Views Over Time Line Chart
    ax2.plot(dates, views, marker='o')
    ax2.set_xlabel('Date')
    ax2.set_ylabel('Views')
    ax2.set_title('Views Over Time')
    ax2.xaxis.set_major_locator(ticker.MaxNLocator(10))
    ax2.grid(True)
    plt.xticks(rotation=45)

    # Adjust layout to prevent overlap
    plt.tight_layout()

    # Return the image as a response
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    
    return HttpResponse(buf, content_type='image/png')

# models.py
from django.db import models

class Comment(models.Model):
    comment_text = models.TextField()
    sentiment_label = models.CharField(max_length=10)  # "positive" or "negative"
    sentiment_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.comment_text

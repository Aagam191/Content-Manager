from django.db import models
from django.contrib.auth.models import User

class Todo(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)  # New field for due date

    def __str__(self):
        return self.title
    
# PROFILE    
# from django.db import models
# from django.contrib.auth.models import User

# class Profile1(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     name = models.CharField(max_length=255)
#     profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

    
from django.db import models
from django.contrib.auth.models import User

class Profile1(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # Ensure this line exists
    name = models.CharField(max_length=100)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        return self.name






from django.db import models
import uuid
from django.conf import settings  # to link user ForeignKey

class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)  # 1000 is a bit long for a room name
    
    def __str__(self):
        return self.name

class Message(models.Model):
    value = models.TextField()  # better for messages
    date = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # link to User model
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    
    def __str__(self):
        # Show a snippet of message and user
        return f"{self.user.username}: {self.value[:50]}"
    
    class Meta:
        ordering = ('date',)

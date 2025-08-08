import uuid
from django.urls import re_path
from . import consumers

uuid_pattern = r'(?P<room_id>[0-9a-f-]{36})'

websocket_urlpatterns = [
    re_path(rf'ws/chat/{uuid_pattern}/$', consumers.ChatConsumer.as_asgi()),
]

from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from .models import Room, Message
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import get_user_model
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        if text_data is None:
            logger.warning("No text data received")
            return

        data = json.loads(text_data)
        action = data.get('action')  # new field to distinguish signaling/chat
        username = data.get('username')

        if action == "chat":
            message = data.get('message')
            if not message or not username:
                logger.warning(f"Missing message or username in data: {data}")
                return
            await self.save_message(username, self.room_id, message)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': username,
                }
            )

        elif action in ["offer", "answer", "ice-candidate"]:
            # forward signaling messages to other peers in the same room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'signal_message',
                    'action': action,
                    'data': data.get('data'),
                    'username': username,
                }
            )

    async def signal_message(self, event):
        await self.send(text_data=json.dumps({
            'action': event['action'],
            'data': event['data'],
            'username': event['username'],
        }))

    async def chat_message(self, event):
        # This sends the message to the WebSocket client
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
        }))

    @database_sync_to_async
    def save_message(self, username, room_id, message):
        room = Room.objects.get(id=room_id)
        user = User.objects.get(username=username)
        Message.objects.create(
            room=room,
            user=user,
            value=message
        )

class PracticeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.uid_val = self.scope['url_route']['kwargs']['some_val']
        self.roomval = f'practice_{self.uid_val}'
        await self.channel_layer.group_add(
            self.roomval,
            self.channel_name
        )
        await self.accept()  # accept the connection

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.roomval,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        if text_data is None:
            return  # no text data received
        
        data = json.loads(text_data)
        print(data)
        value = data.get('value')

        await self.channel_layer.group_send(
            self.roomval,
            {
                'type': 'funcname',
                'value': value
            }
        )

    async def funcname(self, event):
        await self.send(text_data=json.dumps({
            'value': event['value'],
        }))
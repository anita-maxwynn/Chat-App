Perfect! Here's a complete **Django + WebRTC Video Call** example with:

* 🎥 WebRTC for peer-to-peer video
* 🔄 Django Channels for WebSocket signaling
* 🌐 Basic frontend in HTML/JavaScript

---

## ✅ 1. Project Structure

```bash
webrtc_django/
├── manage.py
├── webrtc_django/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── video/
│   ├── __init__.py
│   ├── consumers.py
│   ├── routing.py
│   ├── templates/
│   │   └── video/
│   │       └── call.html
│   ├── urls.py
│   └── views.py
```

---

## ⚙️ 2. Backend (Django + Channels)

### `requirements.txt`

```txt
Django==4.2
channels==4.0.0
```

Install:

```bash
pip install -r requirements.txt
```

---

### `webrtc_django/settings.py`

Add:

```python
INSTALLED_APPS = [
    ...
    'channels',
    'video',
]

ASGI_APPLICATION = 'webrtc_django.asgi.application'

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}
```

---

### `webrtc_django/asgi.py`

```python
import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
import video.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webrtc_django.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            video.routing.websocket_urlpatterns
        )
    ),
})
```

---

### `video/routing.py`

```python
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/signaling/$', consumers.SignalingConsumer.as_asgi()),
]
```

---

### `video/consumers.py`

```python
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SignalingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("video-call", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("video-call", self.channel_name)

    async def receive(self, text_data):
        await self.channel_layer.group_send(
            "video-call",
            {
                "type": "signal.message",
                "message": text_data,
            }
        )

    async def signal_message(self, event):
        await self.send(text_data=event["message"])
```

---

### `video/views.py`

```python
from django.shortcuts import render

def video_call(request):
    return render(request, 'video/call.html')
```

---

### `video/urls.py`

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.video_call, name='video_call'),
]
```

---

### `webrtc_django/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('video.urls')),
]
```

---

## 🌐 3. Frontend (HTML + JS)

### `video/templates/video/call.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebRTC Video Call</title>
    <style>
        video {
            width: 45%;
            margin: 10px;
            border: 2px solid #ccc;
        }
    </style>
</head>
<body>
    <h2>WebRTC Django Video Call</h2>
    <video id="localVideo" autoplay muted></video>
    <video id="remoteVideo" autoplay></video>

    <script>
        const localVideo = document.getElementById("localVideo");
        const remoteVideo = document.getElementById("remoteVideo");

        let localStream;
        let peerConnection;

        const config = {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        };

        const socket = new WebSocket("ws://" + window.location.host + "/ws/signaling/");

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (!peerConnection) await createPeerConnection();

            if (data.type === "offer") {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.send(JSON.stringify(answer));
            }

            if (data.type === "answer") {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
            }

            if (data.type === "ice-candidate") {
                try {
                    await peerConnection.addIceCandidate(data.candidate);
                } catch (e) {
                    console.error("Error adding received ice candidate", e);
                }
            }
        };

        async function createPeerConnection() {
            peerConnection = new RTCPeerConnection(config);

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.send(JSON.stringify({
                        type: "ice-candidate",
                        candidate: event.candidate
                    }));
                }
            };

            peerConnection.ontrack = (event) => {
                remoteVideo.srcObject = event.streams[0];
            };

            localStream.getTracks().forEach(track =>
                peerConnection.addTrack(track, localStream)
            );
        }

        async function init() {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;

            await createPeerConnection();

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.send(JSON.stringify(offer));
        }

        init();
    </script>
</body>
</html>
```

---

## 🚀 Run the App

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Open two browser tabs or windows at:

```
http://127.0.0.1:8000/
```

You’ll see a working WebRTC video call between the two!

---

## ✅ Summary

* 📡 WebRTC = Real-time peer-to-peer video/audio
* 🔁 Django Channels = WebSocket-based signaling
* 🧠 Socket.IO replaced by Django Consumers

---

Would you like me to help you deploy this to a live server or add features like **room support**, **mute**, or **screen sharing**?

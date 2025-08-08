from django.shortcuts import redirect

# Create your views here.
# views.py
from .serializers import RoomSerializer, MessageSerializer
from .models import Room, Message
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.http import HttpResponse, HttpResponseBadRequest
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from rest_framework.views import APIView
User = get_user_model()

def activate_user(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        # Redirect to a success page or login page
        frontend_url = 'http://localhost:5173/login'  # Adjust this to your
        return redirect(frontend_url)
    else:
        return HttpResponseBadRequest("Activation link is invalid!")


class RoomView(APIView):
    def get(self, request, format=None):
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class MessageView(APIView):
    def get(self, request, room_id, format=None):
        try:
            messages = Message.objects.filter(room__id=room_id)
        except Message.DoesNotExist:
            return HttpResponse(status=404)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
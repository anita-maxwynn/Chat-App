"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from chat.views import activate_user, RoomView, MessageView

urlpatterns = [
    path('admin/', admin.site.urls),
     # Include auth URLs if using Djoser
    path('auth/', include('djoser.urls')),
    # path('auth/', include('djoser.urls.authtoken'))
    path('auth/token/', include('djoser.urls.jwt')),  # if using JWT
    path('auth/activate/<uidb64>/<token>/', activate_user, name='activate-user'),
    path('chat/rooms/', RoomView.as_view(), name='room-list'),
    path('chat/rooms/<uuid:room_id>/messages/', MessageView.as_view(), name='message-list'),
]

from django.contrib import admin
from .models import Room, Message

# Register your models here.
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name',)

class MessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'room', 'value', 'date')
    list_filter = ('room', 'user')
    search_fields = ('value',)

admin.site.register(Room, RoomAdmin)
admin.site.register(Message, MessageAdmin)

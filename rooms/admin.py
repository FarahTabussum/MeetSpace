from django.contrib import admin
from .models import Room


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['room_number', 'floor', 'min_occupancy', 'max_occupancy', 'is_active']
    list_filter = ['floor', 'is_active']
    search_fields = ['room_number']

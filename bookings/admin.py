from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['meeting_title', 'room', 'user', 'date', 'start_time', 'end_time', 'status']
    list_filter = ['status', 'date', 'room']
    search_fields = ['meeting_title', 'user__email', 'room__room_number']

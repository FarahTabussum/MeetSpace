from rest_framework import serializers
from .models import Booking
from rooms.serializers import RoomSerializer
from accounts.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    room_details = RoomSerializer(source='room', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'meeting_title', 'date', 'start_time', 'end_time',
            'number_of_participants', 'room', 'room_details', 'user', 'user_details',
            'status', 'cancellation_reason', 'cancelled_at', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'cancellation_reason', 'cancelled_at', 'created_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['meeting_title', 'date', 'start_time', 'end_time', 'number_of_participants', 'room']


class AvailabilitySearchSerializer(serializers.Serializer):
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    number_of_participants = serializers.IntegerField(min_value=1)

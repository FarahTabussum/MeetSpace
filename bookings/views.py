from datetime import datetime, timedelta
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer, AvailabilitySearchSerializer
from rooms.models import Room
from rooms.serializers import RoomSerializer
from accounts.permissions import IsHRAdmin


class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'HR-Admin':
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        room = serializer.validated_data['room']
        date = serializer.validated_data['date']
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data['end_time']
        participants = serializer.validated_data['number_of_participants']

        # Check room is active
        if not room.is_active:
            return Response(
                {"error": "This room is not available."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check capacity
        if participants < room.min_occupancy or participants > room.max_occupancy:
            return Response(
                {"error": f"This room supports {room.min_occupancy}-{room.max_occupancy} participants."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for conflicts
        conflicts = Booking.objects.filter(
            room=room,
            date=date,
            status='active'
        ).filter(
            Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
        )

        if conflicts.exists():
            return Response(
                {"error": "This room is already booked for the selected time slot."},
                status=status.HTTP_409_CONFLICT
            )

        booking = serializer.save(user=request.user)

        # Send confirmation email to the employee
        try:
            subject = 'Room Booking Confirmed - MeetSpace'
            message = f"""
Hello {request.user.first_name},

Your meeting room has been successfully booked!

Booking Details:
- Meeting Title: {booking.meeting_title}
- Room: {booking.room.room_number} ({booking.room.floor})
- Date: {booking.date}
- Time: {booking.start_time} - {booking.end_time}
- Participants: {booking.number_of_participants}

Thank you for using MeetSpace!

Best regards,
MeetSpace Team
"""
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                fail_silently=True,
            )
        except Exception:
            pass  # Don't fail the booking if email fails

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED
        )


class BookingDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'HR-Admin':
            return Booking.objects.all()
        return Booking.objects.filter(user=user)


class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if request.user.role != 'HR-Admin' and booking.user != request.user:
            return Response(
                {"error": "You do not have permission to cancel this booking."},
                status=status.HTTP_403_FORBIDDEN
            )

        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response(
                {"error": "Cancellation reason is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = 'cancelled'
        booking.cancellation_reason = reason
        booking.cancelled_at = timezone.now()
        booking.cancelled_by = request.user
        booking.save()

        return Response(
            {"message": "Booking cancelled successfully."},
            status=status.HTTP_200_OK
        )


class AvailabilitySearchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AvailabilitySearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        date = serializer.validated_data['date']
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data['end_time']
        participants = serializer.validated_data['number_of_participants']

        # Get active rooms that fit capacity
        suitable_rooms = Room.objects.filter(
            is_active=True,
            min_occupancy__lte=participants,
            max_occupancy__gte=participants
        )

        # Find rooms with conflicts
        conflicting_room_ids = Booking.objects.filter(
            date=date,
            status='active'
        ).filter(
            Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
        ).values_list('room_id', flat=True)

        # Available rooms = suitable rooms minus conflicting
        available_rooms = suitable_rooms.exclude(id__in=conflicting_room_ids)

        # If no rooms available, find next best time suggestions
        suggestions = []
        if not available_rooms.exists():
            suggestions = self._get_time_suggestions(date, start_time, end_time, participants)

        return Response({
            "available_rooms": RoomSerializer(available_rooms, many=True).data,
            "suggestions": suggestions,
        }, status=status.HTTP_200_OK)

    def _get_time_suggestions(self, date, start_time, end_time, participants):
        """Find the next available time slots across multiple days."""
        suitable_rooms = Room.objects.filter(
            is_active=True,
            min_occupancy__lte=participants,
            max_occupancy__gte=participants
        )

        duration = datetime.combine(date, end_time) - datetime.combine(date, start_time)
        suggestions = []

        # Search current day + next 2 days
        for day_offset in range(3):
            search_date = date + timedelta(days=day_offset)

            # Try 30-minute increments from 8 AM to 8 PM
            for minutes in range(0, 12 * 60 + 1, 30):
                new_start = datetime.combine(search_date, datetime.min.time()) + timedelta(hours=8, minutes=minutes)
                new_end = new_start + duration

                # Don't suggest times after 8 PM
                if new_end.hour >= 20:
                    break

                # Skip past times for current day
                if day_offset == 0 and new_start.time() <= start_time:
                    continue

                for room in suitable_rooms:
                    conflicts = Booking.objects.filter(
                        room=room,
                        date=search_date,
                        status='active'
                    ).filter(
                        Q(start_time__lt=new_end.time()) & Q(end_time__gt=new_start.time())
                    )

                    if not conflicts.exists():
                        suggestions.append({
                            "room": RoomSerializer(room).data,
                            "date": search_date.isoformat(),
                            "start_time": new_start.time().isoformat(),
                            "end_time": new_end.time().isoformat(),
                        })
                        if len(suggestions) >= 10:
                            return suggestions

        return suggestions

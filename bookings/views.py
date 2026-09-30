from datetime import datetime, timedelta, date
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

        if not room.is_active:
            return Response({"error": "This room is not available."}, status=status.HTTP_400_BAD_REQUEST)

        if participants < room.min_occupancy or participants > room.max_occupancy:
            return Response({"error": f"This room supports {room.min_occupancy}-{room.max_occupancy} participants."}, status=status.HTTP_400_BAD_REQUEST)

        conflicts = Booking.objects.filter(room=room, date=date, status='approved').filter(
            Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
        )

        if conflicts.exists():
            return Response({"error": "This room is already booked for the selected time slot."}, status=status.HTTP_409_CONFLICT)

        booking = serializer.save(user=request.user, status='pending')

        # Notify HR-Admin
        try:
            from accounts.models import User
            hr_admins = User.objects.filter(role='HR-Admin', is_active=True)
            admin_emails = [admin.email for admin in hr_admins]
            if admin_emails:
                send_mail(
                    subject='New Booking Request - MeetSpace',
                    message=f"New booking request from {request.user.get_full_name()}. Meeting: {booking.meeting_title}, Room: {booking.room.room_number}, Date: {booking.date}, Time: {booking.start_time}-{booking.end_time}.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=admin_emails,
                    fail_silently=True,
                )
        except Exception:
            pass

        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class BookingDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'HR-Admin':
            return Booking.objects.all()
        return Booking.objects.filter(user=user)


class ApproveBookingView(APIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != 'pending':
            return Response({"error": "Only pending bookings can be approved."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'approved'
        booking.save()

        try:
            send_mail(
                subject='Room Booking Approved - MeetSpace',
                message=f"Hello {booking.user.first_name},\n\nYour meeting room booking has been approved!\n\nMeeting: {booking.meeting_title}\nRoom: {booking.room.room_number} ({booking.room.floor})\nDate: {booking.date}\nTime: {booking.start_time} - {booking.end_time}\nParticipants: {booking.number_of_participants}\n\nThank you for using MeetSpace!",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({"message": "Booking approved. Confirmation email sent."}, status=status.HTTP_200_OK)


class RejectBookingView(APIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != 'pending':
            return Response({"error": "Only pending bookings can be rejected."}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({"error": "Rejection reason is required."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'rejected'
        booking.cancellation_reason = reason
        booking.cancelled_at = timezone.now()
        booking.cancelled_by = request.user
        booking.save()

        try:
            send_mail(
                subject='Room Booking Rejected - MeetSpace',
                message=f"Hello {booking.user.first_name},\n\nYour booking request has been rejected.\n\nMeeting: {booking.meeting_title}\nRoom: {booking.room.room_number}\nDate: {booking.date}\nTime: {booking.start_time} - {booking.end_time}\n\nReason: {reason}\n\nPlease contact HR-Admin for more information.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({"message": "Booking rejected. Notification email sent."}, status=status.HTTP_200_OK)


class SuggestAlternativesView(APIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != 'pending':
            return Response({"error": "Only pending bookings can have alternatives."}, status=status.HTTP_400_BAD_REQUEST)

        alternatives = request.data.get('alternatives', [])
        if not alternatives or not isinstance(alternatives, list):
            return Response({"error": "Alternatives must be a non-empty list."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'alternatives'
        booking.alternatives = alternatives
        booking.save()

        # Send email to employee with alternatives
        try:
            alt_text = "\n".join([
                f"  Option {i+1}: Room {alt.get('room', 'N/A')} on {alt.get('date', 'N/A')} at {alt.get('start_time', 'N/A')} - {alt.get('end_time', 'N/A')}"
                for i, alt in enumerate(alternatives)
            ])
            send_mail(
                subject='Alternative Booking Options - MeetSpace',
                message=f"Hello {booking.user.first_name},\n\nYour booking request for {booking.meeting_title} on {booking.date} at {booking.start_time}-{booking.end_time} could not be accommodated.\n\nHere are the alternative options:\n{alt_text}\n\nPlease login to MeetSpace to accept one of these options.\n\nThank you,\nMeetSpace Team",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({"message": "Alternatives suggested. Email sent to employee."}, status=status.HTTP_200_OK)


class AcceptAlternativeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.user != request.user:
            return Response({"error": "You can only accept alternatives for your own bookings."}, status=status.HTTP_403_FORBIDDEN)

        if booking.status != 'alternatives':
            return Response({"error": "This booking does not have alternatives."}, status=status.HTTP_400_BAD_REQUEST)

        alt_index = request.data.get('alternative_index')
        if alt_index is None:
            return Response({"error": "Please select an alternative to accept."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            selected_alt = booking.alternatives[alt_index]
        except (IndexError, TypeError):
            return Response({"error": "Invalid alternative selected."}, status=status.HTTP_400_BAD_REQUEST)

        # Update booking with selected alternative
        booking.date = selected_alt.get('date', booking.date)
        booking.start_time = selected_alt.get('start_time', booking.start_time)
        booking.end_time = selected_alt.get('end_time', booking.end_time)

        # Update room if provided
        room_id = selected_alt.get('room_id')
        if room_id:
            try:
                booking.room = Room.objects.get(pk=room_id)
            except Room.DoesNotExist:
                pass

        booking.status = 'approved'
        booking.alternatives = []
        booking.save()

        return Response({"message": "Alternative accepted. Booking updated.", "booking": BookingSerializer(booking).data}, status=status.HTTP_200_OK)


class RejectAlternativeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.user != request.user:
            return Response({"error": "You can only reject alternatives for your own bookings."}, status=status.HTTP_403_FORBIDDEN)

        if booking.status != 'alternatives':
            return Response({"error": "This booking does not have alternatives."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'rejected'
        booking.cancellation_reason = 'Employee rejected all alternative options'
        booking.cancelled_at = timezone.now()
        booking.cancelled_by = request.user
        booking.alternatives = []
        booking.save()

        return Response({"message": "Alternatives rejected. Booking marked as rejected."}, status=status.HTTP_200_OK)


class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'HR-Admin' and booking.user != request.user:
            return Response({"error": "You do not have permission to cancel this booking."}, status=status.HTTP_403_FORBIDDEN)

        if booking.status not in ['approved', 'pending', 'alternatives']:
            return Response({"error": "This booking cannot be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({"error": "Cancellation reason is required."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'cancelled'
        booking.cancellation_reason = reason
        booking.cancelled_at = timezone.now()
        booking.cancelled_by = request.user
        booking.save()

        return Response({"message": "Booking cancelled successfully."}, status=status.HTTP_200_OK)


class AvailabilitySearchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AvailabilitySearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        date = serializer.validated_data['date']
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data['end_time']
        participants = serializer.validated_data['number_of_participants']

        suitable_rooms = Room.objects.filter(
            is_active=True,
            min_occupancy__lte=participants,
            max_occupancy__gte=participants
        )

        conflicting_room_ids = Booking.objects.filter(
            date=date, status='approved'
        ).filter(
            Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
        ).values_list('room_id', flat=True)

        available_rooms = suitable_rooms.exclude(id__in=conflicting_room_ids)

        suggestions = []
        if not available_rooms.exists():
            suggestions = self._get_time_suggestions(date, start_time, end_time, participants)

        return Response({
            "available_rooms": RoomSerializer(available_rooms, many=True).data,
            "suggestions": suggestions,
        }, status=status.HTTP_200_OK)

    def _get_time_suggestions(self, date, start_time, end_time, participants):
        suitable_rooms = Room.objects.filter(
            is_active=True,
            min_occupancy__lte=participants,
            max_occupancy__gte=participants
        )

        duration = datetime.combine(date, end_time) - datetime.combine(date, start_time)
        suggestions = []

        for day_offset in range(3):
            search_date = date + timedelta(days=day_offset)

            for minutes in range(0, 12 * 60 + 1, 30):
                new_start = datetime.combine(search_date, datetime.min.time()) + timedelta(hours=8, minutes=minutes)
                new_end = new_start + duration

                if new_end.hour >= 20:
                    break

                if day_offset == 0 and new_start.time() <= start_time:
                    continue

                for room in suitable_rooms:
                    conflicts = Booking.objects.filter(
                        room=room, date=search_date, status='approved'
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

import csv
import io
from datetime import date
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Count, Q
from django.utils import timezone
from .models import User
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    LoginSerializer, ChangePasswordSerializer
)
from .permissions import IsHRAdmin
from rooms.models import Room
from bookings.models import Booking


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        pin = request.data.get('pin', '').strip()
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        email = request.data.get('email', '').strip()
        designation = request.data.get('designation', '').strip()

        # Validate required fields
        errors = {}
        if not pin:
            errors['pin'] = ['PIN is required']
        if not first_name:
            errors['first_name'] = ['First name is required']
        if not last_name:
            errors['last_name'] = ['Last name is required']
        if not email:
            errors['email'] = ['Email is required']
        if not designation:
            errors['designation'] = ['Designation is required']

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Check duplicate PIN
        if User.objects.filter(pin=pin).exists():
            return Response(
                {'pin': ['PIN already exists']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check duplicate email
        if User.objects.filter(email=email).exists():
            return Response(
                {'email': ['Email already exists']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user with default password
        user = User(
            pin=pin,
            first_name=first_name,
            last_name=last_name,
            email=email,
            designation=designation,
            role='Employee',
            is_active=True,
            must_change_password=True
        )
        user.set_password('Welcome@123')
        user.save()

        return Response(
            {
                'message': 'Registration successful',
                'default_password': 'Welcome@123',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"error": "Your account has been deactivated. Contact HR-Admin."},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful.",
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {"error": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['new_password'])
        user.must_change_password = False
        user.save()

        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK
        )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==================== HR-Admin User Management ====================

class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]
    queryset = User.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            UserSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED
        )


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response(
            {"message": "User deactivated successfully."},
            status=status.HTTP_200_OK
        )


class UserActivateDeactivateView(APIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        action = request.data.get('action')
        if action == 'activate':
            user.is_active = True
            user.save()
            return Response({"message": "User activated successfully."}, status=status.HTTP_200_OK)
        elif action == 'deactivate':
            user.is_active = False
            user.save()
            return Response({"message": "User deactivated successfully."}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid action. Use 'activate' or 'deactivate'."},
                status=status.HTTP_400_BAD_REQUEST
            )


class CSVUploadView(APIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]

    def post(self, request):
        csv_file = request.FILES.get('file')

        if not csv_file:
            return Response(
                {"error": "No file uploaded."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not csv_file.name.endswith('.csv'):
            return Response(
                {"error": "File must be a CSV."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)

            required_fields = ['pin', 'first_name', 'last_name', 'email', 'designation', 'role']
            errors = []
            success_count = 0
            row_number = 1

            for row in reader:
                row_number += 1
                row_errors = []

                for field in required_fields:
                    if not row.get(field) or row.get(field).strip() == '':
                        row_errors.append(f"{field} is required")

                if row.get('role') and row['role'] not in ['Employee', 'HR-Admin']:
                    row_errors.append(f"Invalid role '{row['role']}'. Must be 'Employee' or 'HR-Admin'")

                if row.get('pin') and User.objects.filter(pin=row['pin']).exists():
                    row_errors.append(f"PIN '{row['pin']}' already exists")

                if row.get('email') and User.objects.filter(email=row['email']).exists():
                    row_errors.append(f"Email '{row['email']}' already exists")

                if row_errors:
                    errors.append({"row": row_number, "errors": row_errors})
                else:
                    try:
                        user = User(
                            pin=row['pin'].strip(),
                            first_name=row['first_name'].strip(),
                            last_name=row['last_name'].strip(),
                            email=row['email'].strip(),
                            designation=row['designation'].strip(),
                            role=row['role'].strip(),
                            is_active=True,
                            must_change_password=True
                        )
                        user.set_password('Welcome@123')
                        user.save()
                        success_count += 1
                    except Exception as e:
                        errors.append({"row": row_number, "errors": [str(e)]})

            return Response({
                "message": f"CSV upload complete. {success_count} user(s) created.",
                "success_count": success_count,
                "error_count": len(errors),
                "errors": errors
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to process CSV: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


# ==================== Dashboards ====================

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]

    def get(self, request):
        today = date.today()
        total_users = User.objects.filter(is_active=True).count()
        total_employees = User.objects.filter(role='Employee', is_active=True).count()
        total_rooms = Room.objects.filter(is_active=True).count()
        total_bookings_today = Booking.objects.filter(date=today, status='active').count()
        upcoming_bookings = Booking.objects.filter(date__gte=today, status='active').count()
        cancelled_bookings = Booking.objects.filter(status='cancelled').count()

        recent_bookings = Booking.objects.filter(status='active').order_by('-date', '-start_time')[:5]

        return Response({
            "stats": {
                "total_users": total_users,
                "total_employees": total_employees,
                "total_rooms": total_rooms,
                "total_bookings_today": total_bookings_today,
                "upcoming_bookings": upcoming_bookings,
                "cancelled_bookings": cancelled_bookings,
            },
            "recent_bookings": [
                {
                    "id": b.id,
                    "meeting_title": b.meeting_title,
                    "room": b.room.room_number,
                    "date": b.date,
                    "start_time": b.start_time,
                    "end_time": b.end_time,
                    "user": b.user.get_full_name(),
                }
                for b in recent_bookings
            ],
        }, status=status.HTTP_200_OK)


class EmployeeDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        my_active_bookings = Booking.objects.filter(user=user, status='active', date__gte=today)
        upcoming_count = my_active_bookings.count()
        past_bookings = Booking.objects.filter(user=user, status='active', date__lt=today).count()
        cancelled_bookings = Booking.objects.filter(user=user, status='cancelled').count()

        upcoming = my_active_bookings.order_by('date', 'start_time')[:5]

        return Response({
            "stats": {
                "upcoming_count": upcoming_count,
                "past_bookings": past_bookings,
                "cancelled_bookings": cancelled_bookings,
            },
            "upcoming_bookings": [
                {
                    "id": b.id,
                    "meeting_title": b.meeting_title,
                    "room": b.room.room_number,
                    "date": b.date,
                    "start_time": b.start_time,
                    "end_time": b.end_time,
                }
                for b in upcoming
            ],
        }, status=status.HTTP_200_OK)

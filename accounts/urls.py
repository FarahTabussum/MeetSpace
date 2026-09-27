from django.urls import path
from .views import (
    LoginView, LogoutView, ChangePasswordView, UserProfileView,
    UserListCreateView, UserDetailView, UserActivateDeactivateView, CSVUploadView,
    AdminDashboardView, EmployeeDashboardView
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    # HR-Admin User Management
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/status/', UserActivateDeactivateView.as_view(), name='user-status'),
    path('users/upload-csv/', CSVUploadView.as_view(), name='user-csv-upload'),
    # Dashboards
    path('dashboard/admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('dashboard/employee/', EmployeeDashboardView.as_view(), name='employee-dashboard'),
]

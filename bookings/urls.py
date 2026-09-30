from django.urls import path
from .views import (
    BookingListCreateView, BookingDetailView, CancelBookingView,
    AvailabilitySearchView, ApproveBookingView, RejectBookingView,
    SuggestAlternativesView, AcceptAlternativeView, RejectAlternativeView
)

urlpatterns = [
    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<int:pk>/approve/', ApproveBookingView.as_view(), name='booking-approve'),
    path('bookings/<int:pk>/reject/', RejectBookingView.as_view(), name='booking-reject'),
    path('bookings/<int:pk>/suggest-alternatives/', SuggestAlternativesView.as_view(), name='booking-suggest-alternatives'),
    path('bookings/<int:pk>/accept-alternative/', AcceptAlternativeView.as_view(), name='booking-accept-alternative'),
    path('bookings/<int:pk>/reject-alternative/', RejectAlternativeView.as_view(), name='booking-reject-alternative'),
    path('bookings/<int:pk>/cancel/', CancelBookingView.as_view(), name='booking-cancel'),
    path('availability/', AvailabilitySearchView.as_view(), name='availability-search'),
]

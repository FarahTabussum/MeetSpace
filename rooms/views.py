from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Room
from .serializers import RoomSerializer
from accounts.permissions import IsHRAdmin


class RoomListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

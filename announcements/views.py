from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Announcement
from .serializers import AnnouncementSerializer
from accounts.permissions import IsHRAdmin


class AnnouncementListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        return Announcement.objects.all()

    def create(self, request, *args, **kwargs):
        if request.user.role != 'HR-Admin':
            return Response({"error": "Only HR-Admin can create announcements."},
                            status=status.HTTP_403_FORBIDDEN)

        message = (request.data.get('message') or '').strip()
        attachment = request.data.get('attachment')

        if not message and not attachment:
            return Response({"error": "Provide announcement text, an attachment, or both."},
                            status=status.HTTP_400_BAD_REQUEST)

        announcement = Announcement.objects.create(
            message=message,
            attachment=attachment if attachment else None,
            created_by=request.user,
        )
        return Response(AnnouncementSerializer(announcement, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)


class AnnouncementDetailView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsHRAdmin]
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

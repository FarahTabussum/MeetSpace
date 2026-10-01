from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    attachment_name = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'message', 'attachment', 'attachment_name', 'attachment_url',
            'created_by', 'created_by_name', 'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.email

    def get_attachment_name(self, obj):
        return obj.attachment.name.split('/')[-1] if obj.attachment else None

    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            url = obj.attachment.url
            return request.build_absolute_uri(url) if request else url
        return None

from django.db import models
from accounts.models import User


def announcement_upload_path(instance, filename):
    return f'announcements/{filename}'


class Announcement(models.Model):
    message = models.TextField()
    attachment = models.FileField(upload_to=announcement_upload_path, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='announcements')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Announcement #{self.pk} by {self.created_by.email}"

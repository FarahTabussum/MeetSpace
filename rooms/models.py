from django.db import models


class Room(models.Model):
    room_number = models.CharField(max_length=20, unique=True)
    floor = models.CharField(max_length=50)
    min_occupancy = models.PositiveIntegerField(default=1)
    max_occupancy = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Room {self.room_number} (Floor {self.floor})"

    class Meta:
        ordering = ['room_number']

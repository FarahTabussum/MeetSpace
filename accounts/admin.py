from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'pin', 'designation', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['email', 'first_name', 'last_name', 'pin']
    ordering = ['email']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('pin', 'first_name', 'last_name', 'designation')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'must_change_password')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'pin', 'first_name', 'last_name', 'designation', 'role', 'password1', 'password2'),
        }),
    )

# permissions.py
from rest_framework import permissions

class DjangoModelPermissionByTela(permissions.BasePermission):

    def has_permission(self, request, view):
        user = request.user
        screen_name = getattr(view, "screen_name", None)
        if not user or not user.is_authenticated:
            return False
        if not screen_name:
            return False
        return user.has_perm(f"accounts.access_{screen_name}")

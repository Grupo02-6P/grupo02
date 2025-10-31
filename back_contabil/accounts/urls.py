from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    CheckAuthView,
    ChangePasswordView,
    UserProfileView,
    list_users,
    toggle_permission
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('check-auth/', CheckAuthView.as_view(), name='check_auth'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path("users/", list_users),
    path("users/<int:pk>/toggle-permission/", toggle_permission),

]
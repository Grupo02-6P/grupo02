from django.urls import path
from .views import (
    GetCSRFToken,
    LoginView,
    LogoutView,
    CheckAuthView,
    ChangePasswordView,
    UserProfileView
)

urlpatterns = [
    path('csrf/', GetCSRFToken.as_view(), name='csrf_token'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('check-auth/', CheckAuthView.as_view(), name='check_auth'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.contrib.auth import login, logout, update_session_auth_hash
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import Permission
from .models import CustomUser
from django.contrib.auth import get_user_model
from .serializers import LoginSerializer, UserSerializer, ChangePasswordSerializer
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt

class GetCSRFToken(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = get_token(request)
        response = JsonResponse({'csrfToken': token})
        return response

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        token = get_token(request)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            user_data = UserSerializer(user).data  # ← Certifique-se que está usando o UserSerializer correto
            return Response({
                'message': 'Login realizado com sucesso',
                'user': user_data,
                'csrf': token
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# CheckAuthView
class CheckAuthView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            user_data = UserSerializer(request.user).data  # ← Mesmo serializer aqui
            return Response({'authenticated': True, 'user': user_data})
        return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logout realizado com sucesso'})


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']

            if not user.check_password(old_password):
                return Response(
                    {'error': 'Senha atual incorreta'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_password)
            user.save()
            update_session_auth_hash(request, user)

            return Response({'message': 'Senha alterada com sucesso'})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAdminUser])
def list_users(request):
    users = CustomUser.objects.all()
    data = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "permissions": list(u.get_all_permissions()),
        }
        for u in users
    ]
    return Response(data)

@csrf_exempt
@api_view(["POST"])
@authentication_classes([])  # sem autenticação
@permission_classes([AllowAny])
def toggle_permission(request, pk):
    user = CustomUser.objects.get(pk=pk)
    perm = request.data.get("perm")
    permission = Permission.objects.get(codename=perm.split(".")[-1])
    if user.has_perm(perm):
        user.user_permissions.remove(permission)
    else:
        user.user_permissions.add(permission)
    return Response({"status": "ok"})
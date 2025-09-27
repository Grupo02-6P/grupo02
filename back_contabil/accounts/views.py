from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.contrib.auth import login, logout, update_session_auth_hash
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import LoginSerializer, UserSerializer, ChangePasswordSerializer

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
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            user_data = UserSerializer(user).data
            return Response({
                'message': 'Login realizado com sucesso',
                'user': user_data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout realizado com sucesso'})

class CheckAuthView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            user_data = UserSerializer(request.user).data
            return Response({'authenticated': True, 'user': user_data})
        return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)

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
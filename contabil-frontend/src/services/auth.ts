import type { 
  LoginCredentials, 
  AuthResponse, 
  AuthUser,
} from '../types/Auth';
import api from './api';


class AuthService {
  // Login simulado
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {

      var responseAPI = await api.post('/auth/login', credentials);
      if (!responseAPI.data.user) {
        throw new Error('Email ou senha incorretos');
      }
      const { user, access_token } = responseAPI.data;

      // Salvar no localStorage
      localStorage.setItem('access_token', access_token);

      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      };

      const response: AuthResponse = {
        user: authUser,
        access_token,
        token_type: 'Bearer',
        expires_in: 86400
      };

      return response;

    } catch (error: any) {
      console.error('❌ Erro no login:', error.message);
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
      localStorage.removeItem('access_token');
        window.location.href = '/login';
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime;
      
      return isValid;
    } catch (error) {
      console.error('❌ Erro ao validar token:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<AuthUser> {

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await api.get(`/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data.id) {
        throw new Error('Usuário não encontrado');
      }

      const user = response.data;

      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      };

      return authUser;

    } catch (error: any) {
      console.error('❌ Erro ao buscar usuário atual:', error);
      throw this.handleError(error);
    }
  }
  // Handler de erros
  private handleError(error: any): Error {
    // Se já é um Error customizado, retornar como está
    if (error instanceof Error) {
      return error;
    }

    // Simular diferentes tipos de erro da API
    const errorMessages = [
      'Erro de conexão com o servidor',
      'Serviço temporariamente indisponível',
      'Dados inválidos fornecidos'
    ];

    const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    return new Error(error.message || randomError);
  }
}

// Instância singleton do serviço
export const authService = new AuthService();
export default authService;
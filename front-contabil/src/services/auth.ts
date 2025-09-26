import type { 
  LoginCredentials, 
  AuthResponse, 
  AuthUser,
  RegisterData,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData 
} from '../types/Auth';

// Simulação de banco de dados em memória
const MOCK_USERS = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@empresa.com',
    password: '123456',
    role: 'Contador',
    company_id: 1
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    password: '123456',
    role: 'Gerente Financeiro',
    company_id: 1
  },
  {
    id: 3,
    name: 'Admin Sistema',
    email: 'admin@sistema.com',
    password: 'admin123',
    role: 'Administrador',
    company_id: 1
  }
];

// Simular delay de rede
const delay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Gerar token JWT falso
const generateFakeToken = (userId: number): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    user_id: userId, 
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 horas
  }));
  const signature = 'fake_signature';
  return `${header}.${payload}.${signature}`;
};

class AuthService {
  // Login simulado
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800); // Simular delay da API

    try {
      console.log('🔐 Tentativa de login:', credentials);

      // Buscar usuário
      const user = MOCK_USERS.find(u => 
        u.email === credentials.email && u.password === credentials.password
      );

      if (!user) {
        throw new Error('Email ou senha incorretos');
      }

      // Gerar tokens falsos
      const access_token = generateFakeToken(user.id);
      const refresh_token = `refresh_${Date.now()}_${user.id}`;

      // Salvar no localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

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
        refresh_token,
        token_type: 'Bearer',
        expires_in: 86400
      };

      console.log('✅ Login bem-sucedido:', authUser);
      return response;

    } catch (error: any) {
      console.error('❌ Erro no login:', error.message);
      throw this.handleError(error);
    }
  }

  // Logout simulado
  async logout(): Promise<void> {
    await delay(300);

    try {
      console.log('🚪 Fazendo logout...');
      
      // Simular chamada para API
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        console.log('📤 Invalidando refresh token no servidor (simulado)');
      }

    } catch (error) {
      console.error('⚠️ Erro no logout:', error);
    } finally {
      // Sempre limpar tokens locais
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.log('🧹 Tokens removidos do localStorage');
        window.location.href = '/login';
    }
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('🔒 Não autenticado: token não encontrado');
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime;
      
      console.log(`🔍 Token válido: ${isValid ? 'Sim' : 'Não (expirado)'}`);
      return isValid;
    } catch (error) {
      console.error('❌ Erro ao validar token:', error);
      return false;
    }
  }

  // Obter usuário atual simulado
  async getCurrentUser(): Promise<AuthUser> {
    await delay(500);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      // Decodificar token falso para pegar user_id
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.user_id;

      // Buscar usuário pelos dados mockados
      const user = MOCK_USERS.find(u => u.id === userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      };

      console.log('👤 Usuário atual:', authUser);
      return authUser;

    } catch (error: any) {
      console.error('❌ Erro ao buscar usuário atual:', error);
      throw this.handleError(error);
    }
  }

  // Reset senha simulado
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await delay(600);

    try {
      console.log('🔄 Redefinindo senha (simulado)...');
      
      if (data.password !== data.password_confirmation) {
        throw new Error('Confirmação de senha não confere');
      }

      console.log('✅ Senha redefinida com sucesso (simulado)');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Registrar usuário simulado
  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(1000);

    try {
      console.log('👤 Registrando usuário (simulado):', data);

      // Verificar se email já existe
      const existingUser = MOCK_USERS.find(u => u.email === data.email);
      if (existingUser) {
        throw new Error('Email já está em uso');
      }

      if (data.password !== data.password_confirmation) {
        throw new Error('Confirmação de senha não confere');
      }

      // Criar novo usuário
      const newUser = {
        id: MOCK_USERS.length + 1,
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'Usuário',
        company_id: 1
      };

      MOCK_USERS.push(newUser);

      // Fazer login automático
      const access_token = generateFakeToken(newUser.id);
      const refresh_token = `refresh_${Date.now()}_${newUser.id}`;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      const authUser: AuthUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        company_id: newUser.company_id
      };

      console.log('✅ Usuário registrado com sucesso:', authUser);

      return {
        user: authUser,
        access_token,
        refresh_token,
        token_type: 'Bearer',
        expires_in: 86400
      };

    } catch (error: any) {
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
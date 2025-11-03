import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth';
import { getAbilitiesFromToken } from '../utils/jwt';
import type { AuthUser } from '../types/Auth';
import type { JWTAbility } from '../types/Permissions';

// Definir o que o contexto vai fornecer
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  abilities: JWTAbility[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
  updateAbilities: () => void;
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider que vai envolver a aplicação
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [abilities, setAbilities] = useState<JWTAbility[]>([]);

  // Verificar se usuário está logado quando app inicia
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Se tem token, tentar buscar dados do usuário
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        const tokenAbilities = getAbilitiesFromToken();
        setAbilities(tokenAbilities);
      } else {
        // Token inválido ou expirado, apenas limpar usuário
        setUser(null);
        setAbilities([]);
      }
    } catch (error) {
      console.error('Erro ao verificar auth:', error);
      // Se deu erro, apenas limpar usuário
      setUser(null);
      setAbilities([]);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      // Carregar abilities do token retornado pela API
      const tokenAbilities = getAbilitiesFromToken(response.access_token);
      setAbilities(tokenAbilities);
    } catch (error) {
      console.error('❌ AuthContext - Erro no login:', error);
      throw error; // Repassar erro para o componente tratar
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setAbilities([]);
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      // Atualizar abilities também
      const tokenAbilities = getAbilitiesFromToken();
      setAbilities(tokenAbilities);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      logout();
    }
  };

  const updateAbilities = () => {
    const tokenAbilities = getAbilitiesFromToken();
    setAbilities(tokenAbilities);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    abilities,
    login,
    logout,
    setUser,
    refreshUser,
    updateAbilities,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
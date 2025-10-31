import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const data = await authService.checkAuth();
      setUser(data.user);
      setAuthenticated(data.authenticated);
    } catch (error) {
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setAuthenticated(true);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAuthenticated(false);
  };

  // Verifica se o usuário tem uma permissão específica
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(`accounts.${permission}`);
  };

  // Verifica se o usuário é admin
  const isAdmin = () => {
    return user?.is_staff || false;
  };

  // Obtém permissões formatadas (sem o 'accounts.')
  const getFormattedPermissions = () => {
    if (!user || !user.permissions) return [];
    return user.permissions.map(perm => perm.replace('accounts.', ''));
  };

  const value = {
    user,
    authenticated,
    loading,
    login,
    logout,
    checkAuthentication,
    hasPermission,
    isAdmin,
    getFormattedPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
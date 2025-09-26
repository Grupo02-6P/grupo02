import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { authService } from '../services/auth';
import type { LoginCredentials } from '../types/Auth';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      context.setUser(response.user);
      localStorage.setItem('access_token', response.access_token);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    context.setUser(null);
    localStorage.removeItem('access_token');
  };

  return {
    user: context.user,
    login,
    logout,
    loading
  };
};
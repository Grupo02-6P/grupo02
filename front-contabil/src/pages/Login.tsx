import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../components/input/Input';
import Button from '../components/button/Button';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials, LoginErrors } from '../types/Auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const handleInputChange = (field: keyof LoginCredentials, value: string): void => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Limpa erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!credentials.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!credentials.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login(credentials);
      navigate('/home'); // Redireciona após login
    } catch (error: any) {
      setErrors({ general: error.message || 'Erro ao fazer login' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">SC</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sistema Contábil</h2>
          <p className="text-gray-600 mt-2">Faça login para continuar</p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={credentials.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
            autoComplete="email"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link 
            to="/forgot-password" 
            className="text-blue-600 hover:text-blue-500 text-sm transition-colors"
          >
            Esqueceu sua senha?
          </Link>
          {/* Se precisar de registro */}
          {/* <p className="text-gray-600 text-sm">
            Não tem conta? 
            <Link to="/register" className="text-blue-600 hover:text-blue-500 ml-1">
              Cadastre-se
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
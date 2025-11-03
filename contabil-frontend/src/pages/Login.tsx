import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../components/input/Input';
import { useAuth } from '../context/AuthContext';
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
      await login(credentials.email, credentials.password);
      navigate('/home'); 
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      setErrors({ general: error.response.data.message || 'Erro ao fazer login' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Decoração de fundo */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0c4c6e] to-[#146e85]"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0c4c6e] to-[#146e85]"></div>
          <div className="text-center mb-8">
            <div className="">
              <img src="./Logo.png" alt="" />
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-700 font-medium">Faça login para acessar o sistema</p>
            </div>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
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
                    placeholder="Digite sua senha"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c4c6e] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                      errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0c4c6e] to-[#146e85] text-white font-semibold py-4 px-6 rounded-xl hover:from-[#083f5d] hover:to-[#146e85] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c4c6e] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Fazer Login'
              )}
            </button>
          </form>

          {/* Footer decorativo */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">Sistema Contábil Profissional</p>
              <p className="text-xs text-gray-400 mt-1">Versão 1.0 • 2024</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
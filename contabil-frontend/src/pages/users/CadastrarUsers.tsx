import React, { useEffect, useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CreateUserDto } from '../../types/User';
import { userService } from '../../services/users';
import { useAuth } from '../../context/AuthContext';
import { InfoModal } from '../../components/modal/InfoModal';
import type { ConfirmModalProps } from '../../components/modal/InfoModal';
import Input from '../../components/input/Input';
import type { RoleListResponse } from '../../types/Role';
import { roleService } from '../../services/role';

const CadastrarUsers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    password: '',
    roleId: '',
    status: 'ACTIVE',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<RoleListResponse | null>(null);
  const [infoModal, setInfoModal] = useState<ConfirmModalProps>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Fechar',
    type: undefined,
    onConfirm: () => setInfoModal({ ...infoModal, isOpen: false })
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await roleService.findAll({limit: -1});
        setRoles(roles);
      } catch (error) {
        console.error('Erro ao buscar funções:', error);
      }
    };

   
    fetchRoles();
  }, []);


  const handleInputChange = (field: keyof CreateUserDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Email deve ter um formato válido');
    }

    if (!formData.password || formData.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (!formData.roleId) {
      errors.push('Selecione uma função para o usuário');
    }


    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setInfoModal({
        isOpen: true,
        title: 'Erro de Validação',
        message: validationErrors.join(', '),
        confirmText: 'Fechar',
        type: 'danger',
        onConfirm: () => setInfoModal({ ...infoModal, isOpen: false })
      });
      return;
    }

    setLoading(true);
    
    try {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const dataToSend: CreateUserDto = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      await userService.create(dataToSend);
      
      setInfoModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Usuário cadastrado com sucesso!',
        confirmText: 'Voltar para lista',
        type: 'info',
        onConfirm: () => navigate('/usuarios/visualizar')
      });
    } catch (error: any) {
      setInfoModal({
        isOpen: true,
        title: 'Erro',
        message: error.message || 'Erro ao cadastrar usuário. Tente novamente.',
        confirmText: 'Fechar',
        type: 'danger',
        onConfirm: () => setInfoModal({ ...infoModal, isOpen: false })
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#0c4c6e] px-8 py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Novo Usuário</h1>
                <p className="text-white mt-1">Cadastre um novo usuário no sistema</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Dados básicos */}
            <div className="space-y-6 mb-8">
              {/* Primeira linha - Dados básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  required
                  label="Nome Completo:"
                />
                
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  required
                  label="Email:"
                />
              </div>

              {/* Segunda linha - Senha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campo de senha com toggle de visibilidade */}
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha do usuário"
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    required
                    label="Senha:"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terceira linha - Seleções */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              

              <div className="flex flex-col space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Função:
                </label>
                <select
                  id="role"
                  value={formData.roleId}
                  onChange={e => handleInputChange('roleId', e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#148553]"
                  required
                >
                  <option value="">Selecione uma função</option>
                  {Object.entries(roles?.data || {}).map(([key, role]) => (
                    <option key={role.id} value={role.id} className={key}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status:
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    disabled
                    onChange={e => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                    className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#148553]"
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Informações importantes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Informações Importantes</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• A senha deve ter pelo menos 6 caracteres</li>
                <li>• O email será usado como login no sistema</li>
                <li>• Selecione a empresa à qual o usuário pertence</li>
                <li>• A função define as permissões do usuário no sistema</li>
              </ul>
            </div>

            {/* Botões de ação */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
              >
                <Save size={20} />
                <span>{loading ? 'Salvando...' : 'Salvar Usuário'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <InfoModal
        isOpen={infoModal.isOpen}
        title={infoModal.title}
        message={infoModal.message}
        confirmText={infoModal.confirmText}
        onConfirm={infoModal.onConfirm}
        type={infoModal.type}
      />
    </div>
  );
};

export default CadastrarUsers;

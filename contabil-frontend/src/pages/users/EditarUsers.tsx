import React, { useState, useEffect } from 'react';
import { Save, X, Eye, EyeOff } from 'lucide-react';
import { FaUsers } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';
import type { UpdateUserDto, UserResponse } from '../../types/User';
import { userService } from '../../services/users';
import { useAuth } from '../../context/AuthContext';
import { InfoModal } from '../../components/modal/InfoModal';
import type { ConfirmModalProps } from '../../components/modal/InfoModal';
import Input from '../../components/input/Input';
import { LoadingSpinner } from '../../components/loading/LoadingSpinner';
import type { RoleListResponse } from '../../types/Role';
import { roleService } from '../../services/role';

const EditarUsers: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [formData, setFormData] = useState<UpdateUserDto>({
    id: id || '',
    name: '',
    email: '',
    password: '',
    roleId: '',
    status: 'ACTIVE',
  });

  const [originalUser, setOriginalUser] = useState<UserResponse | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [infoModal, setInfoModal] = useState<ConfirmModalProps>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Fechar',
    type: undefined,
    onConfirm: () => setInfoModal({ ...infoModal, isOpen: false })
  });

  const [roles, setRoles] = useState<RoleListResponse | null>(null);

  // Carregar dados do usuário
  useEffect(() => {
    const loadUser = async () => {
      if (!id) {
        setInfoModal({
          isOpen: true,
          title: 'Erro',
          message: 'ID do usuário não encontrado',
          confirmText: 'Voltar',
          type: 'danger',
          onConfirm: () => navigate('/usuarios/visualizar')
        });
        return;
      }

      try {
        setLoadingData(true);
        const response = await userService.findOne(id);
        
        setOriginalUser(response);
        setFormData({
          id: response.id,
          name: response.name,
          email: response.email,
          roleId: response.role.id,
          status: response.status,
          password: '', // Senha vazia por padrão
        });
      } catch (error: any) {
        setInfoModal({
          isOpen: true,
          title: 'Erro',
          message: error.message || 'Erro ao carregar dados do usuário',
          confirmText: 'Voltar',
          type: 'danger',
          onConfirm: () => navigate('/usuarios/visualizar')
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadUser();
  }, [id, navigate]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleService.findAll({ limit: -1 });
        setRoles(response);
      } catch (error) {
        console.error('Erro ao carregar funções:', error);
      }
    };

    fetchRoles();
  }, []);

  const handleInputChange = (field: keyof UpdateUserDto, value: string) => {
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

    // Validar senha apenas se foi informada
    if (formData.password && formData.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres (deixe vazio para manter a atual)');
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
      if (!id) throw new Error('ID do usuário não encontrado');
      
      const dataToSend: UpdateUserDto = {
        id,
        name: formData.name?.trim(),
        email: formData.email?.trim().toLowerCase(),
        roleId: formData.roleId,
        status: formData.status,
      };

      // Incluir senha apenas se foi informada
      if (formData.password && formData.password.trim()) {
        dataToSend.password = formData.password;
      }

      await userService.update(id, dataToSend);
      
      setInfoModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Usuário atualizado com sucesso!',
        confirmText: 'Voltar para lista',
        type: 'info',
        onConfirm: () => navigate('/usuarios/visualizar')
      });
    } catch (error: any) {
      setInfoModal({
        isOpen: true,
        title: 'Erro',
        message: error.message || 'Erro ao atualizar usuário. Tente novamente.',
        confirmText: 'Fechar',
        type: 'danger',
        onConfirm: () => setInfoModal({ ...infoModal, isOpen: false })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/usuarios/visualizar');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#0c4c6e] px-8 py-6">
            <div className="flex items-center space-x-4">
              <FaUsers size={44} className="text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Editar Usuário</h1>
                <p className="text-white mt-1">
                  {originalUser?.name ? `Editando: ${originalUser.name}` : 'Edite os dados do usuário'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Dados básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Input
                type="text"
                placeholder="Nome completo"
                value={formData.name || ''}
                onChange={e => handleInputChange('name', e.target.value)}
                required
                label="Nome Completo:"
              />
              
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email || ''}
                onChange={e => handleInputChange('email', e.target.value)}
                required
                label="Email:"
              />

              {/* Campo de senha com toggle de visibilidade */}
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Deixe vazio para manter a senha atual"
                  value={formData.password || ''}
                  onChange={e => handleInputChange('password', e.target.value)}
                  label="Nova Senha (opcional):"
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

              <div className="flex flex-col space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Função:
                </label>
                <select
                  id="role"
                  value={formData.roleId}
                  onChange={e => handleInputChange('roleId', e.target.value)}
                  className={`border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#148553]`}
                  required
                >
                  <option value="">Selecione uma função</option>
                  {roles?.data.map(role => (
                    <option key={role.name} value={role.id}>
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
                  onChange={e => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#148553]"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>

              {/* Informações de auditoria */}
              {originalUser && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">ID do Usuário:</label>
                    <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg font-mono">
                      {originalUser.id}
                    </div>
                  </div>
                </div>
              )}
            </div>

          

            {/* Informações de senha */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Informações sobre Senha</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Deixe o campo de senha vazio para manter a senha atual</li>
                <li>• Se informar uma nova senha, ela deve ter pelo menos 6 caracteres</li>
                <li>• A nova senha substituirá completamente a senha atual</li>
              </ul>
            </div>

            {/* Botões de ação */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium text-lg shadow-lg"
              >
                <X size={20} />
                <span>Cancelar</span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
              >
                <Save size={20} />
                <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
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

export default EditarUsers;

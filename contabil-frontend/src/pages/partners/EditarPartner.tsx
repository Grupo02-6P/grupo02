import React, { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { FaHandshake } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';
import type { UpdatePartnerDto } from '../../types/Partner';
import { partnerService } from '../../services/partner';
import { useAuth } from '../../context/AuthContext';
import { InfoModal } from '../../components/modal/InfoModal';
import type { ConfirmModalProps } from '../../components/modal/InfoModal';
import Input from '../../components/input/Input';
import { LoadingSpinner } from '../../components/loading/LoadingSpinner';

const EditarPartner: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [formData, setFormData] = useState<UpdatePartnerDto>({
    name: '',
    address: '',
    cnpj: '',
    status: 'ACTIVE',
  });

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

  // Determinar se o usuário é admin (cheque simples com contains)
  const isAdmin = !!user?.role && user.role.toString().toUpperCase().includes('ADMIN');
  console.log('User Role:', user?.role, 'Is Admin:', isAdmin);
  useEffect(() => {
    const loadPartner = async () => {
      if (!id) {
        setInfoModal({
          isOpen: true,
          title: 'Erro',
          message: 'ID do parceiro não encontrado',
          confirmText: 'Voltar',
          type: 'danger',
          onConfirm: () => navigate('/parceiros/visualizar')
        });
        return;
      }

      try {
        setLoadingData(true);
        const response = await partnerService.findOne(id);
  // partner carregado
        setFormData({
          name: response.name,
          address: response.address,
          cnpj: response.cnpj,
          status: response.status,
        });
      } catch (error: any) {
        setInfoModal({
          isOpen: true,
          title: 'Erro',
          message: error.message || 'Erro ao carregar dados do parceiro',
          confirmText: 'Voltar',
          type: 'danger',
          onConfirm: () => navigate('/parceiros/visualizar')
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadPartner();
  }, [id, navigate]);


  const handleInputChange = (field: keyof UpdatePartnerDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return numbers.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    handleInputChange('cnpj', formatted);
  };

  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '');
    if (numbers.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(numbers)) return false;

    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(numbers[12]) !== digit1) return false;

    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    return parseInt(numbers[13]) === digit2;
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!formData.address || formData.address.trim().length < 5) {
      errors.push('Endereço deve ter pelo menos 5 caracteres');
    }

    if (!formData.cnpj || !validateCNPJ(formData.cnpj)) {
      errors.push('CNPJ deve ter um formato válido');
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

    if (!id) {
      setInfoModal({ isOpen: true, title: 'Erro', message: 'ID do parceiro não encontrado', confirmText: 'Fechar', type: 'danger', onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) });
      return;
    }

    setLoading(true);

    try {
      const dataToSend: UpdatePartnerDto = {
        name: formData.name?.trim(),
        address: formData.address?.trim(),
        cnpj: formData.cnpj?.replace(/\D/g, ''),
        status: formData.status,
      };

      await partnerService.update(id, dataToSend);

      setInfoModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Parceiro atualizado com sucesso!',
        confirmText: 'Voltar para lista',
        type: 'info',
        onConfirm: () => navigate('/parceiros/visualizar')
      });
    } catch (error: any) {
      setInfoModal({
        isOpen: true,
        title: 'Erro',
        message: error.message || 'Erro ao atualizar parceiro. Tente novamente.',
        confirmText: 'Fechar',
        type: 'danger',
        onConfirm: () => setInfoModal({ ...infoModal, isOpen: false })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/parceiros/visualizar');
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
              <FaHandshake size={44} className="text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Editar Parceiro</h1>
                <p className="text-white mt-1">Atualize as informações do parceiro</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name || ''}
                  onChange={e => handleInputChange('name', e.target.value)}
                  required
                  label="Nome Completo:"
                />

                <Input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj || ''}
                  onChange={handleCNPJChange}
                  required
                  label="CNPJ:"
                  maxLength={18}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Endereço completo do parceiro"
                  value={formData.address || ''}
                  onChange={e => handleInputChange('address', e.target.value)}
                  required
                  label="Endereço:"
                />
              </div>

            

              <div className="flex flex-col space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={e => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e]"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Informações Importantes</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• O CNPJ deve ser válido</li>
                <li>• O nome do parceiro deve ser completo e oficial</li>
                <li>• O endereço deve incluir rua, número, bairro e cidade</li>
                <li>• Alterações serão aplicadas imediatamente após salvar</li>
              </ul>
            </div>

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
                <span>{loading ? 'Salvando...' : 'Salvar Parceiro'}</span>
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

export default EditarPartner;

import React, { useEffect, useState } from 'react';
import { FaFileInvoiceDollar } from 'react-icons/fa6';
import { Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CreateTitleDto } from '../../types/Title';
import { titleService } from '../../services/title';
import { typeMovementService } from '../../services/typeMovement';
import { typeEntryService } from '../../services/typeEntry';
import { partnerService } from '../../services/partner';
import { InfoModal } from '../../components/modal/InfoModal';
import type { ConfirmModalProps } from '../../components/modal/InfoModal';
import Input from '../../components/input/Input';

interface TypeMovementOption {
  id: string;
  name: string;
  description?: string;
}

interface PartnerOption {
  id: string;
  name: string;
  cnpj: string;
}

interface TypeEntryOption {
  id: string;
  name: string;
  description?: string;
}

const CadastrarTitle: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateTitleDto>({
    code: `TITULO-${Date.now()}`,
    description: '',
    date: new Date().toISOString().split('T')[0],
    value: 0,
    movementId: '',
    typeEntryId: '',
    partnerId: '',
  });

  const [typeMovements, setTypeMovements] = useState<TypeMovementOption[]>([]);
  const [typeEntries, setTypeEntries] = useState<TypeEntryOption[]>([]);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [infoModal, setInfoModal] = useState<ConfirmModalProps>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Fechar',
    type: undefined,
    onConfirm: () => setInfoModal(prev => ({ ...prev, isOpen: false }))
  });

  // Buscar tipos de movimento e parceiros
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [movementsResponse, entriesResponse, partnersResponse] = await Promise.all([
          typeMovementService.findAll({ limit: -1, status: 'ACTIVE' }),
          typeEntryService.findAll({ limit: -1, status: 'ACTIVE' }),
          partnerService.findAll({ limit: -1, status: 'ACTIVE' })
        ]);

        setTypeMovements(movementsResponse.data || []);
        setTypeEntries(entriesResponse.data || []);
        setPartners(partnersResponse.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setInfoModal(prev => ({
          ...prev,
          isOpen: true,
          title: 'Erro',
          message: 'Erro ao carregar tipos de movimento, tipos de entrada e parceiros',
          confirmText: 'Fechar',
          type: 'danger',
          onConfirm: () => setInfoModal(p => ({ ...p, isOpen: false }))
        }));
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof CreateTitleDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Valor deve ser maior que zero';
    }

    if (!formData.movementId) {
      newErrors.movementId = 'Tipo de movimento é obrigatório';
    }

    if (!formData.typeEntryId) {
      newErrors.typeEntryId = 'Tipo de entrada é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      const dataToSend: CreateTitleDto = {
        code: `TITULO-${Date.now()}`,
        description: formData.description?.trim() || undefined,
        date: formData.date,
        value: Number(formData.value),
        movementId: formData.movementId,
        typeEntryId: formData.typeEntryId,
        partnerId: formData.partnerId || undefined,
      };

      await titleService.create(dataToSend);

      setInfoModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Título cadastrado com sucesso!',
        confirmText: 'Voltar para lista',
        type: 'info',
        onConfirm: () => navigate('/titulo/visualizar')
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao cadastrar título. Tente novamente.'
        : 'Erro ao cadastrar título. Tente novamente.';
      setInfoModal(prev => ({
        ...prev,
        isOpen: true,
        title: 'Erro',
        message: errorMessage,
        confirmText: 'Fechar',
        type: 'danger',
        onConfirm: () => setInfoModal(p => ({ ...p, isOpen: false }))
      }));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c4c6e]"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
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
              <FaFileInvoiceDollar size={44} className="text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Novo Lançamento de Título</h1>
                <p className="text-white mt-1">Cadastre um novo lançamento de título no sistema</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Data <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={e => handleInputChange('date', e.target.value)}
                    required
                    className={`border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e] ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="value" className="text-sm font-medium text-gray-700">
                    Valor <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={String(formData.value || '')}
                    onChange={e => handleInputChange('value', parseFloat(e.target.value) || 0)}
                    required
                    className={`border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e] ${
                      errors.value ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="movementId" className="text-sm font-medium text-gray-700">
                    Tipo de Movimento <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="movementId"
                    value={formData.movementId}
                    onChange={e => handleInputChange('movementId', e.target.value)}
                    className={`border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e] ${
                      errors.movementId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Selecione um tipo de movimento</option>
                    {typeMovements.map(movement => (
                      <option key={movement.id} value={movement.id}>
                        {movement.name} {movement.description && `- ${movement.description}`}
                      </option>
                    ))}
                  </select>
                  {errors.movementId && <p className="text-red-500 text-sm mt-1">{errors.movementId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="typeEntryId" className="text-sm font-medium text-gray-700">
                    Tipo de Entrada <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="typeEntryId"
                    value={formData.typeEntryId}
                    onChange={e => handleInputChange('typeEntryId', e.target.value)}
                    className={`border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e] ${
                      errors.typeEntryId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Selecione um tipo de entrada</option>
                    {typeEntries.map(entry => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name} {entry.description && `- ${entry.description}`}
                      </option>
                    ))}
                  </select>
                  {errors.typeEntryId && <p className="text-red-500 text-sm mt-1">{errors.typeEntryId}</p>}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="partnerId" className="text-sm font-medium text-gray-700">
                  Parceiro (Opcional)
                </label>
                <select
                  id="partnerId"
                  value={formData.partnerId || ''}
                  onChange={e => handleInputChange('partnerId', e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e]"
                >
                  <option value="">Selecione um parceiro</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} - CNPJ: {partner.cnpj}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Descrição do lançamento (opcional)"
                  value={formData.description || ''}
                  onChange={e => handleInputChange('description', e.target.value)}
                  label="Descrição"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Informações Importantes</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• O código do título será gerado automaticamente</li>
                <li>• O valor deve ser maior que zero</li>
                <li>• Selecione o tipo de movimento que define as contas contábeis</li>
                <li>• Selecione o tipo de entrada que define a conta a ser movimentada</li>
                <li>• O parceiro é opcional mas recomendado para rastreabilidade</li>
                <li>• A descrição é opcional mas ajuda na identificação do título</li>
              </ul>
            </div>

            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/titulo/visualizar')}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium text-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
              >
                <Save size={20} />
                <span>{loading ? 'Salvando...' : 'Salvar Título'}</span>
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

export default CadastrarTitle;

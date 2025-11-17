import React, { useEffect, useState } from 'react';
import { Save, Receipt } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { UpdateTitleDto } from '../../types/Title';
import { titleService } from '../../services/title';
import { typeMovementService } from '../../services/typeMovement';
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

const EditarTitle: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<UpdateTitleDto>({
    code: '',
    description: '',
    date: '',
    value: 0,
    movementId: '',
    partnerId: '',
    status: 'ACTIVE',
  });

  const [typeMovements, setTypeMovements] = useState<TypeMovementOption[]>([]);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [infoModal, setInfoModal] = useState<ConfirmModalProps>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Fechar',
    type: undefined,
    onConfirm: () => setInfoModal(prev => ({ ...prev, isOpen: false }))
  });

  // Buscar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        navigate('/titulo/visualizar');
        return;
      }

      try {
        setLoadingData(true);
        const [titleResponse, movementsResponse, partnersResponse] = await Promise.all([
          titleService.findOne(id),
          typeMovementService.findAll({ limit: -1 }),
          partnerService.findAll({ limit: -1 })
        ]);

        setTypeMovements(movementsResponse.data || []);
        setPartners(partnersResponse.data || []);

        // Preencher formulário com dados do título
        setFormData({
          code: titleResponse.code,
          description: titleResponse.description || '',
          date: titleResponse.date.split('T')[0],
          value: titleResponse.value,
          movementId: titleResponse.movementId,
          partnerId: titleResponse.partnerId || '',
          status: titleResponse.status,
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setInfoModal(prev => ({
          ...prev,
          isOpen: true,
          title: 'Erro',
          message: 'Erro ao carregar dados do título',
          confirmText: 'Voltar',
          type: 'danger',
          onConfirm: () => navigate('/titulo/visualizar')
        }));
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleInputChange = (field: keyof UpdateTitleDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (formData.code && formData.code.trim().length < 2) {
      errors.push('Código deve ter pelo menos 2 caracteres');
    }

    if (formData.value !== undefined && formData.value <= 0) {
      errors.push('Valor deve ser maior que zero');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setInfoModal(prev => ({
        ...prev,
        isOpen: true,
        title: 'Erro de Validação',
        message: validationErrors.join(', '),
        confirmText: 'Fechar',
        type: 'danger',
        onConfirm: () => setInfoModal(p => ({ ...p, isOpen: false }))
      }));
      return;
    }

    setLoading(true);

    try {
      const dataToSend: UpdateTitleDto = {
        ...(formData.code && { code: formData.code.trim() }),
        ...(formData.description !== undefined && { description: formData.description.trim() || undefined }),
        ...(formData.date && { date: formData.date }),
        ...(formData.value !== undefined && { value: Number(formData.value) }),
        ...(formData.movementId && { movementId: formData.movementId }),
        ...(formData.partnerId && { partnerId: formData.partnerId || undefined }),
        ...(formData.status && { status: formData.status }),
      };

      await titleService.update(id, dataToSend);

      setInfoModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Título atualizado com sucesso!',
        confirmText: 'Voltar para lista',
        type: 'info',
        onConfirm: () => navigate('/titulo/visualizar')
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao atualizar título. Tente novamente.'
        : 'Erro ao atualizar título. Tente novamente.';
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
              <Receipt size={44} className="text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Editar Título</h1>
                <p className="text-white mt-1">Atualize as informações do lançamento de título</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  placeholder="Código do título"
                  value={formData.code || ''}
                  onChange={e => handleInputChange('code', e.target.value)}
                  label="Código"
                />

                <div className="flex flex-col space-y-2">
                  <label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Data
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date || ''}
                    onChange={e => handleInputChange('date', e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={String(formData.value || 0)}
                  onChange={e => handleInputChange('value', parseFloat(e.target.value) || 0)}
                  label="Valor"
                />

                <div className="flex flex-col space-y-2">
                  <label htmlFor="movementId" className="text-sm font-medium text-gray-700">
                    Tipo de Movimento
                  </label>
                  <select
                    id="movementId"
                    value={formData.movementId || ''}
                    onChange={e => handleInputChange('movementId', e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e]"
                  >
                    <option value="">Selecione um tipo de movimento</option>
                    {typeMovements.map(movement => (
                      <option key={movement.id} value={movement.id}>
                        {movement.name} {movement.description && `- ${movement.description}`}
                      </option>
                    ))}
                  </select>
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

              <div className="flex flex-col space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </label>
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
                <li>• Campos vazios não serão atualizados</li>
                <li>• O código deve ser único se alterado</li>
                <li>• O valor deve ser maior que zero</li>
                <li>• Alterações no status podem afetar relatórios</li>
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

export default EditarTitle;

import React, { useEffect, useState } from 'react';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { UpdateTypeMovementDto } from '../../types/TypeMovement';
import { typeMovementService } from '../../services/typeMovement';
import { accountService } from '../../services/account';
import type { AccountResponse } from '../../types/Account';
import { InfoModal } from '../../components/modal/InfoModal';
import type { ConfirmModalProps } from '../../components/modal/InfoModal';
import Input from '../../components/input/Input';
import { LoadingSpinner } from '../../components/loading/LoadingSpinner';

const EditarTypeMovement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<UpdateTypeMovementDto>({
    name: '',
    description: '',
    status: 'ACTIVE',
    creditAccountId: '',
    debitAccountId: '',
  });

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [infoModal, setInfoModal] = useState<ConfirmModalProps>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Fechar',
    type: undefined,
    onConfirm: () => setInfoModal({ ...infoModal, isOpen: false })
  });

  useEffect(() => {
    const loadTypeMovement = async () => {
      if (!id) {
        setInfoModal({
          isOpen: true,
          title: 'Erro',
          message: 'ID do tipo de movimento não encontrado',
          confirmText: 'Voltar',
          type: 'danger',
          onConfirm: () => navigate('/tipo-movimento/visualizar')
        });
        return;
      }

      try {
        setLoadingData(true);
        const response = await typeMovementService.findOne(id);
        
        setFormData({
          name: response.name,
          description: response.description,
          status: response.status,
          creditAccountId: response.creditAccountId,
          debitAccountId: response.debitAccountId,
        });
      } catch (error: any) {
        setInfoModal({
          isOpen: true,
          title: 'Erro',
          message: error.message || 'Erro ao carregar dados do tipo de movimento',
          confirmText: 'Voltar',
          type: 'danger',
          onConfirm: () => navigate('/tipo-movimento/visualizar')
        });
      } finally {
        setLoadingData(false);
      }
    };

    const loadAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const resp = await accountService.findAll({ limit: -1 });
        setAccounts(resp.data || []);
      } catch (err) {
        console.error('Erro ao carregar contas:', err);
        setInfoModal({ isOpen: true, title: 'Erro', message: 'Falha ao carregar contas', confirmText: 'Fechar', type: 'danger', onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) });
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadTypeMovement();
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const handleInputChange = (field: keyof UpdateTypeMovementDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Verificar se as contas são iguais para feedback visual
  const areAccountsEqual = formData.creditAccountId && formData.debitAccountId && formData.creditAccountId === formData.debitAccountId;

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.name || formData.name.trim().length < 2) errors.push('Nome deve ter pelo menos 2 caracteres');
    if (!formData.creditAccountId) errors.push('Selecione a conta de crédito');
    if (!formData.debitAccountId) errors.push('Selecione a conta de débito');
    if (formData.creditAccountId === formData.debitAccountId) errors.push('A conta de crédito deve ser diferente da conta de débito');
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
      setInfoModal({ isOpen: true, title: 'Erro', message: 'ID do tipo de movimento não encontrado', confirmText: 'Fechar', type: 'danger', onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) });
      return;
    }

    setLoading(true);

    try {
      const dataToSend: UpdateTypeMovementDto = {
        name: formData.name?.trim(),
        description: formData.description?.trim(),
        status: formData.status,
        creditAccountId: formData.creditAccountId,
        debitAccountId: formData.debitAccountId,
      };

      await typeMovementService.update(id, dataToSend);

      setInfoModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Tipo de movimento atualizado com sucesso!',
        confirmText: 'Voltar para lista',
        type: 'info',
        onConfirm: () => navigate('/tipo-movimento/visualizar')
      });
    } catch (error: any) {
      setInfoModal({
        isOpen: true,
        title: 'Erro',
        message: error.message || 'Erro ao atualizar tipo de movimento. Tente novamente.',
        confirmText: 'Fechar',
        type: 'danger',
        onConfirm: () => setInfoModal({ ...infoModal, isOpen: false })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/tipo-movimento/visualizar');
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
              <button
                onClick={handleBack}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Editar Tipo de Movimento</h1>
                <p className="text-white mt-1">Atualize as informações do tipo de movimento contábil</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  placeholder="Nome"
                  value={formData.name || ''}
                  onChange={e => handleInputChange('name', e.target.value)}
                  required
                  label="Nome:"
                />

                <Input
                  type="text"
                  placeholder="Descrição"
                  value={formData.description || ''}
                  onChange={e => handleInputChange('description', e.target.value)}
                  label="Descrição:"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <select
                    value={formData.status}
                    onChange={e => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e]"
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Conta Crédito:</label>
                  {loadingAccounts ? (
                    <div className="flex items-center justify-center p-3"><LoadingSpinner /></div>
                  ) : (
                    <select
                      value={formData.creditAccountId || ''}
                      onChange={e => handleInputChange('creditAccountId', e.target.value)}
                      className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 ${
                        areAccountsEqual ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#0c4c6e]'
                      }`}
                      required
                    >
                      <option value="">Selecione a conta de crédito</option>
                      {accounts.map(acc => (
                        <option key={(acc as any).id || acc.code} value={(acc as any).id || acc.code}>
                          {acc.name} ({acc.code})
                        </option>
                      ))}
                    </select>
                  )}
                  {areAccountsEqual && (
                    <p className="text-red-500 text-xs mt-1">As contas de crédito e débito devem ser diferentes</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Conta Débito:</label>
                  {loadingAccounts ? (
                    <div className="flex items-center justify-center p-3"><LoadingSpinner /></div>
                  ) : (
                    <select
                      value={formData.debitAccountId || ''}
                      onChange={e => handleInputChange('debitAccountId', e.target.value)}
                      className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 ${
                        areAccountsEqual ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#0c4c6e]'
                      }`}
                      required
                    >
                      <option value="">Selecione a conta de débito</option>
                      {accounts.map(acc => (
                        <option key={(acc as any).id || acc.code} value={(acc as any).id || acc.code}>
                          {acc.name} ({acc.code})
                        </option>
                      ))}
                    </select>
                  )}
                  {areAccountsEqual && (
                    <p className="text-red-500 text-xs mt-1">As contas de crédito e débito devem ser diferentes</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Informações Importantes</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• O nome deve ser descritivo do tipo de movimento</li>
                <li>• A conta de crédito e débito devem ser diferentes</li>
                <li>• Alterações serão aplicadas imediatamente após salvar</li>
                <li>• Certifique-se de que as contas selecionadas estão corretas</li>
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
                <span>{loading ? 'Salvando...' : 'Salvar Tipo de Movimento'}</span>
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

export default EditarTypeMovement;

import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import type { CreateTypeEntryDto } from '../../types/TypeEntry';
import { typeEntryService } from '../../services/typeEntry';
import { accountService } from '../../services/account';
import type { AccountResponse } from '../../types/Account';
import { InfoModal } from '../../components/modal/InfoModal';
import type { ConfirmModalProps } from '../../components/modal/InfoModal';
import Input from '../../components/input/Input';
import { LoadingSpinner } from '../../components/loading/LoadingSpinner';

const CadastrarTypeEntry: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateTypeEntryDto>({
    name: '',
    description: '',
    status: 'ACTIVE',
    accountClearedId: '',
  });

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [infoModal, setInfoModal] = useState<ConfirmModalProps>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Fechar',
    type: undefined,
    onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }),
  });

  useEffect(() => {
    const loadAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const resp = await accountService.findAll({ limit: -1, status: 'ACTIVE', acceptsPosting: true });
        // Filtrar apenas contas ativas que aceitam lançamento
        const activePostingAccounts = resp.data?.filter(acc => 
          acc.active === 'ACTIVE' && acc.acceptsPosting
        ) || [];
        setAccounts(activePostingAccounts);
      } catch (err) {
        console.error('Erro ao carregar contas:', err);
        setInfoModal({ 
          isOpen: true, 
          title: 'Erro', 
          message: 'Falha ao carregar contas', 
          confirmText: 'Fechar', 
          type: 'danger', 
          onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) 
        });
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field: keyof CreateTypeEntryDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    if (!formData.accountClearedId) {
      errors.push('Selecione a conta de compensação');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    if (errs.length) {
      setInfoModal({ 
        isOpen: true, 
        title: 'Erro de Validação', 
        message: errs.join(', '), 
        confirmText: 'Fechar', 
        type: 'danger', 
        onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) 
      });
      return;
    }

    try {
      setLoading(true);
      await typeEntryService.create(formData);
      setInfoModal({ 
        isOpen: true, 
        title: 'Sucesso', 
        message: 'Tipo de entrada criado com sucesso', 
        confirmText: 'Voltar para lista', 
        type: 'info', 
        onConfirm: () => navigate('/tipo-entrada/visualizar') 
      });
    } catch (err: any) {
      console.error('Erro ao criar tipo entrada:', err);
      setInfoModal({ 
        isOpen: true, 
        title: 'Erro', 
        message: err.message || 'Falha ao criar tipo de entrada', 
        confirmText: 'Fechar', 
        type: 'danger', 
        onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-[#0c4c6e] px-8 py-6">
            <div className="flex items-center space-x-4">
              <MdAccountBalanceWallet size={44} className="text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Novo Tipo de Entrada</h1>
                <p className="text-white mt-1">Cadastre um novo tipo de entrada contábil</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  type="text" 
                  placeholder="Nome" 
                  value={formData.name} 
                  onChange={e => handleInputChange('name', e.target.value)} 
                  required 
                  label="Nome" 
                />
                <Input 
                  type="text" 
                  placeholder="Descrição" 
                  value={formData.description} 
                  onChange={e => handleInputChange('description', e.target.value)} 
                  label="Descrição" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
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
                  <label className="text-sm font-medium text-gray-700">Conta de Compensação</label>
                  {loadingAccounts ? (
                    <div className="flex items-center justify-center p-3">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <select 
                      value={formData.accountClearedId || ''} 
                      onChange={e => handleInputChange('accountClearedId', e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e]"
                      required
                    >
                      <option value="">Selecione a conta de compensação</option>
                      {accounts.map(acc => (
                        <option key={(acc as any).id || acc.code} value={(acc as any).id || acc.code}>
                          {acc.name} ({acc.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Informações Importantes</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• O nome deve ser descritivo do tipo de entrada</li>
                <li>• A conta de compensação deve ser uma conta ativa que aceita lançamentos</li>
                <li>• Tipos de entrada são usados para registrar entradas específicas no sistema</li>
                <li>• Certifique-se de que a conta selecionada está correta</li>
              </ul>
            </div>

            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/tipo-entrada/visualizar')}
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
                <span>{loading ? 'Salvando...' : 'Salvar Tipo de Entrada'}</span>
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

export default CadastrarTypeEntry;

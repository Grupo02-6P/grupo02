import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { MdAccountBalance } from 'react-icons/md';
import { FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../../services/account';
import type { AccountWithBalanceResponse } from '../../types/Account';
import { InfoModal } from '../../components/modal/InfoModal';
import { LoadingSpinner } from '../../components/loading/LoadingSpinner';
import { DetailsModal } from '../../components/modal/DetailsModal';
import { DetailSection } from '../../components/details/DetailSection';
import { DetailField } from '../../components/details/DetailField';
import { useDetailsModal } from '../../hooks/useDetailsModal';

const buildTree = (accounts: AccountWithBalanceResponse[]) => {
  // Create node objects and a quick lookup by id (fallback to code)
  const nodes = accounts.map(acc => ({ ...(acc as any), children: [] as any[] }));
  const nodeMap = new Map<string, any>();
  nodes.forEach(n => {
    const key = (n.id || n.code) && String(n.id || n.code).trim();
    if (key) nodeMap.set(key, n);
  });

  const roots: any[] = [];

  nodes.forEach(n => {
    const rawParent = n.parentAccountId;
    const parentKey = rawParent ? String(rawParent).trim() : '';

    // Try to find parent by id or by code
    let parent = parentKey ? nodeMap.get(parentKey) : undefined;

    if (!parent && parentKey) {
      parent = nodes.find((a: any) => String(a.id || a.code).trim() === parentKey);
    }

    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(n);
    } else {
      roots.push(n);
    }
  });

  // Função recursiva para calcular saldos acumulados das contas pai
  const calculateAccumulatedBalances = (node: any): void => {
    if (node.children && node.children.length > 0) {
      // Primeiro, calcula recursivamente para todos os filhos
      node.children.forEach((child: any) => calculateAccumulatedBalances(child));
      
      // Preserva os valores originais da conta pai
      const originalBalance = node.balance || 0;
      const originalDebit = node.totalDebit || 0;
      const originalCredit = node.totalCredit || 0;
      
      // Soma os saldos dos filhos
      let childrenBalance = 0;
      let childrenDebit = 0;
      let childrenCredit = 0;
      
      node.children.forEach((child: any) => {
        childrenBalance += child.balance || 0;
        childrenDebit += child.totalDebit || 0;
        childrenCredit += child.totalCredit || 0;
      });
      
      // Atualiza os valores da conta pai somando os valores originais + filhos
      node.balance = originalBalance + childrenBalance;
      node.totalDebit = originalDebit + childrenDebit;
      node.totalCredit = originalCredit + childrenCredit;
    }
    // Se não tem filhos, mantém os valores originais da conta
  };

  // Aplica o cálculo de saldos acumulados para toda a árvore
  roots.forEach(root => calculateAccumulatedBalances(root));

  return roots;
};

const VisualizarAccounts: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountWithBalanceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: undefined as 'success' | 'error' | 'info' | undefined,
  });
  const detailsModal = useDetailsModal<AccountWithBalanceResponse>();

  const tree = useMemo(() => buildTree(accounts), [accounts]);

  // Buscar contas com balance
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await accountService.findAllWithBalance({ limit: -1 });
      setAccounts(response.data || []);
    } catch (error: any) {
      console.error('❌ Erro ao buscar contas:', error);
      setInfoModal({ 
        isOpen: true, 
        title: 'Erro!', 
        message: 'Erro ao carregar contas contábeis', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const toggle = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handler para visualizar detalhes
  const handleViewDetails = (account: AccountWithBalanceResponse) => {
    detailsModal.openModal();
    detailsModal.setData(account);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600 font-semibold';
    if (balance < 0) return 'text-red-600 font-semibold';
    return 'text-gray-600';
  };

  const renderNode = (node: any, depth = 0) => {
    const nodeKey = String(node.code);
    const isExpanded = !!expanded[nodeKey];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={nodeKey} className="border-b border-gray-100">
        <div 
          className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors"
          style={{ paddingLeft: `${depth * 32 + 16}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggle(nodeKey)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {node.code}
                </span>
                <span className="font-medium text-gray-900 truncate">
                  {node.name}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  node.active === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {node.active === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              {node.description && (
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {node.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right min-w-0">
              <div className="text-sm text-gray-500">Saldo</div>
              <div className={`text-sm font-mono ${getBalanceColor(node.balance)}`}>
                {formatCurrency(node.balance)}
              </div>
            </div>

            <div className="text-right min-w-0">
              <div className="text-sm text-gray-500">Débito</div>
              <div className="text-sm font-mono text-green-600">
                {formatCurrency(node.totalDebit)}
              </div>
            </div>

            <div className="text-right min-w-0">
              <div className="text-sm text-gray-500">Crédito</div>
              <div className="text-sm font-mono text-red-600">
                {formatCurrency(node.totalCredit)}
              </div>
            </div>

            <button
              onClick={() => handleViewDetails(node)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
              title="Clique para ver detalhes"
            >
              Ver Detalhes
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="bg-gray-25">
            {node.children.map((child: any) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className='flex mr-4 items-center'>
              <MdAccountBalance size={44} className="text-[#0c4c6e] mr-3"/>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Visualizar Contas Contábeis</h1>
                <p className="text-gray-600 mt-1">Visualize o plano de contas com saldos e movimentações</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const allKeys = accounts.map(acc => String(acc.code));
                  const newExpanded: Record<string, boolean> = {};
                  allKeys.forEach(key => newExpanded[key] = true);
                  setExpanded(newExpanded);
                }}
                className="px-4 py-2 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition text-sm"
              >
                Expandir Todos
              </button>
              <button
                onClick={() => setExpanded({})}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
              >
                Recolher Todos
              </button>
              <button
                onClick={() => navigate('/contas/gerenciar')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-lg"
              >
                <FaCog size={16} />
                <span>Gerenciar Contas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cabeçalho da tabela */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-6 h-6" /> {/* Espaço para o botão de expandir */}
                <span className="font-medium text-gray-700">Conta</span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center min-w-0">
                  <span className="text-sm font-medium text-gray-700">Saldo</span>
                </div>
                <div className="text-center min-w-0">
                  <span className="text-sm font-medium text-gray-700">Débito</span>
                </div>
                <div className="text-center min-w-0">
                  <span className="text-sm font-medium text-gray-700">Crédito</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo da árvore */}
          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : tree.length > 0 ? (
              <div>
                {tree.map((node: any) => renderNode(node, 0))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MdAccountBalance className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Nenhuma conta contábil encontrada</p>
                <p className="text-gray-500 mt-1">Cadastre contas contábeis para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de informações */}
      <InfoModal
        isOpen={infoModal.isOpen}
        title={infoModal.title}
        message={infoModal.message}
        confirmText="Fechar"
        onConfirm={() => setInfoModal({ ...infoModal, isOpen: false })}
        type={infoModal.type}
      />

      {/* Modal de detalhes da conta */}
      <DetailsModal
        isOpen={detailsModal.isOpen}
        isLoading={detailsModal.isLoading}
        title={detailsModal.data ? `Conta ${detailsModal.data.code}` : 'Detalhes da Conta'}
        subtitle="Visualize as informações da conta contábil"
        onClose={detailsModal.closeModal}
        showEditButton={false}
      >
        {detailsModal.data ? (
          <>
            <DetailSection
              title="Informações da Conta"
              icon={<MdAccountBalance className="w-5 h-5 text-[#0c4c6e]" />}
            >
              <DetailField 
                label="Código" 
                value={<span className="font-mono font-medium">{detailsModal.data.code}</span>} 
              />
              <DetailField 
                label="Nome" 
                value={<span className="font-medium">{detailsModal.data.name}</span>} 
              />
              <DetailField label="Nível" value={detailsModal.data.level} />
              <DetailField
                label="Status"
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      detailsModal.data.active === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {detailsModal.data.active === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                  </span>
                }
              />
              <DetailField
                label="Aceita Lançamentos"
                value={detailsModal.data.acceptsPosting ? 'Sim' : 'Não'}
              />
              <DetailField 
                label="Descrição" 
                value={detailsModal.data.description || '-'} 
                fullWidth 
              />
            </DetailSection>

            <DetailSection title="Informações Financeiras" bgColor="bg-blue-50">
              <div className="col-span-2 grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <DetailField
                    label="Saldo Atual"
                    value={
                      <span className={`text-2xl font-bold ${getBalanceColor(detailsModal.data.balance)}`}>
                        {formatCurrency(detailsModal.data.balance)}
                      </span>
                    }
                  />
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <DetailField
                    label="Total Débito"
                    value={
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(detailsModal.data.totalDebit)}
                      </span>
                    }
                  />
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <DetailField
                    label="Total Crédito"
                    value={
                      <span className="text-2xl font-bold text-red-600">
                        {formatCurrency(detailsModal.data.totalCredit)}
                      </span>
                    }
                  />
                </div>
              </div>
            </DetailSection>

            {detailsModal.data.journalLines && detailsModal.data.journalLines.length > 0 && (
              <DetailSection title="Movimentações" columns={1}>
                <DetailField
                  label="Total de Movimentações"
                  value={`${detailsModal.data.journalLines.length} movimento(s) registrado(s)`}
                />
              </DetailSection>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Erro ao carregar informações da conta</p>
          </div>
        )}
      </DetailsModal>
    </div>
  );
};

export default VisualizarAccounts;

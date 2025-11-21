import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, X, Building2 } from 'lucide-react';
import { accountService } from '../../services/account';
import type { AccountWithBalanceResponse } from '../../types/Account';
import { InfoModal } from '../../components/modal/InfoModal';
import { LoadingSpinner } from '../../components/loading/LoadingSpinner';

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
      
      // Em seguida, soma os saldos dos filhos para esta conta pai
      let totalBalance = 0;
      let totalDebit = 0;
      let totalCredit = 0;
      
      node.children.forEach((child: any) => {
        totalBalance += child.balance || 0;
        totalDebit += child.totalDebit || 0;
        totalCredit += child.totalCredit || 0;
      });
      
      // Atualiza os valores da conta pai com os totais acumulados
      node.balance = totalBalance;
      node.totalDebit = totalDebit;
      node.totalCredit = totalCredit;
    }
    // Se não tem filhos, mantém os valores originais da conta
  };

  // Aplica o cálculo de saldos acumulados para toda a árvore
  roots.forEach(root => calculateAccumulatedBalances(root));

  return roots;
};

const VisualizarAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountWithBalanceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: undefined as 'success' | 'error' | 'info' | undefined,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    account: null as AccountWithBalanceResponse | null,
    isLoading: false,
  });

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
    setDetailsModal({ isOpen: true, account, isLoading: false });
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
              <Building2 size={44} className="text-[#0c4c6e] mr-3"/>
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
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
              >
                Recolher Todos
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
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
      {detailsModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-[#0c4c6e] to-[#083f5d] text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {detailsModal.account ? `Conta ${detailsModal.account.code}` : 'Detalhes da Conta'}
                </h2>
                <p className="text-green-100 text-sm mt-1">Visualize as informações da conta contábil</p>
              </div>
              <button
                onClick={() => setDetailsModal({ isOpen: false, account: null, isLoading: false })}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {detailsModal.account ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-[#0c4c6e]" />
                      Informações da Conta
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Código:</label>
                        <p className="text-gray-900 mt-1 font-mono font-medium">{detailsModal.account.code}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nome:</label>
                        <p className="text-gray-900 mt-1 font-medium">{detailsModal.account.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nível:</label>
                        <p className="text-gray-900 mt-1">{detailsModal.account.level}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status:</label>
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            detailsModal.account.active === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {detailsModal.account.active === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Aceita Lançamentos:</label>
                        <p className="text-gray-900 mt-1">
                          {detailsModal.account.acceptsPosting ? 'Sim' : 'Não'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Descrição:</label>
                        <p className="text-gray-900 mt-1">{detailsModal.account.description || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Informações Financeiras
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <label className="text-sm font-medium text-gray-600">Saldo Atual</label>
                        <p className={`text-2xl font-bold mt-2 ${getBalanceColor(detailsModal.account.balance)}`}>
                          {formatCurrency(detailsModal.account.balance)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <label className="text-sm font-medium text-gray-600">Total Débito</label>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          {formatCurrency(detailsModal.account.totalDebit)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <label className="text-sm font-medium text-gray-600">Total Crédito</label>
                        <p className="text-2xl font-bold text-red-600 mt-2">
                          {formatCurrency(detailsModal.account.totalCredit)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {detailsModal.account.journalLines && detailsModal.account.journalLines.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Movimentações ({detailsModal.account.journalLines.length})
                      </h3>
                      <p className="text-gray-600">
                        Esta conta possui {detailsModal.account.journalLines.length} movimento(s) registrado(s).
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Erro ao carregar informações da conta</p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button
                onClick={() => setDetailsModal({ isOpen: false, account: null, isLoading: false })}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizarAccounts;

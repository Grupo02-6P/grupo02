import React, { useState } from 'react';
import { Plus, Edit, X, Receipt, CheckCircle } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { titleService } from '../../services/title';
import type { TitleResponse } from '../../types/Title';
import { DataTable } from '../../components/table/DataTable';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import { InfoModal } from '../../components/modal/InfoModal';
import { ActionsColumn, useDefaultActions } from '../../components/table/ActionsColumn';
import { useResourcePermissions } from '../../context/PermissionContext';
import { useDebounceFilters } from '../../hooks/useDebounceFilters';

const VisualizarTitle: React.FC = () => {
  const { createViewAction, createEditAction, createDeleteAction } = useDefaultActions();
  const titlePermissions = useResourcePermissions('Title');

  const navigate = useNavigate();
  const {
    filters,
    handleFilterChange,
    searchFields,
    createTextInput
  } = useDebounceFilters(
    {
      search: '',
      status: '',
    },
    ['search']
  );

  const [selectedTitleId, setSelectedTitleId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: undefined as 'success' | 'error' | undefined,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    title: null as TitleResponse | null,
    isLoading: false,
  });

  // Colunas da tabela
  const columns: ColumnDef<TitleResponse>[] = [
    {
      accessorKey: 'code',
      header: 'Código',
      enableSorting: true,
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      enableSorting: true,
      cell: ({ row }) => row.original.description || '-',
    },
    {
      accessorKey: 'date',
      header: 'Data',
      enableSorting: true,
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: 'value',
      header: 'Valor',
      enableSorting: true,
      cell: ({ row }) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.original.value),
    },
    {
      accessorKey: 'movement.name',
      header: 'Tipo de Movimento',
      enableSorting: false,
      cell: ({ row }) => row.original.movement?.name || '-',
    },
    {
      accessorKey: 'typeEntry.name',
      header: 'Tipo de Entrada',
      enableSorting: false,
      cell: ({ row }) => row.original.typeEntry?.name || '-',
    },
    {
      accessorKey: 'partner.name',
      header: 'Parceiro',
      enableSorting: false,
      cell: ({ row }) => row.original.partner?.name || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => {
        let status, color;
        switch (row.original.status) {
          case 'ACTIVE':
            status = 'Ativo';
            color = 'bg-blue-100 text-blue-800';
            break;
          case 'INACTIVE':
            status = 'Inativo';
            color = 'bg-red-100 text-red-800';
            break;
          case 'PAID':
            status = 'Pago';
            color = 'bg-green-100 text-green-800';
            break;
          default:
            status = 'Desconhecido';
            color = 'bg-gray-100 text-gray-800';
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const actions = [
          createViewAction(() => handleViewDetails(row.original.id)),
          createEditAction(() => handleEditClick(row.original.id), titlePermissions.canUpdate && row.original.status !== 'PAID'),
          createDeleteAction(
            () => handleInactivateClick(row.original.id),
            titlePermissions.canDelete,
            row.original.status !== 'INACTIVE' && row.original.status !== 'PAID'
          ),
        ];

        // Adicionar ação de pagamento para títulos ativos
        if (titlePermissions.canUpdate && row.original.status === 'ACTIVE') {
          actions.push({
            type: 'custom',
            icon: <CheckCircle className="w-5 h-5 text-green-700" />,
            title: 'Realizar baixa',
            onClick: () => handlePayClick(row.original.id),
            className: 'p-2 rounded hover:bg-green-100 transition-colors',
          });
        }

        return <ActionsColumn actions={actions} />;
      },
    },
  ];

  // Buscar títulos (integração com API)
  const fetchTitles = async (params: Record<string, string | number | undefined>) => {
    const response = await titleService.findAll(params);

    return {
      data: response.data,
      pagination: response.pagination,
    };
  };

  // Handlers
  const handleViewDetails = async (id: string) => {
    setDetailsModal({ isOpen: true, title: null, isLoading: true });

    try {
      const response = await titleService.findOne(id);
      setDetailsModal({ isOpen: true, title: response, isLoading: false });
    } catch {
      setDetailsModal({ isOpen: false, title: null, isLoading: false });
      setInfoModal({ isOpen: true, title: 'Erro!', message: 'Erro ao carregar detalhes do título', type: 'error' });
    }
  };

  const handleEditClick = (id: string) => {
    navigate(`/titulo/editar/${id}`);
  };

  const handleInactivateClick = (id: string) => {
    setSelectedTitleId(id);
    setConfirmModal(true);
  };

  const handlePayClick = (id: string) => {
    setSelectedTitleId(id);
    setPayModal(true);
  };

  const handleInactivateConfirm = async () => {
    if (!selectedTitleId) return;
    try {
      await titleService.inactive(selectedTitleId);
      setConfirmModal(false);
      setSelectedTitleId(null);
      setRefreshKey(prev => prev + 1);
      setInfoModal({ isOpen: true, title: 'Sucesso!', message: 'Título inativado com sucesso!', type: 'success' });
    } catch (err: unknown) {
      setConfirmModal(false);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao inativar título'
        : 'Erro ao inativar título';
      setInfoModal({ isOpen: true, title: 'Erro!', message: errorMessage, type: 'error' });
    }
  };

  const handlePayConfirm = async () => {
    if (!selectedTitleId) return;
    try {
      await titleService.pay(selectedTitleId);
      setPayModal(false);
      setSelectedTitleId(null);
      setRefreshKey(prev => prev + 1);
      setInfoModal({ isOpen: true, title: 'Sucesso!', message: 'Baixa do título realizada com sucesso!', type: 'success' });
    } catch (err: unknown) {
      setPayModal(false);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao dar baixa no título'
        : 'Erro ao dar baixa no título';
      setInfoModal({ isOpen: true, title: 'Erro!', message: errorMessage, type: 'error' });
    }
  };

  // Inputs de filtro customizados
  const FilterInputs = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input {...createTextInput('search', 'Buscar por código ou descrição...')} />
      <select
        value={filters.status}
        onChange={e => handleFilterChange('status', e.target.value)}
        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e]"
      >
        <option value="">Todos os status</option>
        <option value="ACTIVE">Ativo</option>
        <option value="INACTIVE">Inativo</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className='flex mr-4 items-center'>
              <Receipt size={44} className="text-[#0c4c6e] mr-3"/>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Lançamentos de Título</h1>
                <p className="text-gray-600 mt-1">Gerencie todos os lançamentos de título do sistema</p>
              </div>
            </div>
            {titlePermissions.canCreate && (
              <button
                onClick={() => navigate('/titulo/cadastrar')}
                className="flex items-center space-x-2 px-6 py-3 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition shadow-lg"
              >
                <Plus size={20} />
                <span>Novo Lançamento de Título</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabela com DataTable */}
        <DataTable
          key={refreshKey}
          columns={columns}
          fetchData={fetchTitles}
          emptyMessage="Nenhum título encontrado"
          emptyDescription="Tente ajustar os filtros de busca ou cadastre um novo lançamento de título"
          pageSize={10}
          enableFilters={true}
          filterInputs={FilterInputs}
          externalFilters={filters}
          searchFields={searchFields}
        />
      </div>

      <ConfirmModal
        isOpen={confirmModal}
        onCancel={() => { setConfirmModal(false); setSelectedTitleId(null); }}
        onConfirm={handleInactivateConfirm}
        title="Tem certeza que deseja inativar este título?"
        message="O título será marcado como inativo e não poderá mais ser utilizado."
        confirmText="Sim, inativar"
        cancelText="Cancelar"
        type="danger"
      />

      <ConfirmModal
        isOpen={payModal}
        onCancel={() => { setPayModal(false); setSelectedTitleId(null); }}
        onConfirm={handlePayConfirm}
        title="Confirmar baixa do título?"
        message="O título será marcado como PAGO e não poderá mais ser editado ou inativado. Esta ação não pode ser desfeita."
        confirmText="Sim, dar baixa"
        cancelText="Cancelar"
        type="info"
      />

      <InfoModal
        isOpen={infoModal.isOpen}
        title={infoModal.title}
        message={infoModal.message}
        confirmText="Fechar"
        onConfirm={() => setInfoModal({ ...infoModal, isOpen: false })}
        type={infoModal.type}
      />

      {/* Modal de Detalhes do Título */}
      {detailsModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-[#0c4c6e] to-[#083f5d] text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {detailsModal.isLoading ? 'Carregando...' : (detailsModal.title?.code ? `Título ${detailsModal.title.code}` : 'Detalhes do Título')}
                </h2>
                <p className="text-green-100 text-sm mt-1">Visualize as informações do título</p>
              </div>
              <button
                onClick={() => setDetailsModal({ isOpen: false, title: null, isLoading: false })}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {detailsModal.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c4c6e]"></div>
                    <p className="text-gray-600">Carregando informações...</p>
                  </div>
                </div>
              ) : detailsModal.title ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Receipt className="w-5 h-5 mr-2 text-[#0c4c6e]" />
                      Informações do Título
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Código:</label>
                        <p className="text-gray-900 mt-1 font-medium">{detailsModal.title.code}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Data:</label>
                        <p className="text-gray-900 mt-1">{new Date(detailsModal.title.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Valor:</label>
                        <p className="text-gray-900 mt-1 font-bold text-lg">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(detailsModal.title.value)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status:</label>
                        <div className="mt-2">
                          {(() => {
                            let status, color;
                            switch (detailsModal.title.status) {
                              case 'ACTIVE':
                                status = 'Ativo';
                                color = 'bg-blue-100 text-blue-800';
                                break;
                              case 'INACTIVE':
                                status = 'Inativo';
                                color = 'bg-red-100 text-red-800';
                                break;
                              case 'PAID':
                                status = 'Pago';
                                color = 'bg-green-100 text-green-800';
                                break;
                              default:
                                status = 'Desconhecido';
                                color = 'bg-gray-100 text-gray-800';
                            }
                            return (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
                                {status}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Descrição:</label>
                        <p className="text-gray-900 mt-1">{detailsModal.title.description || '-'}</p>
                      </div>
                      {detailsModal.title.movement && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Tipo de Movimento:</label>
                          <p className="text-gray-900 mt-1">{detailsModal.title.movement.name}</p>
                        </div>
                      )}
                      {detailsModal.title.typeEntry && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Tipo de Entrada:</label>
                          <p className="text-gray-900 mt-1">{detailsModal.title.typeEntry.name}</p>
                        </div>
                      )}
                      {detailsModal.title.partner && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Parceiro:</label>
                          <p className="text-gray-900 mt-1">{detailsModal.title.partner.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Erro ao carregar informações do título</p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button
                onClick={() => setDetailsModal({ isOpen: false, title: null, isLoading: false })}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mr-3"
              >
                Fechar
              </button>
              {titlePermissions.canUpdate && (
                <button
                  onClick={() => {
                    setDetailsModal({ isOpen: false, title: null, isLoading: false });
                    handleEditClick(detailsModal.title?.id || '');
                  }}
                  className="px-6 py-2 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizarTitle;

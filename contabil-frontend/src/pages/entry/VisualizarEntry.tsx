import React, { useState } from 'react';
import { Plus, Edit, X, Receipt } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { entryService } from '../../services/entry';
import type { EntryResponse } from '../../types/Entry';
import { DataTable } from '../../components/table/DataTable';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import { InfoModal } from '../../components/modal/InfoModal';
import { ActionsColumn, useDefaultActions } from '../../components/table/ActionsColumn';
import { useResourcePermissions } from '../../context/PermissionContext';
import { useDebounceFilters } from '../../hooks/useDebounceFilters';

const VisualizarEntry: React.FC = () => {
  const { createViewAction, createEditAction, createDeleteAction } = useDefaultActions();
  const entryPermissions = useResourcePermissions('Entry');

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

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: undefined as 'success' | 'error' | undefined,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    entry: null as EntryResponse | null,
    isLoading: false,
  });

  // Colunas da tabela
  const columns: ColumnDef<EntryResponse>[] = [
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
      accessorKey: 'tittle.code',
      header: 'Título',
      enableSorting: false,
      cell: ({ row }) => row.original.tittle?.code || '-',
    },
    {
      accessorKey: 'entryType.name',
      header: 'Tipo de Entrada',
      enableSorting: false,
      cell: ({ row }) => row.original.entryType?.name || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.status === 'ACTIVE' ? 'Ativo' : 'Inativo';
        const color = row.original.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

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
          createEditAction(() => handleEditClick(row.original.id), entryPermissions.canUpdate),
          createDeleteAction(
            () => handleRemoveClick(row.original.id),
            entryPermissions.canDelete,
            row.original.status !== 'INACTIVE'
          ),
        ];

        return <ActionsColumn actions={actions} />;
      },
    },
  ];

  // Buscar lançamentos (integração com API)
  const fetchEntries = async (params: Record<string, string | number | undefined>) => {
    const response = await entryService.findAll(params);

    return {
      data: response.data,
      pagination: response.pagination,
    };
  };

  // Handlers
  const handleViewDetails = async (id: string) => {
    setDetailsModal({ isOpen: true, entry: null, isLoading: true });

    try {
      const response = await entryService.findOne(id);
      setDetailsModal({ isOpen: true, entry: response, isLoading: false });
    } catch {
      setDetailsModal({ isOpen: false, entry: null, isLoading: false });
      setInfoModal({ isOpen: true, title: 'Erro!', message: 'Erro ao carregar detalhes do lançamento', type: 'error' });
    }
  };

  const handleEditClick = (id: string) => {
    navigate(`/lancamentos/editar/${id}`);
  };

  const handleRemoveClick = (id: string) => {
    setSelectedEntryId(id);
    setConfirmModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedEntryId) return;
    try {
      await entryService.remove(selectedEntryId);
      setConfirmModal(false);
      setSelectedEntryId(null);
      setRefreshKey(prev => prev + 1);
      setInfoModal({ isOpen: true, title: 'Sucesso!', message: 'Lançamento removido com sucesso!', type: 'success' });
    } catch (err: unknown) {
      setConfirmModal(false);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao remover lançamento'
        : 'Erro ao remover lançamento';
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
                <h1 className="text-3xl font-bold text-gray-800">Lançamentos</h1>
                <p className="text-gray-600 mt-1">Gerencie todos os lançamentos financeiros do sistema</p>
              </div>
            </div>
            {entryPermissions.canCreate && (
              <button
                onClick={() => navigate('/lancamentos/cadastrar')}
                className="flex items-center space-x-2 px-6 py-3 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition shadow-lg"
              >
                <Plus size={20} />
                <span>Novo Lançamento</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabela com DataTable */}
        <DataTable
          key={refreshKey}
          columns={columns}
          fetchData={fetchEntries}
          emptyMessage="Nenhum lançamento encontrado"
          emptyDescription="Tente ajustar os filtros de busca ou cadastre um novo lançamento"
          pageSize={10}
          enableFilters={true}
          filterInputs={FilterInputs}
          externalFilters={filters}
          searchFields={searchFields}
        />
      </div>

      <ConfirmModal
        isOpen={confirmModal}
        onCancel={() => { setConfirmModal(false); setSelectedEntryId(null); }}
        onConfirm={handleRemoveConfirm}
        title="Tem certeza que deseja remover este lançamento?"
        message="Esta ação não pode ser desfeita. Todos os dados do lançamento serão perdidos permanentemente."
        confirmText="Sim, remover"
        cancelText="Cancelar"
        type="danger"
      />

      <InfoModal
        isOpen={infoModal.isOpen}
        title={infoModal.title}
        message={infoModal.message}
        confirmText="Fechar"
        onConfirm={() => setInfoModal({ ...infoModal, isOpen: false })}
        type={infoModal.type}
      />

      {/* Modal de Detalhes do Lançamento */}
      {detailsModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-[#0c4c6e] to-[#083f5d] text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {detailsModal.isLoading ? 'Carregando...' : (detailsModal.entry?.code ? `Lançamento ${detailsModal.entry.code}` : 'Detalhes do Lançamento')}
                </h2>
                <p className="text-green-100 text-sm mt-1">Visualize as informações do lançamento</p>
              </div>
              <button
                onClick={() => setDetailsModal({ isOpen: false, entry: null, isLoading: false })}
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
              ) : detailsModal.entry ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Receipt className="w-5 h-5 mr-2 text-[#0c4c6e]" />
                      Informações do Lançamento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Código:</label>
                        <p className="text-gray-900 mt-1 font-medium">{detailsModal.entry.code}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Data:</label>
                        <p className="text-gray-900 mt-1">{new Date(detailsModal.entry.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Valor:</label>
                        <p className="text-gray-900 mt-1 font-bold text-lg">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(detailsModal.entry.value)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status:</label>
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${detailsModal.entry.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {detailsModal.entry.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Descrição:</label>
                        <p className="text-gray-900 mt-1">{detailsModal.entry.description || '-'}</p>
                      </div>
                      {detailsModal.entry.tittle && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Título:</label>
                          <p className="text-gray-900 mt-1">{detailsModal.entry.tittle.code}</p>
                        </div>
                      )}
                      {detailsModal.entry.entryType && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Tipo de Entrada:</label>
                          <p className="text-gray-900 mt-1">{detailsModal.entry.entryType.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Erro ao carregar informações do lançamento</p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button
                onClick={() => setDetailsModal({ isOpen: false, entry: null, isLoading: false })}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mr-3"
              >
                Fechar
              </button>
              {entryPermissions.canUpdate && (
                <button
                  onClick={() => {
                    setDetailsModal({ isOpen: false, entry: null, isLoading: false });
                    handleEditClick(detailsModal.entry?.id || '');
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

export default VisualizarEntry;

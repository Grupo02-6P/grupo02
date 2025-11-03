import React, { useState } from 'react';
import { Plus, Edit, X } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { typeEntryService } from '../../services/typeEntry';
import type { TypeEntryResponse } from '../../types/TypeEntry';
import { DataTable } from '../../components/table/DataTable';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import { InfoModal } from '../../components/modal/InfoModal';
import { ActionsColumn, useDefaultActions } from '../../components/table/ActionsColumn';
import { useResourcePermissions } from '../../context/PermissionContext';
import { useDebounceFilters } from '../../hooks/useDebounceFilters';
import { MdOutlineAccountBalanceWallet } from "react-icons/md";


const VisualizarTypeEntry: React.FC = () => {
  const { createViewAction, createEditAction, createDeleteAction } = useDefaultActions();
  const typeEntryPermissions = useResourcePermissions('TypeEntry');

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

  const [selectedTypeEntryId, setSelectedTypeEntryId] = useState<string | null>(null);
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
    typeEntry: null as TypeEntryResponse | null,
    isLoading: false,
  });

  // Colunas da tabela
  const columns: ColumnDef<TypeEntryResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      enableSorting: true,
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      enableSorting: true,
    },
    {
      accessorKey: 'accountCleared.name',
      header: 'Conta de Compensação',
      enableSorting: true,
      cell: ({ row }) => {
        const account = row.original.accountCleared;
        return account ? `${account.name} (${account.code})` : 'N/A';
      },
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
          createEditAction(() => handleEditClick(row.original.id), typeEntryPermissions.canUpdate),
          createDeleteAction(
            () => handleInactivateClick(row.original.id),
            typeEntryPermissions.canDelete,
            row.original.status !== 'INACTIVE'
          ),
        ];

        return <ActionsColumn actions={actions} />;
      },
    },
  ];

  // Buscar tipos de entrada (integração com API)
  const fetchTypeEntries = async (params: any) => {
    const response = await typeEntryService.findAll(params);

    return {
      data: response.data,
      pagination: response.pagination,
    };
  };

  // Handlers
  const handleViewDetails = async (id: string) => {
    setDetailsModal({ isOpen: true, typeEntry: null, isLoading: true });

    try {
      const response = await typeEntryService.findOne(id);
      setDetailsModal({ isOpen: true, typeEntry: response, isLoading: false });
    } catch (error) {
      setDetailsModal({ isOpen: false, typeEntry: null, isLoading: false });
      setInfoModal({ isOpen: true, title: 'Erro!', message: 'Erro ao carregar detalhes do tipo de entrada', type: 'error' });
    }
  };

  const handleEditClick = (id: string) => {
    navigate(`/tipo-entrada/editar/${id}`);
  };

  const handleInactivateClick = (id: string) => {
    setSelectedTypeEntryId(id);
    setConfirmModal(true);
  };

  const handleInactivateConfirm = async () => {
    if (!selectedTypeEntryId) return;
    try {
      await typeEntryService.inactive(selectedTypeEntryId);
      setConfirmModal(false);
      setSelectedTypeEntryId(null);
      setRefreshKey(prev => prev + 1);
      setInfoModal({ isOpen: true, title: 'Sucesso!', message: 'Tipo de entrada inativado com sucesso!', type: 'success' });
    } catch (err: any) {
      setConfirmModal(false);
      setInfoModal({ isOpen: true, title: 'Erro!', message: err.response?.data?.message || 'Erro ao inativar tipo de entrada', type: 'error' });
    }
  };

  // Inputs de filtro customizados
  const FilterInputs = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input {...createTextInput('search', 'Buscar por nome ou descrição...')} />
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
              <MdOutlineAccountBalanceWallet size={44} className="text-[#0c4c6e] mr-3"/>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Tipos de Entrada</h1>
                <p className="text-gray-600 mt-1">Gerencie todos os tipos de entrada contábil</p>
              </div>
            </div>
            {typeEntryPermissions.canCreate && (
              <button
                onClick={() => navigate('/tipo-entrada/cadastrar')}
                className="flex items-center space-x-2 px-6 py-3 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition shadow-lg"
              >
                <Plus size={20} />
                <span>Novo Tipo de Entrada</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabela com DataTable */}
        <DataTable
          key={refreshKey}
          columns={columns}
          fetchData={fetchTypeEntries}
          emptyMessage="Nenhum tipo de entrada encontrado"
          emptyDescription="Tente ajustar os filtros de busca ou cadastre um novo tipo de entrada"
          pageSize={10}
          enableFilters={true}
          filterInputs={FilterInputs}
          externalFilters={filters}
          searchFields={searchFields}
        />
      </div>

      <ConfirmModal
        isOpen={confirmModal}
        onCancel={() => { setConfirmModal(false); setSelectedTypeEntryId(null); }}
        onConfirm={handleInactivateConfirm}
        title="Tem certeza que deseja inativar este tipo de entrada?"
        message="Esta ação irá inativar o tipo de entrada. Você pode reativá-lo posteriormente."
        confirmText="Sim, inativar"
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

      {/* Modal de Detalhes do Tipo de Entrada */}
      {detailsModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-[#0c4c6e] to-[#083f5d] text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {detailsModal.isLoading ? 'Carregando...' : detailsModal.typeEntry?.name || 'Detalhes do Tipo de Entrada'}
                </h2>
                <p className="text-green-100 text-sm mt-1">Visualize as informações do tipo de entrada</p>
              </div>
              <button
                onClick={() => setDetailsModal({ isOpen: false, typeEntry: null, isLoading: false })}
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
              ) : detailsModal.typeEntry ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <MdOutlineAccountBalanceWallet className="w-5 h-5 mr-2 text-[#0c4c6e]" />
                      Informações do Tipo de Entrada
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nome:</label>
                        <p className="text-gray-900 mt-1 font-medium">{detailsModal.typeEntry.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Descrição:</label>
                        <p className="text-gray-900 mt-1">{detailsModal.typeEntry.description || 'Sem descrição'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status:</label>
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${detailsModal.typeEntry.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {detailsModal.typeEntry.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Conta Associada</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Conta de Compensação:</label>
                        <p className="text-gray-900 mt-1 font-medium">
                          {detailsModal.typeEntry.accountCleared?.name} ({detailsModal.typeEntry.accountCleared?.code})
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Adicionais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Criado em:</label>
                        <p className="text-gray-900 mt-1">{new Date(detailsModal.typeEntry.createdAt).toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Atualizado em:</label>
                        <p className="text-gray-900 mt-1">{new Date(detailsModal.typeEntry.updatedAt).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Erro ao carregar informações do tipo de entrada</p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button
                onClick={() => setDetailsModal({ isOpen: false, typeEntry: null, isLoading: false })}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mr-3"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setDetailsModal({ isOpen: false, typeEntry: null, isLoading: false });
                  handleEditClick(detailsModal.typeEntry?.id || '');
                }}
                className="px-6 py-2 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizarTypeEntry;

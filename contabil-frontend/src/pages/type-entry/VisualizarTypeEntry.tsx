import React, { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailsModal } from '../../components/modal/DetailsModal';
import { DetailSection } from '../../components/details/DetailSection';
import { DetailField } from '../../components/details/DetailField';
import { useDetailsModal } from '../../hooks/useDetailsModal';


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
  const detailsModal = useDetailsModal<TypeEntryResponse>();

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
    detailsModal.openModal();

    try {
      const response = await typeEntryService.findOne(id);
      detailsModal.setData(response);
    } catch (error) {
      detailsModal.setError();
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
        <PageHeader
          icon={<MdOutlineAccountBalanceWallet size={44} className="text-[#0c4c6e] mr-3" />}
          title="Tipos de Entrada"
          description="Gerencie todos os tipos de entrada contábil"
          actionButton={{
            label: 'Novo Tipo de Entrada',
            onClick: () => navigate('/tipo-entrada/cadastrar'),
            icon: <Plus size={20} />,
            show: typeEntryPermissions.canCreate,
          }}
        />

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

      <DetailsModal
        isOpen={detailsModal.isOpen}
        isLoading={detailsModal.isLoading}
        title={detailsModal.data?.name || 'Detalhes do Tipo de Entrada'}
        subtitle="Visualize as informações do tipo de entrada"
        onClose={detailsModal.closeModal}
        onEdit={() => {
          detailsModal.closeModal();
          handleEditClick(detailsModal.data?.id || '');
        }}
        showEditButton={!!detailsModal.data}
      >
        {detailsModal.data ? (
          <>
            <DetailSection
              title="Informações do Tipo de Entrada"
              icon={<MdOutlineAccountBalanceWallet className="w-5 h-5 text-[#0c4c6e]" />}
            >
              <DetailField label="Nome" value={<span className="font-medium">{detailsModal.data.name}</span>} />
              <DetailField label="Descrição" value={detailsModal.data.description || 'Sem descrição'} />
              <DetailField
                label="Status"
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      detailsModal.data.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {detailsModal.data.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </span>
                }
              />
            </DetailSection>

            <DetailSection title="Conta Associada" bgColor="bg-blue-50" columns={1}>
              <DetailField
                label="Conta de Compensação"
                value={`${detailsModal.data.accountCleared?.name} (${detailsModal.data.accountCleared?.code})`}
              />
            </DetailSection>

            <DetailSection title="Informações Adicionais">
              <DetailField
                label="Criado em"
                value={new Date(detailsModal.data.createdAt).toLocaleString('pt-BR')}
              />
              <DetailField
                label="Atualizado em"
                value={new Date(detailsModal.data.updatedAt).toLocaleString('pt-BR')}
              />
            </DetailSection>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Erro ao carregar informações do tipo de entrada</p>
          </div>
        )}
      </DetailsModal>
    </div>
  );
};

export default VisualizarTypeEntry;

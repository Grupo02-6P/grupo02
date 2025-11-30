import React, { useState } from 'react';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { typeMovementService } from '../../services/typeMovement';
import type { TypeMovementResponse } from '../../types/TypeMovement';
import { DataTable } from '../../components/table/DataTable';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import { InfoModal } from '../../components/modal/InfoModal';
import { ActionsColumn, useDefaultActions } from '../../components/table/ActionsColumn';
import { useResourcePermissions } from '../../context/PermissionContext';
import { useDebounceFilters } from '../../hooks/useDebounceFilters';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailsModal } from '../../components/modal/DetailsModal';
import { DetailSection } from '../../components/details/DetailSection';
import { DetailField } from '../../components/details/DetailField';
import { useDetailsModal } from '../../hooks/useDetailsModal';

const VisualizarTypeMovement: React.FC = () => {
  const { createViewAction, createEditAction, createDeleteAction } = useDefaultActions();
  const typeMovementPermissions = useResourcePermissions('TypeMovement');

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

  const [selectedTypeMovementId, setSelectedTypeMovementId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: undefined as 'success' | 'error' | undefined,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const detailsModal = useDetailsModal<TypeMovementResponse>();

  // Colunas da tabela
  const columns: ColumnDef<TypeMovementResponse>[] = [
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
      accessorKey: 'creditAccount.name',
      header: 'Conta Crédito',
      enableSorting: true,
      cell: ({ row }) => {
        const account = row.original.creditAccount;
        return account ? `${account.name} (${account.code})` : 'N/A';
      },
    },
    {
      accessorKey: 'debitAccount.name',
      header: 'Conta Débito',
      enableSorting: true,
      cell: ({ row }) => {
        const account = row.original.debitAccount;
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
          createEditAction(() => handleEditClick(row.original.id), typeMovementPermissions.canUpdate),
          createDeleteAction(
            () => handleInactivateClick(row.original.id),
            typeMovementPermissions.canDelete,
            row.original.status !== 'INACTIVE'
          ),
        ];

        return <ActionsColumn actions={actions} />;
      },
    },
  ];

  // Buscar tipos de movimento (integração com API)
  const fetchTypeMovements = async (params: any) => {
    const response = await typeMovementService.findAll(params);

    return {
      data: response.data,
      pagination: response.pagination,
    };
  };

  // Handlers
  const handleViewDetails = async (id: string) => {
    detailsModal.openModal();

    try {
      const response = await typeMovementService.findOne(id);
      detailsModal.setData(response);
    } catch (error) {
      detailsModal.setError();
      setInfoModal({ isOpen: true, title: 'Erro!', message: 'Erro ao carregar detalhes do tipo de movimento', type: 'error' });
    }
  };

  const handleEditClick = (id: string) => {
    navigate(`/tipo-movimento/editar/${id}`);
  };

  const handleInactivateClick = (id: string) => {
    setSelectedTypeMovementId(id);
    setConfirmModal(true);
  };

  const handleInactivateConfirm = async () => {
    if (!selectedTypeMovementId) return;
    try {
      await typeMovementService.inactive(selectedTypeMovementId);
      setConfirmModal(false);
      setSelectedTypeMovementId(null);
      setRefreshKey(prev => prev + 1);
      setInfoModal({ isOpen: true, title: 'Sucesso!', message: 'Tipo de movimento inativado com sucesso!', type: 'success' });
    } catch (err: any) {
      setConfirmModal(false);
      setInfoModal({ isOpen: true, title: 'Erro!', message: err.response?.data?.message || 'Erro ao inativar tipo de movimento', type: 'error' });
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
          icon={<ArrowLeftRight size={44} className="text-[#0c4c6e] mr-3" />}
          title="Tipos de Movimento"
          description="Gerencie todos os tipos de movimento contábil"
          actionButton={{
            label: 'Novo Tipo de Movimento',
            onClick: () => navigate('/tipo-movimento/cadastrar'),
            icon: <Plus size={20} />,
            show: typeMovementPermissions.canCreate,
          }}
        />

        {/* Tabela com DataTable */}
        <DataTable
          key={refreshKey}
          columns={columns}
          fetchData={fetchTypeMovements}
          emptyMessage="Nenhum tipo de movimento encontrado"
          emptyDescription="Tente ajustar os filtros de busca ou cadastre um novo tipo de movimento"
          pageSize={10}
          enableFilters={true}
          filterInputs={FilterInputs}
          externalFilters={filters}
          searchFields={searchFields}
        />
      </div>

      <ConfirmModal
        isOpen={confirmModal}
        onCancel={() => { setConfirmModal(false); setSelectedTypeMovementId(null); }}
        onConfirm={handleInactivateConfirm}
        title="Tem certeza que deseja inativar este tipo de movimento?"
        message="Esta ação irá inativar o tipo de movimento. Você pode reativá-lo posteriormente."
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
        title={detailsModal.data?.name || 'Detalhes do Tipo de Movimento'}
        subtitle="Visualize as informações do tipo de movimento"
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
              title="Informações do Tipo de Movimento"
              icon={<ArrowLeftRight className="w-5 h-5 text-[#0c4c6e]" />}
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

            <DetailSection title="Contas Associadas" bgColor="bg-blue-50">
              <DetailField
                label="Conta Crédito"
                value={`${detailsModal.data.creditAccount?.name} (${detailsModal.data.creditAccount?.code})`}
              />
              <DetailField
                label="Conta Débito"
                value={`${detailsModal.data.debitAccount?.name} (${detailsModal.data.debitAccount?.code})`}
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
            <p className="text-gray-600">Erro ao carregar informações do tipo de movimento</p>
          </div>
        )}
      </DetailsModal>
    </div>
  );
};

export default VisualizarTypeMovement;

import React, { useState } from 'react';
import { Plus, Building } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { partnerService } from '../../services/partner';
import type { PartnerResponse } from '../../types/Partner';
import { DataTable } from '../../components/table/DataTable';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import { InfoModal } from '../../components/modal/InfoModal';
import { ActionsColumn, useDefaultActions } from '../../components/table/ActionsColumn';
import { useResourcePermissions } from '../../context/PermissionContext';
import { useDebounceFilters } from '../../hooks/useDebounceFilters';
import { FaHandshake } from 'react-icons/fa';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailsModal } from '../../components/modal/DetailsModal';
import { DetailSection } from '../../components/details/DetailSection';
import { DetailField } from '../../components/details/DetailField';
import { useDetailsModal } from '../../hooks/useDetailsModal';


const VisualizarPartner: React.FC = () => {
  const { createViewAction, createEditAction, createDeleteAction } = useDefaultActions();
  const partnerPermissions = useResourcePermissions('Partner');

  const navigate = useNavigate();
  const {
    filters,
    handleFilterChange,
    searchFields,
    createTextInput
  } = useDebounceFilters(
    {
      search: '',
      companyId: '',
      status: '',
    },
    ['search']
  );

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: undefined as 'success' | 'error' | undefined,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const detailsModal = useDetailsModal<PartnerResponse>();

  

  // Colunas da tabela
  const columns: ColumnDef<PartnerResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      enableSorting: true,
    },
    {
      accessorKey: 'cnpj',
      header: 'CNPJ',
      enableSorting: true,
    },
    {
      accessorKey: 'address',
      header: 'Endereço',
      enableSorting: true,
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
          createEditAction(() => handleEditClick(row.original.id), partnerPermissions.canUpdate),
          createDeleteAction(
            () => handleInactivateClick(row.original.id),
            partnerPermissions.canDelete,
            row.original.status !== 'INACTIVE'
          ),
        ];

        return <ActionsColumn actions={actions} />;
      },
    },
  ];

  // Buscar parceiros (integração com API)
  const fetchPartners = async (params: any) => {
    const response = await partnerService.findAll(params);

    return {
      data: response.data,
      pagination: response.pagination,
    };
  };

  // Handlers
  const handleViewDetails = async (id: string) => {
    detailsModal.openModal();

    try {
      const response = await partnerService.findOne(id);
      detailsModal.setData(response);
    } catch (error) {
      detailsModal.setError();
      setInfoModal({ isOpen: true, title: 'Erro!', message: 'Erro ao carregar detalhes do parceiro', type: 'error' });
    }
  };

  const handleEditClick = (id: string) => {
    navigate(`/parceiros/editar/${id}`);
  };

  const handleInactivateClick = (id: string) => {
    setSelectedPartnerId(id);
    setConfirmModal(true);
  };

  const handleInactivateConfirm = async () => {
    if (!selectedPartnerId) return;
    try {
      await partnerService.inactive(selectedPartnerId);
      setConfirmModal(false);
      setSelectedPartnerId(null);
      setRefreshKey(prev => prev + 1);
      setInfoModal({ isOpen: true, title: 'Sucesso!', message: 'Parceiro inativado com sucesso!', type: 'success' });
    } catch (err: any) {
      setConfirmModal(false);
      setInfoModal({ isOpen: true, title: 'Erro!', message: err.response?.data?.message || 'Erro ao inativar parceiro', type: 'error' });
    }
  };

  // Inputs de filtro customizados
  const FilterInputs = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <input {...createTextInput('search', 'Buscar por nome ou CNPJ...')} />
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
          icon={<FaHandshake size={44} className="text-[#0c4c6e] mr-3" />}
          title="Parceiros"
          description="Gerencie todos os parceiros do sistema"
          actionButton={{
            label: 'Novo Parceiro',
            onClick: () => navigate('/parceiros/cadastrar'),
            icon: <Plus size={20} />,
            show: partnerPermissions.canCreate,
          }}
        />

        {/* Tabela com DataTable */}
        <DataTable
          key={refreshKey}
          columns={columns}
          fetchData={fetchPartners}
          emptyMessage="Nenhum parceiro encontrado"
          emptyDescription="Tente ajustar os filtros de busca ou cadastre um novo parceiro"
          pageSize={10}
          enableFilters={true}
          filterInputs={FilterInputs}
          externalFilters={filters}
          searchFields={searchFields}
        />
      </div>

      <ConfirmModal
        isOpen={confirmModal}
        onCancel={() => { setConfirmModal(false); setSelectedPartnerId(null); }}
        onConfirm={handleInactivateConfirm}
        title="Tem certeza que deseja inativar este parceiro?"
        message="Esta ação não pode ser desfeita. Todos os dados do parceiro serão perdidos permanentemente."
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
        title={detailsModal.data?.name || 'Detalhes do Parceiro'}
        subtitle="Visualize as informações vinculadas ao parceiro"
        onClose={detailsModal.closeModal}
        onEdit={() => {
          detailsModal.closeModal();
          handleEditClick(detailsModal.data?.id || '');
        }}
        showEditButton={!!detailsModal.data}
      >
        {detailsModal.data ? (
          <DetailSection
            title="Informações do Parceiro"
            icon={<Building className="w-5 h-5 text-[#0c4c6e]" />}
          >
            <DetailField label="Nome" value={<span className="font-medium">{detailsModal.data.name}</span>} />
            <DetailField label="CNPJ" value={detailsModal.data.cnpj} />
            <DetailField label="Endereço" value={detailsModal.data.address} />
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Erro ao carregar informações do parceiro</p>
          </div>
        )}
      </DetailsModal>
    </div>
  );
};

export default VisualizarPartner;

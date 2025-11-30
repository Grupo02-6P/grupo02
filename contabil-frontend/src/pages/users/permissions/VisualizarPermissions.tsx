import React, { useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { roleService } from '../../../services/role';
import type { RoleResponse } from '../../../types/Role';
import { DataTable } from '../../../components/table/DataTable';
import { ConfirmModal } from '../../../components/modal/ConfirmModal';
import { InfoModal } from '../../../components/modal/InfoModal';
import { useResourcePermissions } from '../../../context/PermissionContext';
import { ActionsColumn, useDefaultActions } from '../../../components/table/ActionsColumn';
import { useDebounceFilters } from '../../../hooks/useDebounceFilters';
import { DetailsModal } from '../../../components/modal/DetailsModal';
import { DetailSection } from '../../../components/details/DetailSection';
import { DetailField } from '../../../components/details/DetailField';
import { useDetailsModal } from '../../../hooks/useDetailsModal';

const VisualizarPermissions: React.FC = () => {
  const rolePermissions = useResourcePermissions('Role');
  const { createViewAction, createEditAction, createDeleteAction } = useDefaultActions();

  const {
    filters,
    searchFields,
    createTextInput
  } = useDebounceFilters(
    {
      name: '',
      description: '',
    },
    ['name', 'description']
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: undefined as 'success' | 'error' | undefined,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const detailsModal = useDetailsModal<RoleResponse>();

  // Definir colunas da tabela
  const columns: ColumnDef<RoleResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Nome da Função',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center">
          <Shield className="w-4 h-4 text-[#148553] mr-2" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.description}</span>
      ),
    },
    {
      id: 'permissions',
      header: 'Permissões',
      enableSorting: false,
      cell: ({ row }) => {
        const rolePermissions = row.original.rolePermissions || [];
        const totalPermissions = rolePermissions.length;
        
        // Agrupar por resource
        const groupedPermissions = rolePermissions.reduce((acc, rolePermission) => {
          const permission = rolePermission.permission;
          const resourceName = permission.resource?.name || `Resource-${permission.resourceId}`;
          
          if (!acc[resourceName]) {
            acc[resourceName] = [];
          }
          acc[resourceName].push(permission.action);
          return acc;
        }, {} as Record<string, string[]>);

        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">
              {totalPermissions} permissões em {Object.keys(groupedPermissions).length} recursos
            </div>
            <div className="flex flex-wrap gap-1 max-w-xs">
              {Object.entries(groupedPermissions).slice(0, 2).map(([resource, actions]) => (
                <div key={resource} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {resource}: {actions.join(', ')}
                </div>
              ))}
              {Object.keys(groupedPermissions).length > 2 && (
                <span className="text-xs text-gray-500">
                  +{Object.keys(groupedPermissions).length - 2} mais...
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'isDefault',
      header: 'Padrão',
      enableSorting: true,
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.isDefault
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.original.isDefault ? 'Sim' : 'Não'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Criado em',
      enableSorting: true,
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString('pt-BR')
          : '-',
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const actions = [
          createViewAction(() => handleViewClick(row.original)),
          createEditAction(() => handleEditClick(row.original.id), rolePermissions.canUpdate),
          createDeleteAction(
            () => handleDeleteClick(row.original.id),
            rolePermissions.canDelete, 
            !row.original.isDefault
          ),
        ];

        return <ActionsColumn actions={actions} />;
      },
    },
  ];

  // Função para buscar dados
  const fetchRoles = async (params: any) => {
    const response = await roleService.findAll({
      page: params.page,
      limit: params.limit,
      name: filters.name || undefined,
      description: filters.description || undefined,
    });
    
    
    return {
      data: response.data,
      pagination: response.pagination || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: response.data.length,
        totalPages: Math.ceil(response.data.length / (params.limit || 10))
      },
    };
  };

  const handleEditClick = (id: string) => {
    window.location.href = `/usuarios/permissoes/editar/${id}`;
  };

  const handleViewClick = async (role: RoleResponse) => {
    detailsModal.openModal();
    detailsModal.setData(role);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedRoleId(id);
    setConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRoleId) return;
    
    try {
      await roleService.remove(selectedRoleId);
      setConfirmModal(false);
      setSelectedRoleId(null);
      setRefreshKey(prev => prev + 1);
      setInfoModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Função excluída com sucesso!',
        type: 'success',
      });
    } catch (err: any) {
      setConfirmModal(false);
      setInfoModal({
        isOpen: true,
        title: 'Erro!',
        message: err.response.data.message || 'Erro ao excluir função',
        type: 'error',
      });
    }
  };



  // Componente de filtros customizado
  const FilterInputs = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        {...createTextInput('name', 'Nome da função')}
      />
      <input
        {...createTextInput('description', 'Descrição')}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Funções e Permissões</h1>
              <p className="text-gray-600 mt-1">Gerencie todas as funções e suas respectivas permissões</p>
            </div>
            {rolePermissions.canCreate && (
                <button
                onClick={() => (window.location.href = '/usuarios/permissoes/cadastrar')}
                className="flex items-center space-x-2 px-6 py-3 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition shadow-lg"
                >
                <Plus size={20} />
                <span>Nova Função</span>
                </button>
            )}
          </div>
        </div>

        {/* Tabela com DataTable */}
        <DataTable
          key={refreshKey}
          columns={columns}
          fetchData={fetchRoles}
          emptyMessage="Nenhuma função encontrada"
          emptyDescription="Tente ajustar os filtros de busca ou cadastre uma nova função com suas respectivas permissões"
          pageSize={10}
          enableFilters={true}
          filterInputs={FilterInputs}
          externalFilters={filters}
          searchFields={searchFields}
        />
      </div>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={confirmModal}
        onCancel={() => {
          setConfirmModal(false);
          setSelectedRoleId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Tem certeza que deseja excluir esta função?"
        message="Esta ação não pode ser desfeita. Todos os usuários com esta função perderão suas permissões."
        confirmText="Sim, excluir"
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

      {/* Modal de Visualização de Função */}
      <DetailsModal
        isOpen={detailsModal.isOpen}
        isLoading={detailsModal.isLoading}
        title={detailsModal.data?.name || 'Detalhes da Função'}
        subtitle="Visualize as informações da função e suas permissões"
        onClose={detailsModal.closeModal}
        onEdit={() => {
          detailsModal.closeModal();
          handleEditClick(detailsModal.data?.id || '');
        }}
        showEditButton={!!detailsModal.data && rolePermissions.canUpdate}
      >
        {detailsModal.data ? (
          <>
            <DetailSection
              title="Informações Básicas"
              icon={<Shield className="w-5 h-5 text-[#0c4c6e]" />}
            >
              <DetailField 
                label="Nome" 
                value={<span className="font-medium">{detailsModal.data.name}</span>} 
              />
              <DetailField 
                label="Descrição" 
                value={detailsModal.data.description || 'Sem descrição'} 
              />
              <DetailField
                label="Função Padrão"
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      detailsModal.data.isDefault
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {detailsModal.data.isDefault ? 'Sim' : 'Não'}
                  </span>
                }
              />
            </DetailSection>

            <DetailSection 
              title={`Permissões (${detailsModal.data.rolePermissions?.length || 0})`}
              bgColor="bg-blue-50"
              columns={1}
            >
              {detailsModal.data.rolePermissions && detailsModal.data.rolePermissions.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    // Agrupar permissões por recurso
                    const groupedPermissions = detailsModal.data.rolePermissions.reduce((acc, rolePermission) => {
                      const permission = rolePermission.permission;
                      const resourceName = permission.resource?.name || `Resource-${permission.resourceId}`;
                      
                      if (!acc[resourceName]) {
                        acc[resourceName] = [];
                      }
                      acc[resourceName].push(permission.action);
                      return acc;
                    }, {} as Record<string, string[]>);

                    return Object.entries(groupedPermissions).map(([resource, actions]) => (
                      <div key={resource} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <h5 className="font-medium text-gray-900 mb-2">{resource}</h5>
                        <div className="flex flex-wrap gap-2">
                          {actions.map((action, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhuma permissão atribuída a esta função.</p>
              )}
            </DetailSection>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Erro ao carregar informações da função</p>
          </div>
        )}
      </DetailsModal>
    </div>
  );
};

export default VisualizarPermissions;

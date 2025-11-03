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
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: undefined as 'success' | 'error' | undefined,
  });
  const [refreshKey, setRefreshKey] = useState(0);

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
    try {
      setSelectedRole(role);
      setViewModal(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes da role:', error);
    }
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
      {viewModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Detalhes da Função
              </h3>
              <button
                onClick={() => {
                  setViewModal(false);
                  setSelectedRole(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Informações Básicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRole.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRole.description || 'Sem descrição'}</p>
                  </div>
                </div>
              </div>

              {/* Permissões */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Permissões ({selectedRole.rolePermissions?.length || 0})
                </h4>
                
                {selectedRole.rolePermissions && selectedRole.rolePermissions.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      // Agrupar permissões por recurso
                      const groupedPermissions = selectedRole.rolePermissions.reduce((acc, rolePermission) => {
                        const permission = rolePermission.permission;
                        const resourceName = permission.resource?.name || `Resource-${permission.resourceId}`;
                        
                        if (!acc[resourceName]) {
                          acc[resourceName] = [];
                        }
                        acc[resourceName].push(permission.action);
                        return acc;
                      }, {} as Record<string, string[]>);

                      return Object.entries(groupedPermissions).map(([resource, actions]) => (
                        <div key={resource} className="border border-gray-200 rounded-lg p-3">
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
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setViewModal(false);
                  setSelectedRole(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
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

export default VisualizarPermissions;

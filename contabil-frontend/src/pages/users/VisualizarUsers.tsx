import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, User, Mail, Shield } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/users';
import type { UserResponse } from '../../types/User';
import { DataTable } from '../../components/table/DataTable';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import { InfoModal } from '../../components/modal/InfoModal';
import type { RoleListResponse } from '../../types/Role';
import roleService from '../../services/role';
import { ActionsColumn, useDefaultActions } from '../../components/table/ActionsColumn';
import { useResourcePermissions } from '../../context/PermissionContext';
import { useDebounceFilters } from '../../hooks/useDebounceFilters';
import { FaUsers } from 'react-icons/fa';


const VisualizarUsers: React.FC = () => {
  const { createViewAction, createEditAction, createDeleteAction } = useDefaultActions();
  const userPermissions = useResourcePermissions('User');

  const navigate = useNavigate();
  
  const {
    filters,
    handleFilterChange,
    searchFields,
    createTextInput
  } = useDebounceFilters(
    {
      search: '',
      roleId: '',
      status: '',
    },
    ['search']
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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
    user: null as UserResponse | null,
    isLoading: false,
  });

  const [roles, setRoles] = useState<RoleListResponse | null>(null);



  // Carregar roles disponíveis
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleService.findAll();
        setRoles(response);
      } catch (error) {
        console.error('Erro ao carregar funções:', error);
      }
    };

    fetchRoles();
  }, [refreshKey]);

  // Definir colunas da tabela
  const columns: ColumnDef<UserResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      enableSorting: true,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
    },
    {
      accessorKey: 'role',
      header: 'Função',
      enableSorting: true,
      cell: ({ row }) => {
        const role = row.original.role || { label: row.original.role, color: 'bg-gray-100 text-gray-800' };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium`}>
            {role.name}
          </span>
        );
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
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {status}
          </span>
        );
      },
    },
    {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => {
        const actions = [
            createViewAction(() => handleViewDetails(row.original.id)),
            createEditAction(() => handleEditClick(row.original.id), userPermissions.canUpdate),
            createDeleteAction(
            () => handleInactivateClick(row.original.id), 
            userPermissions.canDelete, 
            row.original.status !== 'INACTIVE'
            ),
        ];

        return <ActionsColumn actions={actions} />;
        },
    },
  ];

  // Função para buscar dados (integração com sua API)
  const fetchUsers = async (params: any) => {
    const response = await userService.findAll(params);

    return {
      data: response.data,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: response.data.length,
        totalPages: Math.ceil(response.data.length / (params?.limit || 10)),
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  };

  // Handlers
  const handleViewDetails = async (id: string) => {
    setDetailsModal({ 
      isOpen: true, 
      user: null, 
      isLoading: true 
    });
    
    try {
      const response = await userService.findOne(id);
      setDetailsModal({
        isOpen: true,
        user: response,
        isLoading: false,
      });
    } catch (error) {
      setDetailsModal({ 
        isOpen: false, 
        user: null, 
        isLoading: false 
      });
      setInfoModal({
        isOpen: true,
        title: 'Erro!',
        message: 'Erro ao carregar detalhes do usuário',
        type: 'error',
      });
    }
  };

  const handleEditClick = (id: string) => {
    navigate(`/usuarios/editar/${id}`);
  };

  const handleInactivateClick = (id: string) => {
    setSelectedUserId(id);
    setConfirmModal(true);
  };

  const handleInactivateConfirm = async () => {
    if (!selectedUserId) return;
    try {
      await userService.inactive(selectedUserId);
      setConfirmModal(false);
      setSelectedUserId(null);
      setRefreshKey(prev => prev + 1); // Força reload da tabela
      setInfoModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Usuário inativado com sucesso!',
        type: 'success',
      });
    } catch (err: any) {
      setConfirmModal(false);
      setInfoModal({
        isOpen: true,
        title: 'Erro!',
        message: err.response.data.message || 'Erro ao inativar usuário',
        type: 'error',
      });
    }
  };



  // Componente de filtros customizado
  const FilterInputs = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        {...createTextInput('search', 'Buscar por nome ou email...')}
      />
      <select
        value={filters.roleId}
        onChange={e => handleFilterChange('roleId', e.target.value)}
        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e]"
      >
        <option value="">Todas as funções</option>
        {roles?.data.map((role) => (
          <option key={role.name} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
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
              <FaUsers size={44} className="text-[#0c4c6e] mr-3"/>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
                <p className="text-gray-600 mt-1">Gerencie todos os usuários do sistema</p>
              </div>
            </div>
            {userPermissions.canCreate && (
                <button
                onClick={() => navigate('/usuarios/cadastrar')}
                className="flex items-center space-x-2 px-6 py-3 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition shadow-lg"
                >
                <Plus size={20} />
                <span>Novo Usuário</span>
                </button>
            )}
          </div>
        </div>

        {/* Tabela com DataTable */}
        <DataTable
          key={refreshKey} 
          columns={columns}
          fetchData={fetchUsers}
          emptyMessage="Nenhum usuário encontrado"
          emptyDescription="Tente ajustar os filtros de busca ou cadastre um novo usuário"
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
          setSelectedUserId(null);
        }}
        onConfirm={handleInactivateConfirm}
        title="Tem certeza que deseja inativar este usuário?"
        message="Esta ação não pode ser desfeita. Todos os dados do usuário serão perdidos permanentemente."
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

      {/* Modal de Detalhes do Usuário */}
      {detailsModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-[#0c4c6e] to-[#083f5d] text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {detailsModal.isLoading ? 'Carregando...' : detailsModal.user?.name || 'Detalhes do Usuário'}
                </h2>
                <p className="text-green-100 text-sm mt-1">
                  Visualize as informações e escolas vinculadas ao usuário
                </p>
              </div>
              <button
                onClick={() => setDetailsModal({ isOpen: false, user: null, isLoading: false })}
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
              ) : detailsModal.user ? (
                <div className="space-y-6">
                  {/* Informações do Usuário */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-[#0c4c6e]" />
                      Informações Pessoais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nome Completo:</label>
                        <p className="text-gray-900 mt-1 font-medium">{detailsModal.user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          Email:
                        </label>
                        <p className="text-gray-900 mt-1">{detailsModal.user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                          <Shield className="w-4 h-4 mr-1" />
                          Função:
                        </label>
                        <div className="mt-2">
                          {(() => {
                            const role = detailsModal.user.role || { 
                              name: detailsModal.user.role,
                              color: 'bg-gray-100 text-gray-800'
                            };
                            return (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium`}>
                                {role.name}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status:</label>
                        <div className="mt-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              detailsModal.user.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {detailsModal.user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Erro ao carregar informações do usuário</p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button
                onClick={() => setDetailsModal({ isOpen: false, user: null, isLoading: false })}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mr-3"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setDetailsModal({ isOpen: false, user: null, isLoading: false });
                  handleEditClick(detailsModal.user?.id || '');
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

export default VisualizarUsers;

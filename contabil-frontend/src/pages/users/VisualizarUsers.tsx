import React, { useState, useEffect } from 'react';
import { Plus, User, Mail, Shield } from 'lucide-react';
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
import { FaUsers } from 'react-icons/fa6';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailsModal } from '../../components/modal/DetailsModal';
import { DetailSection } from '../../components/details/DetailSection';
import { DetailField } from '../../components/details/DetailField';
import { useDetailsModal } from '../../hooks/useDetailsModal';


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
  const detailsModal = useDetailsModal<UserResponse>();

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
    detailsModal.openModal();
    
    try {
      const response = await userService.findOne(id);
      detailsModal.setData(response);
    } catch (error) {
      detailsModal.setError();
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
        <PageHeader
          icon={<FaUsers size={44} className="text-[#0c4c6e] mr-3" />}
          title="Usuários"
          description="Gerencie todos os usuários do sistema"
          actionButton={{
            label: 'Novo Usuário',
            onClick: () => navigate('/usuarios/cadastrar'),
            icon: <Plus size={20} />,
            show: userPermissions.canCreate,
          }}
        />

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

      <DetailsModal
        isOpen={detailsModal.isOpen}
        isLoading={detailsModal.isLoading}
        title={detailsModal.data?.name || 'Detalhes do Usuário'}
        subtitle="Visualize as informações do usuário"
        onClose={detailsModal.closeModal}
        onEdit={() => {
          detailsModal.closeModal();
          handleEditClick(detailsModal.data?.id || '');
        }}
        showEditButton={!!detailsModal.data}
      >
        {detailsModal.data ? (
          <DetailSection
            title="Informações Pessoais"
            icon={<User className="w-5 h-5 text-[#0c4c6e]" />}
          >
            <DetailField label="Nome Completo" value={<span className="font-medium">{detailsModal.data.name}</span>} />
            <DetailField label="Email" value={detailsModal.data.email} icon={<Mail className="w-4 h-4" />} />
            <DetailField
              label="Função"
              icon={<Shield className="w-4 h-4" />}
              value={<span className="px-3 py-1 rounded-full text-sm font-medium">{detailsModal.data.role?.name || detailsModal.data.role}</span>}
            />
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
            <p className="text-gray-600">Erro ao carregar informações do usuário</p>
          </div>
        )}
      </DetailsModal>
    </div>
  );
};

export default VisualizarUsers;

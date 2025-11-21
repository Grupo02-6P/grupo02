import type { ComponentType } from 'react';
import type { PermissionAction } from '../types/Permissions';

// Páginas públicas
import Login from '../pages/Login';
import Home from '../pages/Home';
import VisualizarUsers from '../pages/users/VisualizarUsers';
import CadastrarUsers from '../pages/users/CadastrarUsers';
import EditarUsers from '../pages/users/EditarUsers';
import CadastrarRole from '../pages/users/permissions/CadastrarPermission';
import VisualizarPermissions from '../pages/users/permissions/VisualizarPermissions';
import EditarRole from '../pages/users/permissions/EditarPermissions';
import CadastrarPartner from '../pages/partners/CadastrarPartner';
import VisualizarPartner from '../pages/partners/VisualizarPartner';
import EditarPartner from '../pages/partners/EditarPartner';
import GerenciarAccounts from '../pages/account/GerenciarAccounts';
import CadastrarTypeMovement from '../pages/type-movement/CadastrarTypeMovement';
import VisualizarTypeMovement from '../pages/type-movement/VisualizarTypeMovement';
import EditarTypeMovement from '../pages/type-movement/EditarTypeMovement';
import CadastrarTypeEntry from '../pages/type-entry/CadastrarTypeEntry';
import VisualizarTypeEntry from '../pages/type-entry/VisualizarTypeEntry';
import EditarTypeEntry from '../pages/type-entry/EditarTypeEntry';
import ReportsPage from '../pages/reports/page';
import VisualizarTitle from '../pages/title/VisualizarTitle';
import CadastrarTitle from '../pages/title/CadastrarTitle';
import EditarTitle from '../pages/title/EditarTitle';

export interface RouteConfig {
  path: string;
  element: ComponentType;
  label?: string;
  isProtected?: boolean;
  requiresPermission?: boolean; // Se a rota precisa verificar permissões
  resource?: string; // Qual recurso a rota acessa
  action?: PermissionAction; // Qual ação é necessária (read, create, update, delete, manage)
}

export const routes: RouteConfig[] = [
  // Rotas públicas
  { 
    path: '/login', 
    element: Login, 
    label: 'Login',
    isProtected: false // 👈 Rota pública
  },
  { 
    path: '/home', 
    element: Home, 
    label: 'Home',
    isProtected: true,
    requiresPermission: false // Home não precisa de permissão específica
  },
  { 
    path: '/usuarios/visualizar', 
    element: VisualizarUsers, 
    label: 'Visualizar Usuários',
    isProtected: true,
    requiresPermission: true,
    resource: 'User',
    action: 'read'
  },
  { 
    path: '/usuarios/cadastrar', 
    element: CadastrarUsers, 
    label: 'Cadastrar Usuário',
    isProtected: true ,
    requiresPermission: true,
    resource: 'User',
    action: 'create'
  },
  { 
    path: '/usuarios/editar/:id', 
    element: EditarUsers, 
    label: 'Editar Usuário',
    isProtected: true ,
    requiresPermission: true,
    resource: 'User',
    action: 'update'
  },
  { 
    path: '/usuarios/permissoes/cadastrar', 
    element: CadastrarRole, 
    label: 'Cadastrar Permissão',
    isProtected: true,
    requiresPermission: true,
    resource: 'Role',
    action: 'create'
  },
  { 
    path: '/usuarios/permissoes/visualizar', 
    element: VisualizarPermissions, 
    label: 'Visualizar Permissão',
    isProtected: true,
    requiresPermission: true,
    resource: 'Role',
    action: 'read'
  },
  { 
    path: '/usuarios/permissoes/editar/:id', 
    element: EditarRole, 
    label: 'Editar Permissão',
    isProtected: true,
    requiresPermission: true,
    resource: 'Role',
    action: 'update'
  },
  {
    path: '/relatorios',
    element: ReportsPage,
    label: 'Relatórios',
    isProtected: true,
    requiresPermission: true, // Ou false, dependendo da sua regra
    resource: 'Report', // Supondo que 'Report' seja o recurso
    action: 'read',
  },
  { 
    path: '/parceiros/cadastrar', 
    element: CadastrarPartner, 
    label: 'Cadastrar Parceiro',
    isProtected: true,
    requiresPermission: true,
    resource: 'Partner',
    action: 'create'
  },
  { 
    path: '/parceiros/visualizar', 
    element: VisualizarPartner, 
    label: 'Visualizar Parceiro',
    isProtected: true,
    requiresPermission: true,
    resource: 'Partner',
    action: 'read'
  },
  { 
    path: '/parceiros/editar/:id', 
    element: EditarPartner, 
    label: 'Editar Parceiro',
    isProtected: true,
    requiresPermission: true,
    resource: 'Partner',
    action: 'update'
  },
  { 
    path: '/contas/gerenciar', 
    element: GerenciarAccounts, 
    label: 'Gerenciar Contas',
    isProtected: true,
    requiresPermission: true,
    resource: 'Account',
    action: 'create'
  },

  { 
    path: '/tipo-movimento/cadastrar', 
    element: CadastrarTypeMovement, 
    label: 'Cadastrar Tipo de Movimento',
    isProtected: true,
    requiresPermission: true,
    resource: 'TypeMovement',
    action: 'create'
  },
  { 
    path: '/tipo-movimento/visualizar', 
    element: VisualizarTypeMovement, 
    label: 'Visualizar Tipo de Movimento',
    isProtected: true,
    requiresPermission: true,
    resource: 'TypeMovement',
    action: 'read'
  },
  { 
    path: '/tipo-movimento/editar/:id', 
    element: EditarTypeMovement, 
    label: 'Editar Tipo de Movimento',
    isProtected: true,
    requiresPermission: true,
    resource: 'TypeMovement',
    action: 'update'
  },
  { 
    path: '/tipo-entrada/cadastrar', 
    element: CadastrarTypeEntry, 
    label: 'Cadastrar Tipo de Entrada',
    isProtected: true,
    requiresPermission: true,
    resource: 'TypeEntry',
    action: 'create'
  },
  { 
    path: '/tipo-entrada/visualizar', 
    element: VisualizarTypeEntry, 
    label: 'Visualizar Tipo de Entrada',
    isProtected: true,
    requiresPermission: true,
    resource: 'TypeEntry',
    action: 'read'
  },
  { 
    path: '/tipo-entrada/editar/:id', 
    element: EditarTypeEntry, 
    label: 'Editar Tipo de Entrada',
    isProtected: true,
    requiresPermission: true,
    resource: 'TypeEntry',
    action: 'update'
  },
  { 
    path: '/titulo/visualizar', 
    element: VisualizarTitle, 
    label: 'Visualizar Lançamentos de Título',
    isProtected: true,
    requiresPermission: true,
    resource: 'Title',
    action: 'read'
  },
  { 
    path: '/titulo/cadastrar', 
    element: CadastrarTitle, 
    label: 'Cadastrar Lançamento de Título',
    isProtected: true,
    requiresPermission: true,
    resource: 'Title',
    action: 'create'
  },
  { 
    path: '/titulo/editar/:id', 
    element: EditarTitle, 
    label: 'Editar Lançamento de Título',
    isProtected: true,
    requiresPermission: true,
    resource: 'Title',
    action: 'update'
  },
];
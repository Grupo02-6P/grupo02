// Tipos para as abilities vindas do JWT
export type JWTAbility = [string, string, Record<string, any>]; // [action, resource, conditions]

// Tipo para as ações válidas no sistema
export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage';

// Recursos especiais
export type SpecialResource = 'all'; // "all" se aplica a todos os recursos

export interface DecodedJWT {
  nome: string;
  email: string;
  role: string;
  sub: string;
  abilities: JWTAbility[];
  iat: number;
  exp: number;
}

export interface UserPermissions {
  canView: boolean;
  canEdit: boolean;
  canCreate: boolean;
  canDelete: boolean;
}

export interface RoutePermissions {
  [routePath: string]: UserPermissions;
}

export interface PermissionContextType {
  permissions: RoutePermissions;
  hasPermission: (route: string, action: keyof UserPermissions) => boolean;
  hasResourcePermission: (resource: string, action: string) => boolean;
  setPermissions: (permissions: RoutePermissions) => void;
  abilities: JWTAbility[];
  setAbilities: (abilities: JWTAbility[]) => void;
}

// Mapeamento de rotas para recursos
export const ROUTE_RESOURCE_MAP: Record<string, string> = {
  // Escolas
  '/escolas/cadastrar': 'School',
  '/escolas/visualizar': 'School',
  '/escolas/editar': 'School',
  '/escolas/visualizar/:id': 'School',
  '/escolas/editar/:id': 'School',
  
  // Agrupamentos de Escolas
  '/escolas/agrupamentos/cadastrar': 'School',
  '/escolas/agrupamentos/visualizar': 'School',
  '/escolas/agrupamentos/editar/:id': 'School',
  
  // CDs
  '/cds/cadastrar': 'CD',
  '/cds/visualizar': 'CD',
  '/cds/editar/:id': 'CD',
  
  // Cardápios
  '/cardapios/tipo-cardapio/cadastrar': 'TypeMenu',
  '/cardapios/tipo-cardapio/visualizar': 'TypeMenu',
  '/cardapios/tipo-cardapio/editar/:id': 'TypeMenu',
  
  // Usuários
  '/usuarios/cadastrar': 'User',
  '/usuarios/visualizar': 'User',
  '/usuarios/editar/:id': 'User',
  
  // Permissões/Roles
  '/usuarios/permissoes/cadastrar': 'Role',
  '/usuarios/permissoes/visualizar': 'Role',
  '/usuarios/permissoes/editar/:id': 'Role',
  
  // Calendário/Feriados
  '/calendario/feriados': 'Holiday',
  '/calendario/visualizar': 'Holiday',
  '/calendario/integracao/nacionais': 'Holiday',
  
  // Endereços
  '/enderecos': 'Address',
  
  // Contatos
  '/contatos': 'Contact',
  
  // Home (sem recurso específico)
  '/home': 'Dashboard',
};

// Mapeamento de ações de rotas para ações do sistema
export const ROUTE_ACTION_MAP: Record<string, PermissionAction> = {
  'cadastrar': 'create',
  'visualizar': 'read',
  'editar': 'update',
  'excluir': 'delete',
  'gerenciar': 'manage',
  'default': 'read', // Para rotas sem ação específica
};


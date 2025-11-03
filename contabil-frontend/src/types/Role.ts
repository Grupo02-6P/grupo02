export type permissions = {
    resource: string;
    action: 'manage' | 'create' | 'read' | 'update' | 'delete';
    fields?: string[];
    conditions?: Record<string, any>;
}

// Tipos para a estrutura real retornada pela API
export interface PermissionData {
  id: string;
  action: 'manage' | 'create' | 'read' | 'update' | 'delete';
  fields: string[] | null;
  conditions: Record<string, any> | null;
  resourceId: string;
  resource?: {
    id: string;
    name: string;
    description: string;
  };
}

export interface RolePermission {
  id: string;
  permission: PermissionData;
  permissionId: string;
  roleId: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  rolePermissions: RolePermission[];
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateRoleDto {
  name: string;
  description: string;
  isDefault: boolean;
  permissions: permissions[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isDefault?: boolean;
  permissions?: permissions[];
}

export interface RoleListResponse {
  data: RoleResponse[];
    pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};
}

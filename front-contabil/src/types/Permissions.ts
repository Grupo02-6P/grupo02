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
  setPermissions: (permissions: RoutePermissions) => void;
}

// Permissões padrão para diferentes tipos de usuário
export const DEFAULT_PERMISSIONS = {
  ADMIN: {
    canView: true,
    canEdit: true,
    canCreate: true,
    canDelete: true,
  },
  EDITOR: {
    canView: true,
    canEdit: true,
    canCreate: true,
    canDelete: false,
  },
  VIEWER: {
    canView: true,
    canEdit: false,
    canCreate: false,
    canDelete: false,
  },
  NONE: {
    canView: false,
    canEdit: false,
    canCreate: false,
    canDelete: false,
  }
};

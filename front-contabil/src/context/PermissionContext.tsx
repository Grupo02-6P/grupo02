import React, { createContext, useContext, useState, useEffect } from 'react';
import type { RoutePermissions, PermissionContextType, UserPermissions } from '../types/Permissions';
import { DEFAULT_PERMISSIONS } from '../types/Permissions';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<RoutePermissions>({});

  useEffect(() => {
    
    const mockUserType = 'ADMIN'; 

    const mockPermissions: RoutePermissions = {
      '/config': DEFAULT_PERMISSIONS[mockUserType],
      '/home': DEFAULT_PERMISSIONS[mockUserType],
      '/about': { ...DEFAULT_PERMISSIONS[mockUserType], canDelete: false }, 
      '/users': DEFAULT_PERMISSIONS[mockUserType],
    };

    setPermissions(mockPermissions);
  }, []);

  const hasPermission = (route: string, action: keyof UserPermissions): boolean => {
    const routePermissions = permissions[route];
    if (!routePermissions) {
      return false;
    }
    return routePermissions[action];
  };

  return (
    <PermissionContext.Provider 
      value={{ 
        permissions, 
        hasPermission, 
        setPermissions 
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionProvider');
  }
  return context;
};

// Hook customizado para usar permissões de uma rota específica
export const useRoutePermissions = (route: string) => {
  const { hasPermission } = usePermissions();
  
  return {
    canView: hasPermission(route, 'canView'),
    canEdit: hasPermission(route, 'canEdit'),
    canCreate: hasPermission(route, 'canCreate'),
    canDelete: hasPermission(route, 'canDelete'),
  };
};

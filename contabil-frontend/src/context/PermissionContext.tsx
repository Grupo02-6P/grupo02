import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  RoutePermissions, 
  PermissionContextType, 
  UserPermissions, 
  JWTAbility
} from '../types/Permissions';
import { ROUTE_RESOURCE_MAP } from '../types/Permissions';
import { useAuth } from './AuthContext';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<RoutePermissions>({});
  const [abilities, setAbilities] = useState<JWTAbility[]>([]);
  const { abilities: authAbilities, isAuthenticated, loading } = useAuth();

  // Sincronizar abilities do AuthContext
  useEffect(() => {
    
    // Só processar quando não estiver carregando
    if (!loading) {
      if (isAuthenticated && authAbilities.length > 0) {
        setAbilities(authAbilities);
      } else {
        setAbilities([]);
        setPermissions({});
      }
    }
  }, [authAbilities, isAuthenticated, loading]);

  // Recomputar permissões quando abilities mudam
  useEffect(() => {
    if (abilities.length > 0) {
      const computedPermissions = computeRoutePermissions(abilities);
      setPermissions(computedPermissions);
    } else {
      setPermissions({});
    }
  }, [abilities]);

  // Função para computar permissões de rotas baseadas nas abilities
  const computeRoutePermissions = (userAbilities: JWTAbility[]): RoutePermissions => {
    const routePermissions: RoutePermissions = {};

    // Para cada rota configurada, verificar se o usuário tem permissão
    Object.entries(ROUTE_RESOURCE_MAP).forEach(([route, resource]) => {
      routePermissions[route] = {
        canView: hasAbility(userAbilities, 'read', resource) || 
                 hasAbility(userAbilities, 'manage', resource) ||
                 hasAbility(userAbilities, 'read', 'all') ||
                 hasAbility(userAbilities, 'manage', 'all'),
        canCreate: hasAbility(userAbilities, 'create', resource) || 
                   hasAbility(userAbilities, 'manage', resource) ||
                   hasAbility(userAbilities, 'create', 'all') ||
                   hasAbility(userAbilities, 'manage', 'all'),
        canEdit: hasAbility(userAbilities, 'update', resource) || 
                 hasAbility(userAbilities, 'manage', resource) ||
                 hasAbility(userAbilities, 'update', 'all') ||
                 hasAbility(userAbilities, 'manage', 'all'),
        canDelete: hasAbility(userAbilities, 'delete', resource) || 
                   hasAbility(userAbilities, 'manage', resource) ||
                   hasAbility(userAbilities, 'delete', 'all') ||
                   hasAbility(userAbilities, 'manage', 'all'),
      };
    });

    return routePermissions;
  };

  // Função para verificar se o usuário tem uma ability específica
  const hasAbility = (userAbilities: JWTAbility[], action: string, resource: string): boolean => {
    return userAbilities.some(([abilityAction, abilityResource]) => {
      // Verifica se a ação corresponde
      const actionMatches = abilityAction === action;
      
      // Verifica se o recurso corresponde (exato ou "all")
      const resourceMatches = abilityResource === resource || abilityResource === 'all';
      
      return actionMatches && resourceMatches;
    });
  };

  // Função para verificar permissão baseada na rota
  const hasPermission = (route: string, action: keyof UserPermissions): boolean => {
    const routePermissions = permissions[route];
    if (!routePermissions) {
      return false;
    }
    return routePermissions[action];
  };

  // Função para verificar permissão direta por recurso e ação
  const hasResourcePermission = (resource: string, action: string): boolean => {
    // Verifica permissão específica para o recurso
    const hasSpecificPermission = hasAbility(abilities, action, resource) || hasAbility(abilities, 'manage', resource);
    
    // Verifica permissão global (resource "all")
    const hasGlobalPermission = hasAbility(abilities, action, 'all') || hasAbility(abilities, 'manage', 'all');
    
    return hasSpecificPermission || hasGlobalPermission;
  };

  const value: PermissionContextType = {
    permissions,
    hasPermission,
    hasResourcePermission,
    setPermissions,
    abilities,
    setAbilities: (newAbilities: JWTAbility[]) => {
      setAbilities(newAbilities);
    },
  };

  return (
    <PermissionContext.Provider value={value}>
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

// Hook para verificar permissões por recurso e ação
export const useResourcePermissions = (resource: string) => {
  const { hasResourcePermission } = usePermissions();
  
  return {
    canRead: hasResourcePermission(resource, 'read') || hasResourcePermission(resource, 'manage'),
    canCreate: hasResourcePermission(resource, 'create') || hasResourcePermission(resource, 'manage'),
    canUpdate: hasResourcePermission(resource, 'update') || hasResourcePermission(resource, 'manage'),
    canDelete: hasResourcePermission(resource, 'delete') || hasResourcePermission(resource, 'manage'),
    canManage: hasResourcePermission(resource, 'manage'),
  };
};

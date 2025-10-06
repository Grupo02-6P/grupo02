import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import { routes } from './routesConfig';
import type { JSX } from 'react';

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requiresPermission?: boolean;
  routePath?: string;
}> = ({ children, requiresPermission, routePath }) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPermission } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permissões se necessário
  if (requiresPermission && routePath && !hasPermission(routePath, 'canView')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">403</h1>
          <p className="text-xl text-gray-600 mt-4">Acesso negado</p>
          <p className="text-gray-500 mt-2">Você não tem permissão para acessar esta página</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Componente para rotas públicas (evita acessar login se já logado)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se já está logado e tenta acessar login, redireciona para dashboard
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

function AppRoutes(): JSX.Element {
  return (
    <Routes>
      {routes.map(({ path, element: Element, isProtected, requiresPermission }) => (
        <Route 
          key={path} 
          path={path} 
          element={
            isProtected ? (
              <ProtectedRoute requiresPermission={requiresPermission} routePath={path}>
                <Element />
              </ProtectedRoute>
            ) : (
              <PublicRoute>
                <Element />
              </PublicRoute>
            )
          } 
        />
      ))}
      
      {/* Rota padrão - redireciona baseado na autenticação */}
      <Route 
        path="/" 
        element={<RedirectBasedOnAuth />}
      />
      
      {/* 404 - Página não encontrada */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900">404</h1>
              <p className="text-xl text-gray-600 mt-4">Página não encontrada</p>
              <button 
                onClick={() => window.history.back()}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

// Componente para redirecionar baseado na autenticação
const RedirectBasedOnAuth: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se não está logado, vai para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se está logado, vai para dashboard
  return <Navigate to="/home" replace />;
};

export default AppRoutes;
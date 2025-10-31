import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredPermission, adminOnly = false }) => {
  const { authenticated, user, loading, hasPermission, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin()) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Acesso Negado</h2>
        <p>Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
        <p>Permissão necessária: <strong>{requiredPermission}</strong></p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
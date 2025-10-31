import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { authenticated, user, logout, hasPermission, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{ 
      padding: '10px 20px', 
      backgroundColor: '#f8f9fa', 
      borderBottom: '1px solid #dee2e6',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
          Home
        </Link>
        
        {authenticated && (
          <>
            {/* Mostrar apenas telas para as quais o usuário tem permissão */}
            {hasPermission('access_tela1') && (
              <Link to="/tela1" style={{ textDecoration: 'none', color: '#495057' }}>
                Tela 1
              </Link>
            )}
            {hasPermission('access_tela2') && (
              <Link to="/tela2" style={{ textDecoration: 'none', color: '#495057' }}>
                Tela 2
              </Link>
            )}
            {hasPermission('access_tela3') && (
              <Link to="/tela3" style={{ textDecoration: 'none', color: '#495057' }}>
                Tela 3
              </Link>
            )}
            {hasPermission('access_suport') && (
              <Link to="/suport" style={{ textDecoration: 'none', color: '#495057' }}>
                Suporte
              </Link>
            )}
            
            <Link to="/empresas" style={{ textDecoration: 'none', color: '#495057' }}>
              Empresas
            </Link>
            
            {isAdmin() && (
              <Link to="/admin/users" style={{ textDecoration: 'none', color: '#dc3545' }}>
                Admin
              </Link>
            )}
          </>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {authenticated ? (
          <>
            <span style={{ color: '#495057' }}>
              Olá, <strong>{user?.username}</strong>
            </span>
            <Link to="/profile" style={{ textDecoration: 'none', color: '#007bff' }}>
              Perfil
            </Link>
            <button 
              onClick={handleLogout}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', color: '#007bff' }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
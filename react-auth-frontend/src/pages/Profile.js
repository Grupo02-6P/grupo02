import React from 'react';
import { useAuth } from '../context/AuthContext';
import ChangePassword from '../components/Auth/ChangePassword';

const Profile = () => {
  const { user, getFormattedPermissions } = useAuth();

  const formatPermissionName = (permission) => {
    const permissionNames = {
      'access_tela1': 'Acessar Tela 1',
      'access_tela2': 'Acessar Tela 2', 
      'access_tela3': 'Acessar Tela 3',
      'access_suport': 'Acessar Suporte'
    };
    return permissionNames[permission] || permission;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Perfil do Usuário</h1>
      <div style={{ marginBottom: '30px' }}>
        <h2>Informações Pessoais</h2>
        <p><strong>Usuário:</strong> {user?.username}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Administrador:</strong> {user?.is_staff ? 'Sim' : 'Não'}</p>
        
        <div>
          <strong>Permissões:</strong>
          {getFormattedPermissions().length > 0 ? (
            <ul>
              {getFormattedPermissions().map(permission => (
                <li key={permission}>{formatPermissionName(permission)}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma permissão específica</p>
          )}
        </div>
      </div>
      
      <ChangePassword />
    </div>
  );
};

export default Profile;
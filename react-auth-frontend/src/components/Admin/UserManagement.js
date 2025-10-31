import React, { useState, useEffect } from 'react';
import { authService, availablePermissions } from '../../services/auth';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await authService.listUsers();
      setUsers(data);
    } catch (error) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (userId, permission) => {
    try {
      await authService.togglePermission(userId, permission);
      await loadUsers(); // Recarrega a lista para atualizar as permissões
    } catch (error) {
      setError('Erro ao alterar permissão');
    }
  };

  // Função para formatar o nome da permissão para exibição
  const formatPermissionName = (permission) => {
    const permissionNames = {
      'access_tela1': 'Acessar Tela 1',
      'access_tela2': 'Acessar Tela 2', 
      'access_tela3': 'Acessar Tela 3',
      'access_suport': 'Acessar Suporte'
    };
    return permissionNames[permission] || permission;
  };

  // Verifica se o usuário tem a permissão (considerando o formato completo accounts.permission)
  const userHasPermission = (user, permission) => {
    return user.permissions && user.permissions.includes(`accounts.${permission}`);
  };

  if (loading) return <div style={{ padding: '20px' }}>Carregando usuários...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gerenciamento de Usuários</h1>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {users.map(user => (
          <div key={user.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{user.username}</h3>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>{user.email}</p>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Permissões:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                {user.permissions && user.permissions.map(permission => (
                  <span 
                    key={permission}
                    style={{
                      padding: '2px 8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}
                  >
                    {formatPermissionName(permission.replace('accounts.', ''))}
                  </span>
                ))}
                {(!user.permissions || user.permissions.length === 0) && (
                  <span style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma permissão</span>
                )}
              </div>
            </div>

            <div>
              <strong>Gerenciar Permissões:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                {availablePermissions.map(permission => (
                  <button
                    key={permission}
                    onClick={() => togglePermission(user.id, permission)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: userHasPermission(user, permission) ? '#dc3545' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {userHasPermission(user, permission) 
                      ? `Remover ${formatPermissionName(permission)}` 
                      : `Adicionar ${formatPermissionName(permission)}`
                    }
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
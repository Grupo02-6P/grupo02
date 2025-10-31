import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { authenticated, user } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bem-vindo ao Sistema</h1>
      {authenticated ? (
        <div>
          <p>Olá, <strong>{user?.username}</strong>! Você está logado.</p>
          <p>Use o menu acima para navegar pelo sistema.</p>
        </div>
      ) : (
        <p>Por favor, faça login para acessar o sistema.</p>
      )}
    </div>
  );
};

export default Home;
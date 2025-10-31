import React, { useState, useEffect } from 'react';
import { screenServices } from '../services/auth';

const Tela1 = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await screenServices.tela1();
        setData(response);
      } catch (error) {
        setError('Erro ao carregar dados da Tela 1');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Carregando Tela 1...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tela 1</h1>
      <div style={{ padding: '20px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <p>{data?.message}</p>
      </div>
    </div>
  );
};

export default Tela1;
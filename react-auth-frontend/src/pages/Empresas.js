import React, { useState, useEffect } from 'react';
import { screenServices } from '../services/auth';

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    ativa: true
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const data = await screenServices.empresas.list();
      setEmpresas(data);
    } catch (error) {
      setError('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await screenServices.empresas.update(editingId, formData);
      } else {
        await screenServices.empresas.create(formData);
      }
      await loadEmpresas();
      resetForm();
    } catch (error) {
      setError('Erro ao salvar empresa');
    }
  };

  const handleEdit = (empresa) => {
    setFormData({
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      ativa: empresa.ativa
    });
    setEditingId(empresa.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await screenServices.empresas.delete(id);
        await loadEmpresas();
      } catch (error) {
        setError('Erro ao excluir empresa');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nome: '', cnpj: '', ativa: true });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div style={{ padding: '20px' }}>Carregando...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Empresas</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancelar' : 'Nova Empresa'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da' }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>{editingId ? 'Editar Empresa' : 'Nova Empresa'}</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nome:</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>CNPJ:</label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={formData.ativa}
                onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                style={{ marginRight: '5px' }}
              />
              Ativa
            </label>
          </div>
          <div>
            <button type="submit" style={{ marginRight: '10px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px' }}>
              Salvar
            </button>
            <button type="button" onClick={resetForm} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {empresas.map(empresa => (
          <div key={empresa.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>{empresa.nome}</h4>
              <p style={{ margin: '0', color: '#666' }}>CNPJ: {empresa.cnpj}</p>
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '3px', 
                fontSize: '12px',
                backgroundColor: empresa.ativa ? '#d4edda' : '#f8d7da',
                color: empresa.ativa ? '#155724' : '#721c24'
              }}>
                {empresa.ativa ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div>
              <button 
                onClick={() => handleEdit(empresa)}
                style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '3px' }}
              >
                Editar
              </button>
              <button 
                onClick={() => handleDelete(empresa.id)}
                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {empresas.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          Nenhuma empresa cadastrada
        </div>
      )}
    </div>
  );
};

export default Empresas;
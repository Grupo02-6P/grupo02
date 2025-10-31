import React, { useState } from 'react';
import { authService } from '../../services/auth';

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwords.new_password !== passwords.confirm_password) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const data = await authService.changePassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      setMessage(data.message);
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Alterar Senha</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Senha Atual:</label>
          <input
            type="password"
            name="old_password"
            value={passwords.old_password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nova Senha:</label>
          <input
            type="password"
            name="new_password"
            value={passwords.new_password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirmar Nova Senha:</label>
          <input
            type="password"
            name="confirm_password"
            value={passwords.confirm_password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
        >
          {loading ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
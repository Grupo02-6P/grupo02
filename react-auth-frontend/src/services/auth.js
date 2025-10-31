import api, { setCSRFToken } from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    
    // Salva o CSRF token retornado do login
    if (response.data.csrf) {
      setCSRFToken(response.data.csrf);
    }
    
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout/');
    setCSRFToken(null); // Limpa o token no logout
    return response.data;
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check-auth/');
      console.log(response)
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (passwords) => {
    const response = await api.post('/auth/change-password/', passwords);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  listUsers: async () => {
    const response = await api.get('/auth/users/');
    return response.data;
  },

  togglePermission: async (userId, permission) => {
    const response = await api.post(`/auth/users/${userId}/toggle-permission/`, {
      perm: `accounts.${permission}` // Adiciona o app_label 'accounts'
    });
    return response.data;
  }
};

// Serviços para telas protegidas
export const screenServices = {
  tela1: async () => {
    const response = await api.get('/telas/tela1/');
    return response.data;
  },

  tela2: async () => {
    const response = await api.get('/telas/tela2/');
    return response.data;
  },

  tela3: async () => {
    const response = await api.get('/telas/tela3/');
    return response.data;
  },

  suport: async () => {
    const response = await api.get('/telas/suport/');
    return response.data;
  },

  empresas: {
    list: async () => {
      const response = await api.get('/empresas/');
      return response.data;
    },
    create: async (data) => {
      const response = await api.post('/empresas/', data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await api.put(`/empresas/${id}/`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/empresas/${id}/`);
      return response.data;
    }
  }
};

// Lista de permissões disponíveis baseadas no seu Meta
export const availablePermissions = [
  'access_tela1',
  'access_tela2', 
  'access_tela3',
  'access_suport'
];
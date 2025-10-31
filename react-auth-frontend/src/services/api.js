import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Importante para sessions
});

// Armazenar CSRF token globalmente
let csrfToken = null;

export const setCSRFToken = (token) => {
  csrfToken = token;
};

export const getCSRFToken = () => {
  return csrfToken;
};

// Interceptor para incluir CSRF token em todas as requisições
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method) && csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login se não autenticado
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
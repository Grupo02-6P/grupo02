import type { 
    ResourceResponse,
    ResourceListResponse,
} from '../types/Resource';
import api from './api';

class ResourceService {
  private baseUrl = '/resources';

  // Listar todos os recursos
  async findAll(): Promise<ResourceListResponse> {
    try {

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await api.get(this.baseUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Recursos encontrados:', response.data);
      return response.data; // Retorna { data, pagination }

    } catch (error: any) {
      console.error('❌ Erro ao buscar recursos:', error);
      throw this.handleError(error);
    }
  }

  // Buscar recurso por ID
  async findOne(id: string): Promise<ResourceResponse> {
    try {

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await api.get(`${this.baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ recurso encontrado:', response.data);
      return response.data;

    } catch (error: any) {
      console.error('❌ Erro ao buscar recurso:', error);
      throw this.handleError(error);
    }
  }

  // Handler de erros
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    // Tratar erros da API
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;

      switch (status) {
        case 400:
          return new Error(message || 'Dados inválidos fornecidos');
        case 401:
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return new Error('Sessão expirada. Faça login novamente.');
        case 403:
          return new Error('Você não tem permissão para realizar esta ação');
        case 404:
          return new Error('escola não encontrado');
        case 409:
          return new Error(message || 'Conflito ao processar a requisição');
        case 500:
          return new Error('Erro interno do servidor. Tente novamente mais tarde.');
        default:
          return new Error(message || 'Erro ao processar requisição');
      }
    }

    // Erro de rede
    if (error.request) {
      return new Error('Erro de conexão com o servidor. Verifique sua internet.');
    }

    return new Error(error.message || 'Erro desconhecido');
  }
}

// Instância singleton do serviço
export const resourceService = new ResourceService();
export default resourceService;
import type { 
    RoleResponse,
    RoleListResponse,
    CreateRoleDto,
    UpdateRoleDto
} from '../types/Role';
import api from './api';

interface PaginationParams {
  page?: number;
  limit?: number;
  name?: string;
  description?: string;
}

class RoleService {
  private baseUrl = '/roles';

  // Criar nova função
  async create(data: CreateRoleDto): Promise<RoleResponse> {
    try {

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await api.post(this.baseUrl, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;

    } catch (error: any) {
      console.error('❌ Erro ao criar escola:', error);
      throw this.handleError(error);
    }
  }

  // Listar todos os funções
  async findAll(params? : PaginationParams): Promise<RoleListResponse> {
    try {

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }
      const queryParams: any = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        ...params
      };

      // Remove undefined e vazio
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      const response = await api.get(this.baseUrl, {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Funções encontradas:', response.data);
      return response.data; // Retorna { data, pagination }

    } catch (error: any) {
      console.error('❌ Erro ao buscar funções:', error);
      throw this.handleError(error);
    }
  }

  // Buscar função por ID
  async findOne(id: string): Promise<RoleResponse> {
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

      console.log('✅ função encontrado:', response.data);
      return response.data;

    } catch (error: any) {
      console.error('❌ Erro ao buscar função:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar função
  async update(id: string, data: UpdateRoleDto): Promise<RoleResponse> {
    try {
      console.log('✏️ Atualizando função:', id, data);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await api.patch(`${this.baseUrl}/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ função atualizado com sucesso:', response.data);
      return response.data;

    } catch (error: any) {
      console.error('❌ Erro ao atualizar função:', error);
      throw this.handleError(error);
    }
  }

  // Deletar função
  async remove(id: string): Promise<void> {
    try {
      console.log('🗑️ Deletando função:', id);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      await api.delete(`${this.baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ função deletado com sucesso');

    } catch (error: any) {
      console.error('❌ Erro ao deletar função:', error);
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
export const roleService = new RoleService();
export default roleService;
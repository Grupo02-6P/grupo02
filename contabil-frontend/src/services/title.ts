import type { 
    TitleResponse,
    TitleListResponse,
    CreateTitleDto,
    UpdateTitleDto
} from '../types/Title';
import api from './api';

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  code?: string;
  description?: string;
  date?: string;
  value?: number;
  movementId?: string;
  partnerId?: string;
}

class TitleService {
  private baseUrl = '/title';

  // Criar novo titulo
  async create(data: CreateTitleDto): Promise<TitleResponse> {
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
      console.error('❌ Erro ao criar Título:', error);
      throw this.handleError(error);
    }
  }

  // Listar todos os Títulos
  async findAll(params?: PaginationParams): Promise<TitleListResponse> {
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

        return response.data; // Retorna { data, pagination }

    } catch (error: any) {
        console.error('❌ Erro ao buscar Usuarios:', error);
        throw this.handleError(error);
    }
    }

  // Buscar Título por ID
  async findOne(id: string): Promise<TitleResponse> {
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

      return response.data;

    } catch (error: any) {
      console.error('❌ Erro ao buscar Título:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar Título
  async update(id: string, data: UpdateTitleDto): Promise<TitleResponse> {
    try {

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await api.patch(`${this.baseUrl}/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;

    } catch (error: any) {
      console.error('❌ Erro ao atualizar Título:', error);
      throw this.handleError(error);
    }
  }

  // Deletar Título
  async remove(id: string): Promise<void> {
    try {

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      await api.delete(`${this.baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


    } catch (error: any) {
      console.error('❌ Erro ao deletar Título:', error);
      throw this.handleError(error);
    }
  }

  async inactive(id: string): Promise<void> {
    try {

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      await api.patch(`${this.baseUrl}/${id}/inactivate`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

    } catch (error: any) {
      console.error('❌ Erro ao inativar Título:', error)
      throw this.handleError(error)
    }
  };

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
          return new Error('Usuario não encontrado');
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
export const titleService = new TitleService();
export default titleService;
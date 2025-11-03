import type { 
    AccountResponse,
    AccountListResponse,
    CreateAccountDto,
    UpdateAccountDto
} from '../types/Account';
import api from './api';

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  name?: string;
  description?: string;
  active?: 'ACTIVE' | 'INACTIVE';
  acceptsPosting?: boolean;
}


class AccountService {
  private baseUrl = '/account';

  // Criar nova conta
  async create(data: CreateAccountDto): Promise<AccountResponse> {
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
      console.error('❌ Erro ao criar parceiro:', error);
      throw this.handleError(error);
    }
  }

  // Listar todos os contas
  async findAll(params: PaginationParams): Promise<AccountListResponse> {
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
        headers: {
            Authorization: `Bearer ${token}`
          },
          params: queryParams
        });

        return response.data; // Retorna { data, pagination }

    } catch (error: any) {
        console.error('❌ Erro ao buscar parceiros:', error);
        throw this.handleError(error);
    }
    }

  // Buscar conta por ID
  async findOne(id: string): Promise<AccountResponse> {
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
      console.error('❌ Erro ao buscar parceiro:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar conta
  async update(id: string, data: UpdateAccountDto): Promise<AccountResponse> {
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
      console.error('❌ Erro ao atualizar parceiro:', error);
      throw this.handleError(error);
    }
  }

  // Deletar parceiro
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
      console.error('❌ Erro ao deletar parceiro:', error);
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
      console.error('❌ Erro ao inativar parceiro:', error)
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
          return new Error('Empresa não encontrada');
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
export const accountService = new AccountService();
export default accountService;
import api from './api';
import type { TitleResponse, CreateTitleDto, UpdateTitleDto } from '../types/Title';

export const titleService = {
  // Buscar todos os títulos
  findAll: async (params?: Record<string, string | number | undefined>) => {
    try {
      const response = await api.get<TitleResponse[]>('/title', { params });
      
      // Simula paginação se a API não retornar
      const data = response.data;
      const limit = typeof params?.limit === 'number' ? params.limit : 10;
      const page = typeof params?.page === 'number' ? params.page : 1;
      return {
        data: Array.isArray(data) ? data : [],
        pagination: {
          total: Array.isArray(data) ? data.length : 0,
          page: page,
          limit: limit,
          totalPages: Math.ceil((Array.isArray(data) ? data.length : 0) / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar títulos:', error);
      throw error;
    }
  },

  // Buscar um título por ID
  findOne: async (id: string) => {
    try {
      const response = await api.get<TitleResponse>(`/title/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar título:', error);
      throw error;
    }
  },

  // Criar um novo título
  create: async (data: CreateTitleDto) => {
    try {
      const response = await api.post<TitleResponse>('/title', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar título:', error);
      throw error;
    }
  },

  // Atualizar um título
  update: async (id: string, data: UpdateTitleDto) => {
    try {
      const response = await api.patch<TitleResponse>(`/title/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      throw error;
    }
  },

  // Remover um título
  remove: async (id: string) => {
    try {
      const response = await api.delete(`/title/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao remover título:', error);
      throw error;
    }
  },

  // Inativar um título
  inactive: async (id: string) => {
    try {
      const response = await api.patch<TitleResponse>(`/title/${id}`, { status: 'INACTIVE' });
      return response.data;
    } catch (error) {
      console.error('Erro ao inativar título:', error);
      throw error;
    }
  }
};

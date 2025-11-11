import api from './api';
import type { EntryResponse, CreateEntryDto, UpdateEntryDto } from '../types/Entry';

export const entryService = {
  // Buscar todos os lançamentos
  findAll: async (params?: Record<string, string | number | undefined>) => {
    try {
      const response = await api.get<EntryResponse[]>('/entry', { params });
      
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
      console.error('Erro ao buscar lançamentos:', error);
      throw error;
    }
  },

  // Buscar um lançamento por ID
  findOne: async (id: string) => {
    try {
      const response = await api.get<EntryResponse>(`/entry/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lançamento:', error);
      throw error;
    }
  },

  // Criar um novo lançamento
  create: async (data: CreateEntryDto) => {
    try {
      const response = await api.post<EntryResponse>('/entry', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      throw error;
    }
  },

  // Atualizar um lançamento
  update: async (id: string, data: UpdateEntryDto) => {
    try {
      const response = await api.patch<EntryResponse>(`/entry/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error);
      throw error;
    }
  },

  // Remover um lançamento
  remove: async (id: string) => {
    try {
      const response = await api.delete(`/entry/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao remover lançamento:', error);
      throw error;
    }
  },

  // Inativar um lançamento
  inactive: async (id: string) => {
    try {
      const response = await api.patch<EntryResponse>(`/entry/${id}`, { status: 'INACTIVE' });
      return response.data;
    } catch (error) {
      console.error('Erro ao inativar lançamento:', error);
      throw error;
    }
  }
};

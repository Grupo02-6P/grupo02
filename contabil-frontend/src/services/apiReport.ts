import { api } from './api';

export interface CreateReportDto {
  type: 'TRIAL_BALANCE' | 'DRE' | 'BALANCO' | 'LEDGER';
  format: 'PDF' | 'CSV';
  startDate: string;
  endDate: string;
  accountId?: string;
}

export const generateReport = async (dto: CreateReportDto): Promise<Blob> => {
  try {
    const response = await api.post('/reports', dto, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar o relatório:', error);
    throw error;
  }
};

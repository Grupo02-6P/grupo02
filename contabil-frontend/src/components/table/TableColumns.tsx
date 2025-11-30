import { type ColumnDef } from '@tanstack/react-table';

// Tipos de status suportados
export type StatusType = 'ACTIVE' | 'INACTIVE' | 'PAID' | 'PENDING';

// Configuração de badges por status
const statusConfig: Record<StatusType, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Ativo',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  INACTIVE: {
    label: 'Inativo',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  PAID: {
    label: 'Pago',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  PENDING: {
    label: 'Pendente',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
};

/**
 * Cria uma coluna de status padronizada para a tabela
 * @param accessor - Nome do campo de status no objeto (padrão: 'status')
 * @returns Definição da coluna de status
 */
export function createStatusColumn<TData = unknown>(
  accessor: string = 'status'
): ColumnDef<TData> {
  return {
    accessorKey: accessor,
    header: 'Status',
    enableSorting: true,
    cell: ({ row }) => {
      const original = row.original as Record<string, unknown>;
      const status = original[accessor] as StatusType;
      const config = statusConfig[status] || {
        label: String(status),
        className: 'bg-gray-100 text-gray-700 border-gray-200',
      };

      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.className}`}>
          {config.label}
        </span>
      );
    },
  };
}

/**
 * Cria uma coluna de status com múltiplos estados (ex: ACTIVE, INACTIVE, PAID)
 * @param accessor - Nome do campo de status no objeto
 * @param customConfig - Configuração customizada de status (opcional)
 * @returns Definição da coluna de status
 */
export function createCustomStatusColumn<TData = unknown>(
  accessor: string,
  customConfig?: Partial<Record<string, { label: string; className: string }>>
): ColumnDef<TData> {
  const mergedConfig = { ...statusConfig, ...customConfig };

  return {
    accessorKey: accessor,
    header: 'Status',
    enableSorting: true,
    cell: ({ row }) => {
      const original = row.original as Record<string, unknown>;
      const status = String(original[accessor]);
      const config = (mergedConfig as Record<string, { label: string; className: string }>)[status] || {
        label: status,
        className: 'bg-gray-100 text-gray-700 border-gray-200',
      };

      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.className}`}>
          {config.label}
        </span>
      );
    },
  };
}

/**
 * Formata um valor monetário em Real brasileiro
 * @param value - Valor numérico
 * @returns String formatada em moeda
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
}

/**
 * Formata uma data para o formato brasileiro
 * @param date - Data a ser formatada
 * @returns String formatada em dd/mm/yyyy
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Formata uma data e hora para o formato brasileiro
 * @param date - Data a ser formatada
 * @returns String formatada em dd/mm/yyyy hh:mm
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

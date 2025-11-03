// components/badge/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    INACTIVE: 'bg-red-100 text-red-800 border-red-200',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  const labels = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    PENDING: 'Pendente'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
};
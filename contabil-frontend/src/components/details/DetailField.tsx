import React, { type ReactNode } from 'react';

interface DetailFieldProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  icon,
  fullWidth = false,
}) => {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="text-sm font-medium text-gray-600 flex items-center">
        {icon && <span className="mr-1">{icon}</span>}
        {label}:
      </label>
      <div className="mt-1">
        {typeof value === 'string' || typeof value === 'number' ? (
          <p className="text-gray-900">{value}</p>
        ) : (
          value
        )}
      </div>
    </div>
  );
};

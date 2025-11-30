import React, { type ReactNode } from 'react';

interface DetailSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  columns?: 1 | 2;
  bgColor?: string;
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  icon,
  children,
  columns = 2,
  bgColor = 'bg-gray-50',
}) => {
  return (
    <div className={`${bgColor} rounded-xl p-6`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : ''} gap-6`}>
        {children}
      </div>
    </div>
  );
};

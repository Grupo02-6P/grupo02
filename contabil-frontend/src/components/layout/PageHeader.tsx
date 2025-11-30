import React, { type ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon: ReactNode;
    show: boolean;
  };
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  description,
  actionButton,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className='flex mr-4 items-center'>
          {icon}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        {actionButton && actionButton.show && (
          <button
            onClick={actionButton.onClick}
            className="flex items-center space-x-2 px-6 py-3 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition shadow-lg"
          >
            {actionButton.icon}
            <span>{actionButton.label}</span>
          </button>
        )}
      </div>
    </div>
  );
};

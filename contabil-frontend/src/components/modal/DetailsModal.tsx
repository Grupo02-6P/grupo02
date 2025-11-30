import React, { type ReactNode } from 'react';
import { X, Edit } from 'lucide-react';

interface DetailsModalProps {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onEdit?: () => void;
  showEditButton?: boolean;
  children: ReactNode;
  maxWidth?: string;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  isLoading,
  title,
  subtitle = 'Visualize as informações detalhadas',
  onClose,
  onEdit,
  showEditButton = true,
  children,
  maxWidth = 'max-w-4xl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[90vh] overflow-hidden`}>
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-[#0c4c6e] to-[#083f5d] text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isLoading ? 'Carregando...' : title}
            </h2>
            <p className="text-green-100 text-sm mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c4c6e]"></div>
                <p className="text-gray-600">Carregando informações...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">{children}</div>
          )}
        </div>

        {/* Footer do Modal */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mr-3"
          >
            Fechar
          </button>
          {showEditButton && onEdit && !isLoading && (
            <button
              onClick={onEdit}
              className="px-6 py-2 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition-colors flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

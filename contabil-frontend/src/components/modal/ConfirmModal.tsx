import React from "react";
import Button from "../button/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: "⚠️",
      confirmButton: "bg-red-600 hover:bg-red-700 text-white",
      iconBg: "bg-red-100"
    },
    warning: {
      icon: "⚠️",
      confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
      iconBg: "bg-yellow-100"
    },
    info: {
      icon: "ℹ️",
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
      iconBg: "bg-blue-100"
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`${currentStyle.iconBg} rounded-full p-2 mr-3`}>
              <span className="text-xl">{currentStyle.icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={`px-4 py-2 ${currentStyle.confirmButton}`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

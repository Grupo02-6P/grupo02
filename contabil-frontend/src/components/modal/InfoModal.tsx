import React from "react";
import Button from "../button/Button";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  type?: 'danger' | 'warning' | 'info' | 'error' | 'success' | undefined;
}

export const InfoModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  onConfirm,
  type = 'info'
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
    },
    error: {
      icon: "❌",
      confirmButton: "bg-red-600 hover:bg-red-700 text-white",
      iconBg: "bg-red-100"
    },
    success: {
      icon: "✅",
      confirmButton: "bg-green-600 hover:bg-green-700 text-white",
      iconBg: "bg-green-100"
    },
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

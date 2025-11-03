import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

export interface ActionButton {
  type: 'view' | 'edit' | 'delete' | 'custom';
  icon?: React.ReactNode;
  title: string;
  onClick: () => void;
  visible?: boolean;
  className?: string;
  iconClassName?: string;
}

interface ActionsColumnProps {
  actions: ActionButton[];
}

const defaultIcons = {
  view: Eye,
  edit: Edit,
  delete: Trash2,
};

const defaultStyles = {
  view: {
    className: 'p-2 rounded hover:bg-green-100 transition-colors',
    iconClassName: 'w-5 h-5 text-green-700',
  },
  edit: {
    className: 'p-2 rounded hover:bg-blue-100 transition-colors',
    iconClassName: 'w-5 h-5 text-blue-700',
  },
  delete: {
    className: 'p-2 rounded hover:bg-red-100 transition-colors',
    iconClassName: 'w-5 h-5 text-red-700',
  },
};

export const ActionsColumn: React.FC<ActionsColumnProps> = ({ actions }) => {
  return (
    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
      {actions.map((action, index) => {
        // Se visible for false, não renderiza o botão
        if (action.visible === false) return null;

        let IconComponent = action.icon;
        let buttonClassName = action.className;
        let iconClassName = action.iconClassName;

        // Se não é um ícone customizado, usa os padrões
        if (action.type !== 'custom' && !action.icon) {
          const DefaultIcon = defaultIcons[action.type];
          IconComponent = <DefaultIcon className={iconClassName || defaultStyles[action.type].iconClassName} />;
          buttonClassName = buttonClassName || defaultStyles[action.type].className;
        }

        return (
          <button
            key={index}
            title={action.title}
            className={buttonClassName}
            onClick={action.onClick}
          >
            {IconComponent}
          </button>
        );
      })}
    </div>
  );
};

// Hook para criar ações padrão
export const useDefaultActions = () => {
  const createViewAction = (onView: () => void): ActionButton => ({
    type: 'view',
    title: 'Visualizar',
    onClick: onView,
  });

  const createEditAction = (onEdit: () => void, canEdit: boolean = true): ActionButton => ({
    type: 'edit',
    title: 'Editar',
    onClick: onEdit,
    visible: canEdit,
  });

  const createDeleteAction = (onDelete: () => void, canDelete: boolean = true, condition?: boolean): ActionButton => ({
    type: 'delete',
    title: 'Inativar',
    onClick: onDelete,
    visible: canDelete && (condition !== false),
  });

  return {
    createViewAction,
    createEditAction,
    createDeleteAction,
  };
};
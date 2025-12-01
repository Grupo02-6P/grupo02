import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { usePermissions } from '../../context/PermissionContext';
import { LogOut, Menu, X } from 'lucide-react';
import { FaUsers, FaHandshake, FaFileInvoiceDollar, FaUserShield, FaChevronRight } from "react-icons/fa6";
import { FaExchangeAlt } from 'react-icons/fa';
import { MdDashboard, MdAccountBalance, MdAccountBalanceWallet} from "react-icons/md";
import { BiSolidReport } from "react-icons/bi";

interface NavigationSubItem {
  path?: string;
  label: string;
  subItems?: NavigationSubItem[]; // Permite subitens recursivos
  permission?: {
    resource: string;
    action: string;
  };
}

interface NavigationItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  subItems?: NavigationSubItem[];
  permission?: {
    resource: string;
    action: string;
  };
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { hasResourcePermission } = usePermissions();
  // Carregar estado de expansão do localStorage
  const [expandedItems, setExpandedItems] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('navbar-expanded-items');
    return saved ? JSON.parse(saved) : [];
  });

  // MOVIDO ANTES DO RETURN CONDICIONAL
  const navigationItems = React.useMemo<NavigationItem[]>(() => [
    { path: '/home', label: 'Início', icon: <MdDashboard size={20} /> },
    { 
      path: '/titulo/visualizar',
      label: 'Títulos', 
      icon: <FaFileInvoiceDollar size={20} />,
      permission: { resource: 'Title', action: 'read' }
    },
    { 
      path: '/parceiros/visualizar',
      label: 'Parceiros', 
      icon: <FaHandshake size={20} />,
      permission: { resource: 'Partner', action: 'read' }
    },
    { 
      path: '/contas/visualizar',
      label: 'Contas', 
      icon: <MdAccountBalance size={20} />,
      permission: { resource: 'Account', action: 'read' }
    },
    { 
      path: '/tipo-movimento/visualizar',
      label: 'Tipos de Movimento', 
      icon: <FaExchangeAlt size={20} />,
      permission: { resource: 'TypeMovement', action: 'read' }
    },
    { 
      path: '/tipo-entrada/visualizar',
      label: 'Tipos de Entrada', 
      icon: <MdAccountBalanceWallet size={20} />,
      permission: { resource: 'TypeEntry', action: 'read' }
    },    
    { 
      path: '/relatorios',
      label: 'Relatórios', 
      icon: <BiSolidReport size={20} />,
      permission: { resource: 'Report', action: 'read' }
    },
    { 
      path: '/usuarios/visualizar',
      label: 'Usuários', 
      icon: <FaUsers size={20} />,
      permission: { resource: 'User', action: 'read' }
    },
    { 
      path: '/usuarios/permissoes/visualizar',
      label: 'Permissões', 
      icon: <FaUserShield size={20} />,
      permission: { resource: 'Role', action: 'read' }
    },
  ], []);

  // Se não estiver logado, não renderizar nada
  // MOVIDO DEPOIS DE TODOS OS HOOKS
  if (!isAuthenticated) {
    return null;
  }

  // Função para verificar se o usuário tem permissão
  const hasPermission = (permission?: { resource: string; action: string }): boolean => {
    if (!permission) return true; // Se não tem permissão definida, sempre mostra
    return hasResourcePermission(permission.resource, permission.action);
  };

  // Filtrar subitens baseado em permissões
  const filterSubItemsByPermission = (subItems?: NavigationSubItem[]): NavigationSubItem[] => {
    if (!subItems) return [];
    
    return subItems.filter(subItem => {
      // Se tem subitens, verifica recursivamente
      if (subItem.subItems) {
        const filteredSubItems = filterSubItemsByPermission(subItem.subItems);
        // Mostra o subitem se: tem permissão para ele OU se pelo menos um sub-subitem for visível
        return hasPermission(subItem.permission) || filteredSubItems.length > 0;
      }
      
      // Se não tem subitens, só mostra se tem permissão
      return hasPermission(subItem.permission);
    }).map(subItem => ({
      ...subItem,
      subItems: subItem.subItems ? filterSubItemsByPermission(subItem.subItems) : undefined
    }));
  };

  // Filtrar itens de navegação baseado em permissões
  const filteredNavigationItems = navigationItems.filter(item => {
    // Se tem subitens, verifica se pelo menos um é visível
    if (item.subItems) {
      const filteredSubItems = filterSubItemsByPermission(item.subItems);
      // Mostra o item se: tem permissão para ele OU se pelo menos um subitem for visível
      return hasPermission(item.permission) || filteredSubItems.length > 0;
    }
    
    // Se não tem subitens, só mostra se tem permissão
    return hasPermission(item.permission);
  }).map(item => ({
    ...item,
    subItems: item.subItems ? filterSubItemsByPermission(item.subItems) : undefined
  }));

  const isActivePath = (path: string): boolean => {
    return location.pathname === path;
  };

  const isItemExpanded = (label: string): boolean => {
    return expandedItems.includes(label);
  };

  const toggleItemExpansion = (label: string): void => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const hasActiveSubItem = (subItems?: NavigationSubItem[]): boolean => {
    if (!subItems) return false;
    return subItems.some(subItem => {
      if (subItem.path && isActivePath(subItem.path)) return true;
      if (subItem.subItems) return hasActiveSubItem(subItem.subItems);
      return false;
    });
  };

  // Componente recursivo para renderizar subitens
  const renderSubItems = (subItems: NavigationSubItem[], level: number = 1) => {
    // Usar valores fixos que o Tailwind reconhece
    const getMarginLeft = (level: number) => {
      switch(level) {
        case 1: return 'ml-6';
        case 2: return 'ml-10';
        case 3: return 'ml-14';
        default: return 'ml-16';
      }
    };
    
    const marginLeft = getMarginLeft(level);
    const dotSize = level === 1 ? 'w-2 h-2' : 'w-1.5 h-1.5';
    const textSize = level === 1 ? 'text-sm' : 'text-xs';
    const chevronSize = level === 1 ? 12 : 10;
    
    return (
      <div className={`${marginLeft} mt-1 space-y-1`}>
        {subItems.map((subItem) => (
          <div key={subItem.path || subItem.label}>
            {subItem.path ? (
              // Subitem com link
              <Link
                to={subItem.path}
                className={`flex items-center px-3 py-2 rounded-lg ${textSize} transition-all duration-200 group ${
                  isActivePath(subItem.path)
                    ? 'bg-white/20 text-white'
                    : 'text-gray-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`${dotSize} rounded-full bg-current opacity-50 mr-3`}></div>
                <span>{subItem.label}</span>
              </Link>
            ) : (
              // Subitem expansível
              <div>
                <button
                  onClick={() => toggleItemExpansion(`${subItem.label}-${level}`)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${textSize} transition-all duration-200 group ${
                    hasActiveSubItem(subItem.subItems)
                      ? 'bg-white/20 text-white'
                      : hasPermission(subItem.permission)
                      ? 'text-gray-200 hover:bg-white/10 hover:text-white'
                      : 'text-gray-300 hover:bg-white/5 hover:text-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`${dotSize} rounded-full bg-current opacity-50 mr-3`}></div>
                    <span>{subItem.label}</span>
                    {!hasPermission(subItem.permission) && (
                      <span className="text-xs text-gray-400 opacity-60 ml-2">•</span>
                    )}
                  </div>
                  {subItem.subItems && (
                    <span className={`transition-transform duration-200 ${
                      isItemExpanded(`${subItem.label}-${level}`) ? 'rotate-90' : ''
                    }`}>
                      <FaChevronRight size={chevronSize} />
                    </span>
                  )}
                </button>
                
                {/* Renderizar subitens recursivamente */}
                {subItem.subItems && isItemExpanded(`${subItem.label}-${level}`) && 
                  renderSubItems(subItem.subItems, level + 1)
                }
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <aside className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } h-screen bg-gradient-to-b from-[#A1C1EA] to-[#0c4c6e] text-white shadow-xl fixed left-0 top-0 z-50 transition-all duration-300 ${
        // Em desktop, sempre visível. Em mobile, esconde quando colapsado
        isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-500/30">
          <div className="flex items-center justify-between">
            
              {
              isCollapsed && 
              (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Menu size={18} />
              </button>
              )
            }
              {!isCollapsed && (
                <Link to="/home" >
                  <img src="./Logo.png" alt="Contabilize Logo" className="h-12 w-[100%]" />
                </Link>
              )}
            
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {!isCollapsed && <X size={18} />}
            </button>
          </div>
        </div>

        {/* Menu de navegação */}
        <nav className={`flex-1 px-2 py-6 custom-scrollbar ${isCollapsed ? '' : 'overflow-x-hidden  overflow-y-auto'}`}>
          <div className="space-y-1">
            {filteredNavigationItems.map((item) => (
              <div key={item.label}>
                {/* Item principal */}
                {item.path ? (
                  // Item com link direto
                  <Link
                    to={item.path}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActivePath(item.path)
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-gray-100 hover:bg-white/10 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className={`transition-colors duration-200 ${
                      isActivePath(item.path) 
                        ? 'text-white' 
                        : 'text-gray-200 group-hover:text-white'
                    }`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                ) : (
                  // Item expansível
                  <div className="relative group">
                    <button
                      onClick={() => !isCollapsed && toggleItemExpansion(item.label)}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        hasActiveSubItem(item.subItems)
                          ? 'bg-white/20 text-white shadow-lg'
                          : hasPermission(item.permission)
                          ? 'text-gray-100 hover:bg-white/10 hover:text-white'
                          : 'text-gray-300 hover:bg-white/5 hover:text-gray-200 opacity-75'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                      <span className={`transition-colors duration-200 ${
                        hasActiveSubItem(item.subItems) 
                          ? 'text-white' 
                          : hasPermission(item.permission)
                          ? 'text-gray-200 group-hover:text-white'
                          : 'text-gray-400 group-hover:text-gray-300'
                      }`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                          <span>{item.label}</span>
                          {!hasPermission(item.permission) && (
                            <span className="text-xs text-gray-400 opacity-60">•</span>
                          )}
                        </div>
                      )}
                    </div>
                    {!isCollapsed && item.subItems && (
                      <span className={`transition-transform duration-200 ${
                        isItemExpanded(item.label) ? 'rotate-90' : ''
                      }`}>
                        <FaChevronRight size={16} />
                      </span>
                    )}
                  </button>

                    {/* Tooltip para sidebar colapsada */}
                    {isCollapsed && item.subItems && item.subItems.length > 0 && (
                      <div className='absolute left-full top-0 text-white scale-0 group-hover:scale-100 hover:scale-100 transition-transform duration-100 origin-left pointer-events-none group-hover:pointer-events-auto hover:pointer-events-auto z-[9999] whitespace-nowrap'>
                        <div className="bg-gray-400 text-white ml-3 px-3 py-2 opacity-90 rounded-lg shadow-xl border border-gray-500 max-h-96 overflow-y-auto custom-scrollbar">
                          <div className="text-sm font-medium mb-2">{item.label}</div>
                          <div className="space-y-1">
                            {item.subItems.map((subItem) => (
                              <div key={subItem.path || subItem.label}>
                                {subItem.path ? (
                                  <Link
                                    to={subItem.path}
                                    className={`block text-xs py-1 px-2 rounded transition-colors ${
                                      isActivePath(subItem.path)
                                        ? 'text-blue-300 bg-blue-700/30'
                                        : 'text-white hover:text-white hover:bg-gray-700'
                                    }`}
                                  >
                                    {subItem.label}
                                  </Link>
                                ) : (
                                  <div className="text-xs py-1 px-2 text-gray-300 font-medium">
                                    {subItem.label}
                                    {subItem.subItems && subItem.subItems.length > 0 && (
                                      <div className="ml-2 mt-1 space-y-1">
                                        {subItem.subItems.map((nestedItem) => (
                                          nestedItem.path && (
                                            <Link
                                              key={nestedItem.path}
                                              to={nestedItem.path}
                                              className={`block text-xs py-1 px-2 rounded transition-colors ${
                                                isActivePath(nestedItem.path)
                                                  ? 'text-blue-300 bg-blue-700/30'
                                                  : 'text-white hover:text-white hover:bg-gray-700'
                                              }`}
                                            >
                                              {nestedItem.label}
                                            </Link>
                                          )
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Subitens */}
                {!isCollapsed && item.subItems && isItemExpanded(item.label) && 
                  renderSubItems(item.subItems)
                }
              </div>
            ))}
          </div>
        </nav>

        {/* Área do usuário */}
        <div className="p-3 border-t border-gray-500/30">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                <div className="text-xs text-gray-200 truncate">
                  {user?.role ? (typeof user.role === 'string' ? user.role : (user.role as { name?: string })?.name || 'Função') : 'Usuário'}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 text-gray-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group`}
            title="Sair do sistema"
          >
            <span className="text-gray-200 group-hover:text-white transition-colors">
              <LogOut size={20} />
            </span>
            {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

// Estilos CSS customizados para scrollbar minimalista
const styles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    transition: background-color 0.2s ease;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: transparent;
  }
`;

// Injetar estilos no documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  if (!document.head.querySelector('style[data-navbar-scroll]')) {
    styleSheet.setAttribute('data-navbar-scroll', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default Navbar;
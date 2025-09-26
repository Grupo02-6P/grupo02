import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // 👈 Importar useAuth
import { LogOut } from 'lucide-react';

interface NavigationItem {
  path: string;
  label: string;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth(); // 👈 Usar contexto de auth
  
  // 👇 Se não estiver logado, não renderizar nada
  if (!isAuthenticated) {
    return null;
  }

  const navigationItems: NavigationItem[] = [
    { path: '/accounting', label: 'Plano de Contas' },
    { path: '/financial', label: 'Lançamentos' },
    { path: '/reports', label: 'Relatórios' },
    { path: '/partners', label: 'Parceiros' },
    { path: '/config', label: 'Configurações' }
  ];

  const isActivePath = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Sistema Contábil
            </h1>
          </Link>

          {/* Menu de navegação */}
          <div className="flex space-x-1">
            {navigationItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActivePath(path)
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Área do usuário */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-white">{user?.name}</div>
                <div className="text-xs text-blue-100">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
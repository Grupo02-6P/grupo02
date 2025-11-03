import React from 'react';
import { Menu } from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';

const MobileHeader: React.FC = () => {
  const { toggleSidebar } = useSidebar();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-[#0c4c6e] text-white hover:bg-[#083f5d] transition-colors focus:outline-none"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
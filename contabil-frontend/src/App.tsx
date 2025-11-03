import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import Navbar from './components/navbar/Navbar';
import MobileHeader from './components/header/MobileHeader';
import AppRoutes from './routes/AppRoutes';
import type { JSX } from 'react';

const AppContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <MobileHeader />
        <div className="">
          <AppRoutes />
        </div>
      </main>
    </div>
  );
};

function App(): JSX.Element {
  return (
    <AuthProvider>
      <PermissionProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
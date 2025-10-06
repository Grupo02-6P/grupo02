import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
import Navbar from './components/navbar/Navbar';
import AppRoutes from './routes/AppRoutes';
import type { JSX } from 'react';

function App(): JSX.Element {
  return (
    <AuthProvider>
      <PermissionProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main>
            <AppRoutes />
          </main>
        </div>
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
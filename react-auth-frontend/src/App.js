import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Login from './components/Auth/Login';
import Tela1 from './pages/Tela1';
import Tela2 from './pages/Tela2';
import Tela3 from './pages/Tela3';
import Suport from './pages/Suport';
import Empresas from './pages/Empresas';
import Profile from './pages/Profile';
import UserManagement from './components/Admin/UserManagement';
import Home from './pages/Home';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          
          {/* Telas protegidas por permissão específica */}
          <Route path="/tela1" element={
            <ProtectedRoute requiredPermission="access_tela1">
              <Tela1 />
            </ProtectedRoute>
          } />
          <Route path="/tela2" element={
            <ProtectedRoute requiredPermission="access_tela2">
              <Tela2 />
            </ProtectedRoute>
          } />
          <Route path="/tela3" element={
            <ProtectedRoute requiredPermission="access_tela3">
              <Tela3 />
            </ProtectedRoute>
          } />
          <Route path="/suport" element={
            <ProtectedRoute requiredPermission="access_suport">
              <Suport />
            </ProtectedRoute>
          } />
          
          {/* Rotas que requerem apenas autenticação */}
          <Route path="/empresas" element={
            <ProtectedRoute>
              <Empresas />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Rota admin */}
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly={true}>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
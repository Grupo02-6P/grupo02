import type { ComponentType } from 'react';

// Páginas públicas
import Login from '../pages/Login';
import Home from '../pages/Home';
import About from '../pages/About';


export interface RouteConfig {
  path: string;
  element: ComponentType;
  label?: string;
  isProtected?: boolean; // 👈 Nova propriedade
}

export const routes: RouteConfig[] = [
  // Rotas públicas
  { 
    path: '/login', 
    element: Login, 
    label: 'Login',
    isProtected: false // 👈 Rota pública
  },
  { 
    path: '/home', 
    element: Home, 
    label: 'Home',
    isProtected: true // 👈 Se quiser que Home seja pública
  },
  { 
    path: '/about', 
    element: About, 
    label: 'About',
    isProtected: true // 👈 Se quiser que About seja pública
  },
];
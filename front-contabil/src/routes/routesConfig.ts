import Home from '../pages/Home'
import About from '../pages/About'
import type { ComponentType } from 'react'

export interface RouteConfig {
  path: string
  element: ComponentType
  label?: string
}

export const routes: RouteConfig[] = [
  { path: '/', element: Home, label: 'Home' },
  { path: '/about', element: About, label: 'About' },
]
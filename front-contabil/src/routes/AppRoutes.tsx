import { Routes, Route } from 'react-router-dom'
import { routes } from './routesConfig'
import type { JSX } from 'react'

function AppRoutes(): JSX.Element {
  return (
    <Routes>
      {routes.map(({ path, element: Element }) => (
        <Route key={path} path={path} element={<Element />} />
      ))}
    </Routes>
  )
}

export default AppRoutes
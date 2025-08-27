import { Link, useLocation } from 'react-router-dom'

interface NavigationItem {
  path: string;
  label: string;
}

const Navbar: React.FC = () => {
  const location = useLocation()
  
  const navigationItems: NavigationItem[] = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' }
  ]

  const isActivePath = (path: string): boolean => {
    return location.pathname === path
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Meu App
          </h1>
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
        </div>
      </div>
    </nav>
  )
}

export default Navbar
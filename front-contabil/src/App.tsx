import Navbar from './components/Navbar'
import AppRoutes from './routes/AppRoutes'
import type { JSX } from 'react'

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main>
        <AppRoutes />
      </main>
    </div>
  )
}

export default App
import React from 'react'

interface FeatureCard {
  title: string;
  icon: string;
  description: string;
}

const Home: React.FC = () => {
  const features: FeatureCard[] = [
    {
      title: 'Vite',
      icon: '🚀',
      description: 'Build tool extremamente rápido com Hot Module Replacement'
    },
    {
      title: 'Tailwind v3',
      icon: '🎨',
      description: 'Utility-first CSS com JIT compiler e novas funcionalidades'
    },
    {
      title: 'TypeScript',
      icon: '📘',
      description: 'Type safety e melhor experiência de desenvolvimento'
    },
    {
      title: 'React Router',
      icon: '🧭',
      description: 'Navegação declarativa para aplicações React'
    }
  ]

  const handleButtonClick = (): void => {
    console.log('Botão clicado!')
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-balance">
          Bem-vindo ao seu projeto React + Vite + Tailwind v3 + TypeScript
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map(({ title, icon, description }) => (
            <div key={title} className="card">
              <h2 className="text-xl mb-3">
                {icon} {title}
              </h2>
              <p className="text-gray-600">{description}</p>
            </div>
          ))}
        </div>
        
        <button 
          className="btn-primary" 
          onClick={handleButtonClick}
          type="button"
        >
          Botão de exemplo
        </button>
      </div>
    </div>
  )
}

export default Home
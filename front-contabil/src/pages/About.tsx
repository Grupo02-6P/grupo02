import React from 'react'

const About: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Sobre</h1>
        <div className="card">
          <p className="text-gray-600 mb-4">
            Esta é a página sobre do seu projeto desenvolvido com:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>React 18</strong> - Biblioteca para interfaces de usuário</li>
            <li><strong>TypeScript</strong> - Superset tipado do JavaScript</li>
            <li><strong>Vite</strong> - Build tool rápido e moderno</li>
            <li><strong>Tailwind CSS v3</strong> - Framework CSS utility-first</li>
            <li><strong>React Router</strong> - Roteamento para aplicações React</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default About
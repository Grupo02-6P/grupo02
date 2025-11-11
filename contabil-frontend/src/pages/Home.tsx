import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight, FaUsers, FaHandshake } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import { ArrowLeftRight, Receipt } from 'lucide-react';
import { MdOutlineAccountBalanceWallet, MdAccountBalance } from "react-icons/md";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasResourcePermission } = usePermissions();

  const atalhos = [
    {
      title: 'Visualizar Usuários',
      description: 'Gerenciar usuários e permissões',
      icon: <FaUsers size={24} />,
      href: '/usuarios/visualizar',
      borderColor: 'border-red-400',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      permission: { resource: 'User', action: 'read' }
    },
    {
      title: 'Gerenciar Contas',
      description: 'Gerenciar contas contábeis',
      icon: <MdAccountBalance size={24} />,
      href: '/contas/gerenciar',
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      permission: { resource: 'Account', action: 'read' }
    },
    {
      title: 'Visualizar Parceiros',
      description: 'Gerenciar parceiros de negócios',
      icon: <FaHandshake size={24} />,
      href: '/parceiros/visualizar',
      borderColor: 'border-green-400',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      permission: { resource: 'Partner', action: 'read' }
    },
    {
      title: 'Visualizar Tipos de Movimento',
      description: 'Gerenciar tipos de movimento',
      icon: <ArrowLeftRight size={24} />,
      href: '/tipo-movimento/visualizar',
      borderColor: 'border-purple-400',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      permission: { resource: 'TypeMovement', action: 'read' }
    },
    {
      title: 'Visualizar Tipos de Entrada',
      description: 'Gerenciar tipos de entrada',
      icon: <MdOutlineAccountBalanceWallet size={24} />,
      href: '/tipo-entrada/visualizar',
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      permission: { resource: 'TypeEntry', action: 'read' }
    },
    {
      title: 'Visualizar Lançamentos',
      description: 'Gerenciar lançamentos financeiros',
      icon: <Receipt size={24} />,
      href: '/lancamentos/visualizar',
      borderColor: 'border-orange-400',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      permission: { resource: 'Entry', action: 'read' }
    },
  ]

  const handleCardClick = (href: string): void => {
    navigate(href);
  }

  // Filtrar atalhos baseado nas permissões do usuário
  const filteredAtalhos = atalhos.filter(atalho => 
    hasResourcePermission(atalho.permission.resource, atalho.permission.action)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5]">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Bem-vindo ao Contabilize
              </h1>
              <p className="text-l text-gray-600">
                Olá, <span className="font-semibold text-[#0c4c6e]">{user?.name}</span>! 
              </p>
            </div>
            <img src="./Logo.png" alt="" />
          </div>
        </div>

        {/* Main Actions */}
        <div className="mb-12">
          {filteredAtalhos.length > 0 ? (
            <div className={`grid grid-cols-1 gap-4 ${
              filteredAtalhos.length === 1 ? 'md:grid-cols-1 max-w-lg mx-auto' :
              filteredAtalhos.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
              filteredAtalhos.length <= 4 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
              filteredAtalhos.length <= 6 ? 'md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto' :
              'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {filteredAtalhos.map((atalho) => (
                <div
                  key={atalho.title}
                  onClick={() => handleCardClick(atalho.href)}
                  className={`bg-white border-l-4 ${atalho.borderColor} rounded-lg shadow-md hover:shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-102 group border-gray-100`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${atalho.bgColor} ${atalho.textColor}`}>
                      {atalho.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-gray-900">{atalho.title}</h3>
                      <p className="text-gray-600 text-sm">{atalho.description}</p>
                    </div>
                    <FaArrowRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" size={16} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                Nenhuma funcionalidade disponível
              </h3>
              <p className="text-gray-500">
                Você não possui permissões para acessar as funcionalidades principais.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
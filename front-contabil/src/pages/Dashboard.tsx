import React, { useState } from "react";
import { Sidebar } from "../components/sidebar/Sidebar";
import type { SidebarSection } from "../types/Sidebar";

const Dashboard: React.FC = () => {
  const [selected, setSelected] = useState("overview");

  const dashboardSections: SidebarSection[] = [
    { key: "overview", label: "Visão Geral" },
    { key: "reports", label: "Relatórios" },
    { key: "analytics", label: "Analytics" },
    { key: "users", label: "Usuários" },
    { key: "settings", label: "Configurações", disabled: true },
  ];

  const renderContent = () => {
    switch (selected) {
      case "overview":
        return (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Visão Geral</h2>
            <p className="text-gray-600">Dashboard principal do sistema...</p>
          </div>
        );
      case "reports":
        return (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Relatórios</h2>
            <p className="text-gray-600">Seção de relatórios...</p>
          </div>
        );
      case "analytics":
        return (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analytics</h2>
            <p className="text-gray-600">Análise de dados...</p>
          </div>
        );
      case "users":
        return (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Usuários</h2>
            <p className="text-gray-600">Gerenciamento de usuários...</p>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Selecione uma opção</h2>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar
        title="Menu Principal"
        description="Navegue pelo sistema"
        sections={dashboardSections}
        selected={selected}
        onSelect={setSelected}
        width="sm"
      />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Bem-vindo ao painel de controle</p>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;


import React, { useState } from "react";
import { Sidebar } from "../components/sidebar/Sidebar";
import EmpresaConfig from "../components/config/EmpresaConfig";
import type { SidebarSection } from "../types/Sidebar";

const Config: React.FC = () => {
	const [selected, setSelected] = useState("empresa");

	const configSections: SidebarSection[] = [
		{ key: "empresa", label: "Configuração de Empresa" },
		{ key: "usuarios", label: "Usuários" },
		{ key: "permissionamento", label: "Permissionamento" },
	];

	const renderSelectedContent = () => {
		switch (selected) {
			case "empresa":
				return <EmpresaConfig />;
			case "usuarios":
				return (
					<div className="bg-white rounded-lg shadow-sm p-8">
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">Usuários</h2>
						<p className="text-gray-600">Configuração de usuários em desenvolvimento...</p>
					</div>
				);
			case "permissionamento":
				return (
					<div className="bg-white rounded-lg shadow-sm p-8">
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">Permissionamento</h2>
						<p className="text-gray-600">Configuração de permissões em desenvolvimento...</p>
					</div>
				);
			default:
				return <EmpresaConfig />;
		}
	};

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<Sidebar 
				title="Menu de Configurações"
				description="Selecione uma opção"
				sections={configSections}
				selected={selected} 
				onSelect={setSelected} 
			/>
			<main className="flex-1 p-6 lg:p-8">
				<div className="max-w-6xl mx-auto">
					<div className="mb-6">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
						<p className="text-gray-600">Gerencie as configurações do seu sistema</p>
					</div>
					{renderSelectedContent()}
				</div>
			</main>
		</div>
	);
};

export default Config;

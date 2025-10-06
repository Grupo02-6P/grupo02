import React, { useState } from "react";
import Input from "../input/Input";
import Button from "../button/Button";
import { ConfirmModal } from "../modal/ConfirmModal";
import { useRoutePermissions } from "../../context/PermissionContext";
import type { Empresa, EmpresaFormData } from "../../types/Empresa";

const EmpresaConfig: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);
  
  // Obter permissões para a rota /config
  const { canView, canEdit, canCreate, canDelete } = useRoutePermissions('/config');
  const [form, setForm] = useState<EmpresaFormData>({
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
    site: ""
  });

  // Mock data - substitua por dados reais da API
  const [empresas, setEmpresas] = useState<Empresa[]>([
    {
      id: "1",
      nome: "Empresa Exemplo LTDA",
      cnpj: "12.345.678/0001-90",
      endereco: "Rua das Flores, 123",
      telefone: "(11) 99999-9999",
      email: "contato@empresa.com",
      site: "https://www.empresa.com",
      dataCriacao: new Date('2023-01-15'),
      ativa: true
    },
    {
      id: "2",
      nome: "Outra Empresa S.A.",
      cnpj: "98.765.432/0001-10",
      endereco: "Av. Principal, 456",
      telefone: "(11) 88888-8888",
      email: "info@outraempresa.com",
      site: "https://www.outraempresa.com",
      dataCriacao: new Date('2023-03-20'),
      ativa: true
    }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmpresa) {
      // Editar empresa existente
      setEmpresas(empresas.map(emp => 
        emp.id === editingEmpresa.id 
          ? { ...emp, ...form }
          : emp
      ));
    } else {
      // Criar nova empresa
      const novaEmpresa: Empresa = {
        id: Date.now().toString(),
        ...form,
        dataCriacao: new Date(),
        ativa: true
      };
      setEmpresas([...empresas, novaEmpresa]);
    }

    // Reset form
    setForm({
      nome: "",
      cnpj: "",
      endereco: "",
      telefone: "",
      email: "",
      site: ""
    });
    setEditingEmpresa(null);
    setView('list');
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setForm({
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      endereco: empresa.endereco,
      telefone: empresa.telefone,
      email: empresa.email,
      site: empresa.site
    });
    setView('form');
  };

  const handleDelete = (empresa: Empresa) => {
    setEmpresaToDelete(empresa);
  };

  const confirmDelete = () => {
    if (empresaToDelete) {
      setEmpresas(empresas.filter(emp => emp.id !== empresaToDelete.id));
      setEmpresaToDelete(null);
    }
  };

  const cancelDelete = () => {
    setEmpresaToDelete(null);
  };

  const handleNewEmpresa = () => {
    setEditingEmpresa(null);
    setForm({
      nome: "",
      cnpj: "",
      endereco: "",
      telefone: "",
      email: "",
      site: ""
    });
    setView('form');
  };

  const handleCancel = () => {
    setEditingEmpresa(null);
    setForm({
      nome: "",
      cnpj: "",
      endereco: "",
      telefone: "",
      email: "",
      site: ""
    });
    setView('list');
  };

  if (view === 'form') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-8 py-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <p className="text-gray-600 mt-1">
            {editingEmpresa ? 'Altere os dados da empresa' : 'Cadastre uma nova empresa'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <Input
                label="Nome da Empresa"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Digite o nome da empresa"
                required
              />
            </div>
            
            <div>
              <Input
                label="CNPJ"
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>
            
            <div>
              <Input
                label="Telefone"
                name="telefone"
                type="tel"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="lg:col-span-2">
              <Input
                label="Endereço"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                placeholder="Digite o endereço completo"
                required
              />
            </div>
            
            <div>
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contato@empresa.com"
              />
            </div>
            
            <div>
              <Input
                label="Site"
                name="site"
                type="url"
                value={form.site}
                onChange={handleChange}
                placeholder="https://www.empresa.com"
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button type="submit" className="px-8 py-2">
              {editingEmpresa ? 'Atualizar' : 'Salvar'} Empresa
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-8 py-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Empresas Cadastradas</h2>
          <p className="text-gray-600 mt-1">Gerencie as empresas do sistema</p>
        </div>
        {canCreate && (
          <Button onClick={handleNewEmpresa} className="px-6 py-2">
            + Nova Empresa
          </Button>
        )}
      </div>
      
      <div className="p-8">
        {empresas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Nenhuma empresa cadastrada</p>
{canCreate && (
              <Button onClick={handleNewEmpresa} className="px-6 py-2">
                Cadastrar Primeira Empresa
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">CNPJ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => (
                  <tr key={empresa.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{empresa.nome}</p>
                        <p className="text-sm text-gray-500">{empresa.endereco}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{empresa.cnpj}</td>
                    <td className="py-4 px-4 text-gray-700">{empresa.email}</td>
                    <td className="py-4 px-4 text-gray-700">{empresa.telefone}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        empresa.ativa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {empresa.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(empresa)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded hover:bg-blue-50"
                          >
                            Editar
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(empresa)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-gray-400 text-sm">Sem permissões</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={empresaToDelete !== null}
        title="Excluir Empresa"
        message={`Tem certeza que deseja excluir a empresa "${empresaToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />
    </div>
  );
};

export default EmpresaConfig;

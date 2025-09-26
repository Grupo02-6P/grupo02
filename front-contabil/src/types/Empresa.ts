export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  site: string;
  dataCriacao: Date;
  ativa: boolean;
}

export interface EmpresaFormData {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  site: string;
}

'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import Button from '@/components/button/Button';
import { useDebounce } from '@/hooks/useDebounce';

import {
  generateReport,
  type CreateReportDto,
} from '@/services/apiReport';
import { type Account, getAccounts } from '@/services/apiAccount';

export default function ReportsPage() {
  const [reportType, setReportType] =
    useState<CreateReportDto['type']>('TRIAL_BALANCE');
  const [format, setFormat] = useState<CreateReportDto['format']>('PDF');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAccounts, setShowAccounts] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchAccounts(debouncedSearchTerm);
    } else {
      setAccounts([]);
      setShowAccounts(false);
    }
  }, [debouncedSearchTerm]);

  const fetchAccounts = async (search: string) => {
    try {
      const response = await getAccounts({ name: search, page: 1, perPage: 10 });
      setAccounts(response.data);
      setShowAccounts(true);
    } catch (err) {
      console.error(err);
      setError('Falha ao buscar contas.');
    }
  };

  const handleAccountSelect = (account: Account) => {
    setAccountId(account.id);
    setSearchTerm(account.name);
    setShowAccounts(false);
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError('As datas de início e fim são obrigatórias.');
      return;
    }
    if (reportType === 'LEDGER' && !accountId) {
      setError('O ID da conta é obrigatório para o relatório Livro Razão.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const dto: CreateReportDto = {
      type: reportType,
      format,
      startDate,
      endDate,
    };

    if (reportType === 'LEDGER') {
      dto.accountId = accountId;
    }

    try {
      const blobResponse = await generateReport(dto);
      const url = window.URL.createObjectURL(new Blob([blobResponse]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio.${dto.format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();

      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar o relatório. Verifique o console para detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Geração de Relatórios</h1>

      <div className="space-y-6 max-w-lg bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erro: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-800 mb-1">
            Tipo de Relatório
          </label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setReportType(e.target.value as CreateReportDto['type'])
            }
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="TRIAL_BALANCE">Balancete de Verificação</option>
            <option value="DRE">Demonstração do Resultado (DRE)</option>
            <option value="BALANCO">Balanço Patrimonial</option>
            <option value="LEDGER">Livro Razão</option>
          </select>
        </div>

        {reportType === 'LEDGER' && (
          <div className="relative">
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-800 mb-1">
              Conta (para Livro Razão)
            </label>
            <input
              id="accountId"
              type="text"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm && setShowAccounts(true)}
              placeholder="Pesquisar conta por nome"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {showAccounts && accounts.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
                {accounts.map(account => (
                  <li
                    key={account.id}
                    onClick={() => handleAccountSelect(account)}
                    className="p-3 hover:bg-gray-100 cursor-pointer"
                  >
                    {account.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-800 mb-1">
            Formato de Saída
          </label>
          <select
            id="format"
            value={format}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setFormat(e.target.value as CreateReportDto['format'])
            }
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="PDF">PDF</option>
            <option value="CSV">CSV</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Período</label>
          <div className="flex items-center space-x-4 mt-1">
            <input
              type="date"
              value={startDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              placeholder="Data de Início"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              placeholder="Data de Fim"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleGenerateReport} disabled={isLoading} className="w-full">
            {isLoading ? 'Gerando Relatório...' : 'Gerar Relatório'}
          </Button>
        </div>
      </div>
    </div>
  );
}

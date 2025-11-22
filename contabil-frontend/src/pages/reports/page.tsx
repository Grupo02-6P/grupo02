'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#0c4c6e] px-8 py-6">
            <div className="flex items-center space-x-4">
              <FileText size={44} className="text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Geração de Relatórios</h1>
                <p className="text-white mt-1">Gere relatórios contábeis personalizados</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Erro: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="reportType" className="text-sm font-medium text-gray-700">
                    Tipo de Relatório:
                  </label>
                  <select
                    id="reportType"
                    value={reportType}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setReportType(e.target.value as CreateReportDto['type'])
                    }
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e] focus:border-[#0c4c6e]"
                  >
                    <option value="TRIAL_BALANCE">Balancete de Verificação</option>
                    <option value="DRE">Demonstração do Resultado (DRE)</option>
                    <option value="BALANCO">Balanço Patrimonial</option>
                    <option value="LEDGER">Livro Razão</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="format" className="text-sm font-medium text-gray-700">
                    Formato de Saída:
                  </label>
                  <select
                    id="format"
                    value={format}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setFormat(e.target.value as CreateReportDto['format'])
                    }
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e] focus:border-[#0c4c6e]"
                  >
                    <option value="PDF">PDF</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
              </div>

              {reportType === 'LEDGER' && (
                <div className="relative">
                  <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
                    Conta (para Livro Razão):
                  </label>
                  <input
                    id="accountId"
                    type="text"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm && setShowAccounts(true)}
                    placeholder="Pesquisar conta por nome"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c4c6e] focus:border-[#0c4c6e]"
                  />
                  {showAccounts && accounts.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                      {accounts.map(account => (
                        <li
                          key={account.id}
                          onClick={() => handleAccountSelect(account)}
                          className="p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          {account.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Período:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="startDate" className="text-xs font-medium text-gray-600">
                      Data de Início:
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c4c6e] focus:border-[#0c4c6e]"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="endDate" className="text-xs font-medium text-gray-600">
                      Data de Fim:
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c4c6e] focus:border-[#0c4c6e]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Informações sobre os Relatórios</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Balancete de Verificação:</strong> Lista todas as contas com seus saldos em um período específico</li>
                <li>• <strong>DRE:</strong> Demonstração do Resultado do Exercício mostra receitas, despesas e lucro/prejuízo</li>
                <li>• <strong>Balanço Patrimonial:</strong> Apresenta a situação patrimonial da empresa em uma data específica</li>
                <li>• <strong>Livro Razão:</strong> Histórico detalhado de movimentações de uma conta específica</li>
              </ul>
            </div>

            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
              >
                <Download size={20} />
                <span>{isLoading ? 'Gerando Relatório...' : 'Gerar Relatório'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

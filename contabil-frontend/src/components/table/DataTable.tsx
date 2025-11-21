import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, Filter } from 'lucide-react';
import { LoadingSpinner } from '../loading/LoadingSpinner';

// Tipos genéricos
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  fetchData: (params: FetchDataParams) => Promise<FetchDataResponse<TData>>;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  pageSize?: number;
  enableFilters?: boolean;
  filterInputs?: React.ReactNode;
  externalFilters?: Record<string, any>; // Adicionar filtros externos
  searchFields?: string[]; // Campos que devem ter debounce (campos de texto digitados)
}

interface FetchDataParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any; // Permite filtros customizados
}

interface FetchDataResponse<TData> {
  data: TData[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export function DataTable<TData>({
  columns,
  fetchData,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
  emptyDescription = 'Tente ajustar os filtros de busca',
  pageSize = 10,
  enableFilters = true,
  filterInputs,
  externalFilters = {},
  searchFields = [],
}: DataTableProps<TData>) {
  const [data, setData] = useState<TData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false); // Loading separado para busca
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Estados para controle de debounce
  const [debouncedExternalFilters, setDebouncedExternalFilters] = useState(externalFilters);
  const [hasSearchFilter, setHasSearchFilter] = useState(false);

  // Debounce para filtros de busca (campos de texto)
  useEffect(() => {
    // Verificar se algum dos campos de busca mudou
    const hasSearchFieldChange = searchFields.some(field => 
      externalFilters[field] !== debouncedExternalFilters[field]
    );
    
    setHasSearchFilter(hasSearchFieldChange);
    
    if (hasSearchFieldChange) {
      const timeoutId = setTimeout(() => {
        console.log('🔍 Aplicando debounce para filtros de busca:', searchFields);
        setDebouncedExternalFilters(externalFilters);
      }, 300); // Debounce de 300ms
      
      return () => clearTimeout(timeoutId);
    } else {
      // Para filtros não-text (selects, etc.), aplicar imediatamente
      setDebouncedExternalFilters(externalFilters);
    }
  }, [externalFilters, searchFields]);

  // Buscar dados quando pagination, sorting, filtros de coluna ou filtros externos (com debounce) mudarem
  useEffect(() => {
    loadData();
  }, [pagination.pageIndex, pagination.pageSize, sorting, columnFilters, debouncedExternalFilters]);

  // Reset pagination quando filtros externos mudam (imediato para não perder filtros)
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [debouncedExternalFilters]);

  const loadData = async () => {
    // Determinar se é uma busca ou carregamento inicial
    const isSearchLoad = hasSearchFilter;
    
    if (isSearchLoad) {
      setLoadingSearch(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    try {
      // Construir parâmetros
      const params: FetchDataParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...debouncedExternalFilters, // Usar filtros com debounce aplicado
      };

      // Adicionar ordenação
      if (sorting.length > 0) {
        params.sortBy = sorting[0].id;
        params.sortOrder = sorting[0].desc ? 'desc' : 'asc';
      }

      // Adicionar filtros da tabela
      columnFilters.forEach(filter => {
        params[filter.id] = filter.value;
      });

      const response = await fetchData(params);
      setData(response.data);
      setTotalRows(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.response.data.message || 'Erro ao carregar dados');
      setData([]);
    } finally {
      setLoading(false);
      setLoadingSearch(false);
    }
  };

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      sorting,
      pagination,
      columnFilters,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    sortDescFirst: false,
  });

  // Gerar números de página para exibição
  const getPageNumbers = () => {
    const maxVisible = 5;
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const current = pagination.pageIndex + 1;
    
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (current >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
    }
    
    return pages;
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-xl">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros customizados */}
      {enableFilters && filterInputs && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#0c4c6e]" />
            <p className="text-gray-800 text-lg font-semibold">Filtros</p>
            {loadingSearch && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span>Buscando...</span>
              </div>
            )}
          </div>
          {filterInputs}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {data.length === 0 && !loading ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{emptyMessage}</h3>
            <p className="text-gray-600">{emptyDescription}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#eaf4fb]">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700"
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={
                                header.column.getCanSort()
                                  ? 'flex items-center gap-2 cursor-pointer select-none hover:text-gray-900'
                                  : ''
                              }
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() && (
                                <span className="text-gray-400">
                                  {header.column.getIsSorted() === 'asc' ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : header.column.getIsSorted() === 'desc' ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronsUpDown className="w-4 h-4" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Carregando...
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <tr
                        key={row.id}
                        className={`border-b transition-colors ${
                          onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                        }`}
                        onClick={() => onRowClick?.(row.original)}
                      >
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className="px-4 py-3 text-sm text-gray-800"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>
                    Mostrando{' '}
                    <span className="font-medium">
                      {pagination.pageIndex * pagination.pageSize + 1}
                    </span>{' '}
                    até{' '}
                    <span className="font-medium">
                      {Math.min(
                        (pagination.pageIndex + 1) * pagination.pageSize,
                        totalRows
                      )}
                    </span>{' '}
                    de <span className="font-medium">{totalRows}</span> resultados
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1 rounded-lg font-medium border transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed bg-white text-gray-700 border-gray-300 hover:bg-[#e6f1f7]"
                  >
                    Primeira
                  </button>

                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1 rounded-lg font-medium border transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed bg-white text-gray-700 border-gray-300 hover:bg-[#e6f1f7]"
                  >
                    Anterior
                  </button>

                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => table.setPageIndex(Number(page) - 1)}
                        className={`px-3 py-1 rounded-lg font-medium border transition-all ${
                          Number(page) === pagination.pageIndex + 1
                            ? 'bg-[#0c4c6e] text-white border-[#0c4c6e]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-[#e6f1f7]'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1 rounded-lg font-medium border transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed bg-white text-gray-700 border-gray-300 hover:bg-[#e6f1f7]"
                  >
                    Próxima
                  </button>

                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1 rounded-lg font-medium border transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed bg-white text-gray-700 border-gray-300 hover:bg-[#e6f1f7]"
                  >
                    Última
                  </button>

                  <select
                    value={pagination.pageSize}
                    onChange={e => table.setPageSize(Number(e.target.value))}
                    className="ml-2 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c4c6e]"
                  >
                    {[10, 20, 30, 50, 100].map(size => (
                      <option key={size} value={size}>
                        {size} por página
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
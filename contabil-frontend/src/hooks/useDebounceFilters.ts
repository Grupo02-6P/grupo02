import { useState, useCallback, useMemo } from 'react';

/**
 * Hook para gerenciar filtros com debounce para campos de texto
 * Evita perda de foco durante a digitação em campos de busca
 */
export function useDebounceFilters<T extends Record<string, any>>(
  initialFilters: T,
  textFields: (keyof T)[] = []
) {
  const [filters, setFilters] = useState<T>(initialFilters);

  // Função para atualizar filtros
  const handleFilterChange = useCallback((field: keyof T, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  // Função para resetar filtros
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Memoizar campos de texto para o DataTable
  const searchFields = useMemo(() => 
    textFields.map(field => String(field)), 
    [textFields]
  );

  // Função helper para criar inputs com onChange padronizado
  const createTextInput = useCallback((
    field: keyof T,
    placeholder: string,
    className: string = "border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#148553]"
  ) => ({
    type: "text" as const,
    placeholder,
    value: filters[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(field, e.target.value),
    className,
  }), [filters, handleFilterChange]);

  const createSelectInput = useCallback((
    field: keyof T,
    options: Array<{value: string; label: string}>,
    className: string = "border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#148553]"
  ) => ({
    value: filters[field] || '',
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange(field, e.target.value),
    className,
    children: options.map(opt => ({ key: opt.value, value: opt.value, children: opt.label }))
  }), [filters, handleFilterChange]);

  return {
    filters,
    setFilters,
    handleFilterChange,
    resetFilters,
    searchFields,
    createTextInput,
    createSelectInput,
  };
}
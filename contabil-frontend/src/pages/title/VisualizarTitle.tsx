import React, { useState } from 'react';
import { Plus, CheckCircle, Undo2, X } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { titleService } from '../../services/title';
import type { TitleResponse } from '../../types/Title';
import { DataTable } from '../../components/table/DataTable';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import { InfoModal } from '../../components/modal/InfoModal';
import { ActionsColumn, useDefaultActions } from '../../components/table/ActionsColumn';
import { useResourcePermissions } from '../../context/PermissionContext';
import { useDebounceFilters } from '../../hooks/useDebounceFilters';
import { PageHeader } from '../../components/layout/PageHeader';
import { DetailsModal } from '../../components/modal/DetailsModal';
import { DetailSection } from '../../components/details/DetailSection';
import { DetailField } from '../../components/details/DetailField';
import { useDetailsModal } from '../../hooks/useDetailsModal';
import { FaFileInvoiceDollar } from 'react-icons/fa6';

const VisualizarTitle: React.FC = () => {
  const { createViewAction, createEditAction, createDeleteAction } = useDefaultActions();
  const titlePermissions = useResourcePermissions('Title');

  const navigate = useNavigate();
  const {
    filters,
    handleFilterChange,
    searchFields,
    createTextInput
  } = useDebounceFilters(
    {
      search: '',
      status: '',
    },
    ['search']
  );

  const [selectedTitleId, setSelectedTitleId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [reverseModal, setReverseModal] = useState({
    isOpen: false,
    justification: '',
  });
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: undefined as 'success' | 'error' | undefined,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const detailsModal = useDetailsModal<TitleResponse>();

  // Colunas da tabela
  const columns: ColumnDef<TitleResponse>[] = [
    {
      accessorKey: 'code',
      header: 'Código',
      enableSorting: true,
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      enableSorting: true,
      cell: ({ row }) => row.original.description || '-',
    },
    {
      accessorKey: 'date',
      header: 'Data',
      enableSorting: true,
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: 'value',
      header: 'Valor',
      enableSorting: true,
      cell: ({ row }) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.original.value),
    },
    {
      accessorKey: 'movement.name',
      header: 'Tipo de Movimento',
      enableSorting: false,
      cell: ({ row }) => row.original.movement?.name || '-',
    },
    {
      accessorKey: 'typeEntry.name',
      header: 'Tipo de Entrada',
      enableSorting: false,
      cell: ({ row }) => row.original.typeEntry?.name || '-',
    },
    {
      accessorKey: 'partner.name',
      header: 'Parceiro',
      enableSorting: false,
      cell: ({ row }) => row.original.partner?.name || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => {
        let status, color;
        switch (row.original.status) {
          case 'ACTIVE':
            status = 'Ativo';
            color = 'bg-blue-100 text-blue-800';
            break;
          case 'INACTIVE':
            status = 'Inativo';
            color = 'bg-red-100 text-red-800';
            break;
          case 'PAID':
            status = 'Pago';
            color = 'bg-green-100 text-green-800';
            break;
          default:
            status = 'Desconhecido';
            color = 'bg-gray-100 text-gray-800';
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>
        );
      },
    },
    {
      accessorKey: 'paidAt',
      header: 'Data de Pagamento',
      enableSorting: true,
      cell: ({ row }) => {
        if (row.original.status === 'PAID' && row.original.paidAt) {
          const paidDate = new Date(row.original.paidAt);
          return paidDate.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
        return '-';
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const actions = [
          createViewAction(() => handleViewDetails(row.original.id)),
          createEditAction(() => handleEditClick(row.original.id), titlePermissions.canUpdate && row.original.status !== 'PAID'),
          createDeleteAction(
            () => handleInactivateClick(row.original.id),
            titlePermissions.canDelete,
            row.original.status !== 'INACTIVE' && row.original.status !== 'PAID'
          ),
        ];

        // Adicionar ação de pagamento para títulos ativos
        if (titlePermissions.canUpdate && row.original.status === 'ACTIVE') {
          actions.push({
            type: 'custom',
            icon: <CheckCircle className="w-5 h-5 text-green-700" />,
            title: 'Realizar baixa',
            onClick: () => handlePayClick(row.original.id),
            className: 'p-2 rounded hover:bg-green-100 transition-colors',
          });
        }

        // Adicionar ação de estorno para títulos pagos há menos de 7 dias
        if (titlePermissions.canUpdate && row.original.status === 'PAID' && canReverse(row.original.paidAt)) {
          actions.push({
            type: 'custom',
            icon: <Undo2 className="w-5 h-5 text-orange-700" />,
            title: 'Estornar pagamento',
            onClick: () => handleReverseClick(row.original.id),
            className: 'p-2 rounded hover:bg-orange-100 transition-colors',
          });
        }

        return <ActionsColumn actions={actions} />;
      },
    },
  ];

  // Verificar se o título pode ser estornado (pago há menos de 7 dias)
  const canReverse = (paidAt: string | null | undefined): boolean => {
    if (!paidAt) return false;
    
    const paidDate = new Date(paidAt);
    const currentDate = new Date();
    const diffInDays = Math.floor((currentDate.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffInDays <= 7;
  };

  // Buscar títulos (integração com API)
  const fetchTitles = async (params: Record<string, string | number | undefined>) => {
    const response = await titleService.findAll(params);

    return {
      data: response.data,
      pagination: response.pagination,
    };
  };

  // Handlers
  const handleViewDetails = async (id: string) => {
    detailsModal.openModal();

    try {
      const response = await titleService.findOne(id);
      detailsModal.setData(response);
    } catch {
      detailsModal.setError();
      setInfoModal({ isOpen: true, title: 'Erro!', message: 'Erro ao carregar detalhes do título', type: 'error' });
    }
  };

  const handleEditClick = (id: string) => {
    navigate(`/titulo/editar/${id}`);
  };

  const handleInactivateClick = (id: string) => {
    setSelectedTitleId(id);
    setConfirmModal(true);
  };

  const handlePayClick = (id: string) => {
    setSelectedTitleId(id);
    setPayModal(true);
  };

  const handleReverseClick = (id: string) => {
    setSelectedTitleId(id);
    setReverseModal({ isOpen: true, justification: '' });
  };

  const handleInactivateConfirm = async () => {
    if (!selectedTitleId) return;
    try {
      await titleService.inactive(selectedTitleId);
      setConfirmModal(false);
      setSelectedTitleId(null);
      setRefreshKey(prev => prev + 1);
      setInfoModal({ isOpen: true, title: 'Sucesso!', message: 'Título inativado com sucesso!', type: 'success' });
    } catch (err: unknown) {
      setConfirmModal(false);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao inativar título'
        : 'Erro ao inativar título';
      setInfoModal({ isOpen: true, title: 'Erro!', message: errorMessage, type: 'error' });
    }
  };

  const handlePayConfirm = async () => {
    if (!selectedTitleId) return;
    try {
      await titleService.pay(selectedTitleId);
      setPayModal(false);
      setSelectedTitleId(null);
      setRefreshKey(prev => prev + 1);
      setInfoModal({ isOpen: true, title: 'Sucesso!', message: 'Baixa do título realizada com sucesso!', type: 'success' });
    } catch (err: unknown) {
      setPayModal(false);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao dar baixa no título'
        : 'Erro ao dar baixa no título';
      setInfoModal({ isOpen: true, title: 'Erro!', message: errorMessage, type: 'error' });
    }
  };

  const handleReverseConfirm = async () => {
    if (!selectedTitleId || !reverseModal.justification.trim()) {
      setInfoModal({ isOpen: true, title: 'Erro!', message: 'A justificativa do estorno é obrigatória!', type: 'error' });
      return;
    }
    if (reverseModal.justification.trim().length < 5) {
      setInfoModal({ isOpen: true, title: 'Erro!', message: 'A justificativa deve ter pelo menos 5 caracteres!', type: 'error' });
      return;
    }
    try {
      await titleService.reverse(selectedTitleId, reverseModal.justification.trim());
      setReverseModal({ isOpen: false, justification: '' });
      setSelectedTitleId(null);
      setRefreshKey(prev => prev + 1);
      setInfoModal({ isOpen: true, title: 'Sucesso!', message: 'Estorno do pagamento realizado com sucesso!', type: 'success' });
    } catch (err: unknown) {
      setReverseModal({ isOpen: false, justification: '' });
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao estornar o pagamento'
        : 'Erro ao estornar o pagamento';
      setInfoModal({ isOpen: true, title: 'Erro!', message: errorMessage, type: 'error' });
    }
  };

  // Inputs de filtro customizados
  const FilterInputs = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input {...createTextInput('search', 'Buscar por código ou descrição...')} />
      <select
        value={filters.status}
        onChange={e => handleFilterChange('status', e.target.value)}
        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#0c4c6e]"
      >
        <option value="">Todos os status</option>
        <option value="ACTIVE">Ativo</option>
        <option value="INACTIVE">Inativo</option>
        <option value="PAID">Baixado</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          icon={<FaFileInvoiceDollar size={44} className="text-[#0c4c6e] mr-3" />}
          title="Lançamentos de Título"
          description="Gerencie todos os lançamentos de título do sistema"
          actionButton={{
            label: 'Novo Lançamento de Título',
            onClick: () => navigate('/titulo/cadastrar'),
            icon: <Plus size={20} />,
            show: titlePermissions.canCreate,
          }}
        />

        {/* Tabela com DataTable */}
        <DataTable
          key={refreshKey}
          columns={columns}
          fetchData={fetchTitles}
          emptyMessage="Nenhum título encontrado"
          emptyDescription="Tente ajustar os filtros de busca ou cadastre um novo lançamento de título"
          pageSize={10}
          enableFilters={true}
          filterInputs={FilterInputs}
          externalFilters={filters}
          searchFields={searchFields}
        />
      </div>

      <ConfirmModal
        isOpen={confirmModal}
        onCancel={() => { setConfirmModal(false); setSelectedTitleId(null); }}
        onConfirm={handleInactivateConfirm}
        title="Tem certeza que deseja inativar este título?"
        message="O título será marcado como inativo e não poderá mais ser utilizado."
        confirmText="Sim, inativar"
        cancelText="Cancelar"
        type="danger"
      />

      <ConfirmModal
        isOpen={payModal}
        onCancel={() => { setPayModal(false); setSelectedTitleId(null); }}
        onConfirm={handlePayConfirm}
        title="Confirmar baixa do título?"
        message="O título será marcado como PAGO e não poderá mais ser editado ou inativado. Esta ação não pode ser desfeita."
        confirmText="Sim, dar baixa"
        cancelText="Cancelar"
        type="info"
      />

      {/* Modal de Estorno */}
      {reverseModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-white">Estornar Pagamento</h2>
                <p className="text-orange-100 text-sm mt-1">Esta ação irá reverter o pagamento do título</p>
              </div>
              <button
                onClick={() => {
                  setReverseModal({ isOpen: false, justification: '' });
                  setSelectedTitleId(null);
                }}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  <strong>Atenção:</strong> O estorno do pagamento irá alterar o status do título de volta para "Ativo". 
                  Esta ação não pode ser desfeita e requer uma justificativa.
                </p>
                <p className="text-sm text-gray-600">
                  Esta operação só é permitida para títulos pagos há menos de 7 dias.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificativa do Estorno <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reverseModal.justification}
                  onChange={(e) => setReverseModal({ ...reverseModal, justification: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Descreva o motivo do estorno do pagamento..."
                  rows={4}
                  required
                />
                <p className={`text-xs mt-1 ${
                  reverseModal.justification.length < 5 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  Caracteres: {reverseModal.justification.length}/5 (mínimo)
                </p>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setReverseModal({ isOpen: false, justification: '' });
                  setSelectedTitleId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReverseConfirm}
                disabled={!reverseModal.justification.trim() || reverseModal.justification.trim().length < 5}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Estorno
              </button>
            </div>
          </div>
        </div>
      )}

      <InfoModal
        isOpen={infoModal.isOpen}
        title={infoModal.title}
        message={infoModal.message}
        confirmText="Fechar"
        onConfirm={() => setInfoModal({ ...infoModal, isOpen: false })}
        type={infoModal.type}
      />

      <DetailsModal
        isOpen={detailsModal.isOpen}
        isLoading={detailsModal.isLoading}
        title={detailsModal.data?.code ? `Título ${detailsModal.data.code}` : 'Detalhes do Título'}
        subtitle="Visualize as informações do título"
        onClose={detailsModal.closeModal}
        onEdit={() => {
          detailsModal.closeModal();
          handleEditClick(detailsModal.data?.id || '');
        }}
        showEditButton={titlePermissions.canUpdate && detailsModal.data?.status !== 'PAID'}
      >
        {detailsModal.data ? (
          <DetailSection
            title="Informações do Título"
            icon={<FaFileInvoiceDollar className="w-5 h-5 text-[#0c4c6e]" />}
          >
            <DetailField label="Código" value={<span className="font-medium">{detailsModal.data.code}</span>} />
            <DetailField label="Data" value={new Date(detailsModal.data.date).toLocaleDateString('pt-BR')} />
            <DetailField
              label="Valor"
              value={
                <span className="font-bold text-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(detailsModal.data.value)}
                </span>
              }
            />
            <DetailField
              label="Status"
              value={
                (() => {
                  let status, color;
                  switch (detailsModal.data.status) {
                    case 'ACTIVE':
                      status = 'Ativo';
                      color = 'bg-blue-100 text-blue-800';
                      break;
                    case 'INACTIVE':
                      status = 'Inativo';
                      color = 'bg-red-100 text-red-800';
                      break;
                    case 'PAID':
                      status = 'Pago';
                      color = 'bg-green-100 text-green-800';
                      break;
                    default:
                      status = 'Desconhecido';
                      color = 'bg-gray-100 text-gray-800';
                  }
                  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{status}</span>;
                })()
              }
            />
            {detailsModal.data.status === 'PAID' && detailsModal.data.paidAt && (
              <DetailField
                label="Data de Pagamento"
                value={
                  <span className="font-medium text-green-700">
                    {new Date(detailsModal.data.paidAt).toLocaleString('pt-BR', {
                      timeZone: 'America/Sao_Paulo',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                }
              />
            )}
            <DetailField label="Descrição" value={detailsModal.data.description || '-'} fullWidth />
            {detailsModal.data.movement && (
              <DetailField label="Tipo de Movimento" value={detailsModal.data.movement.name} />
            )}
            {detailsModal.data.typeEntry && (
              <DetailField label="Tipo de Entrada" value={detailsModal.data.typeEntry.name} />
            )}
            {detailsModal.data.partner && (
              <DetailField label="Parceiro" value={detailsModal.data.partner.name} />
            )}
          </DetailSection>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Erro ao carregar informações do título</p>
          </div>
        )}
      </DetailsModal>
    </div>
  );
};

export default VisualizarTitle;

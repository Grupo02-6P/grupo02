import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { accountService } from '../../services/account';
import type { AccountResponse, CreateAccountDto, UpdateAccountDto } from '../../types/Account';
import Input from '../../components/input/Input';
import { InfoModal } from '../../components/modal/InfoModal';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import type { ConfirmModalProps } from '../../components/modal/InfoModal';
import { LoadingSpinner } from '../../components/loading/LoadingSpinner';
import { MdAccountBalance } from "react-icons/md";


const buildTree = (accounts: AccountResponse[]) => {
  // Create node objects and a quick lookup by id (fallback to code)
  const nodes = accounts.map(acc => ({ ...(acc as any), children: [] as any[] }));
  const nodeMap = new Map<string, any>();
  nodes.forEach(n => {
    const key = (n.id || n.code) && String(n.id || n.code).trim();
    if (key) nodeMap.set(key, n);
  });

  const roots: any[] = [];

  nodes.forEach(n => {
    const rawParent = n.parentAccountId;
    const parentKey = rawParent ? String(rawParent).trim() : '';

    // Try to find parent by id or by code
    let parent = parentKey ? nodeMap.get(parentKey) : undefined;

    if (!parent && parentKey) {
      parent = nodes.find((a: any) => String(a.id || a.code).trim() === parentKey);
    }

    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(n);
    } else {
      roots.push(n);
    }
  });

  return roots;
};

const GerenciarAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState<CreateAccountDto>({
    code: '',
    name: '',
    description: '',
    level: 1,
    acceptsPosting: true,
    active: 'ACTIVE',
    parentAccountId: '',
  });

  const [infoModal, setInfoModal] = useState<ConfirmModalProps>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Fechar',
    type: undefined,
    onConfirm: () => setInfoModal({ ...infoModal, isOpen: false })
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await accountService.findAll({ limit: -1 });
        setAccounts(resp.data || []);
      } catch (err) {
        console.error(err);
        setInfoModal({ isOpen: true, title: 'Erro', message: 'Falha ao carregar contas', confirmText: 'Fechar', type: 'danger', onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const tree = useMemo(() => buildTree(accounts), [accounts]);

  const toggle = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUseAsParent = (idOrCode: string) => {
    // find parent account to set proper level and generate code
    const parent = accounts.find(acc => String((acc as any).id) === String(idOrCode) || acc.code === idOrCode);
    const nextLevel = parent ? (parent.level || 0) + 1 : 1;
    
    // Generate automatic code based on parent
    let generatedCode = '';
    if (parent && parent.code) {
      generatedCode = generateNextCode(parent.code);
    }
    
    setForm(prev => ({ 
      ...prev, 
      parentAccountId: idOrCode, 
      level: nextLevel,
      code: generatedCode
    }));
    
    // expand parent node so user sees children immediately
    const parentKey = String((parent as any)?.id || parent?.code || idOrCode);
    setExpanded(prev => ({ ...prev, [parentKey]: true }));
  };

  const handleInactivateClick = (id: string) => {
    setSelectedAccountId(id);
    setConfirmModalOpen(true);
  };

  const handleInactivateConfirm = async () => {
    if (!selectedAccountId) return;
    try {
      setLoading(true);
      await accountService.inactive(selectedAccountId);
      setConfirmModalOpen(false);
      setSelectedAccountId(null);
      const resp = await accountService.findAll({ limit: -1 });
      setAccounts(resp.data || []);
      setInfoModal({ isOpen: true, title: 'Sucesso', message: 'Conta inativada com sucesso', confirmText: 'Fechar', type: 'info', onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) });
    } catch (err: any) {
      console.error(err);
      setInfoModal({ isOpen: true, title: 'Erro', message: err.message || 'Falha ao inativar conta', confirmText: 'Fechar', type: 'danger', onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (node: any) => {
    // populate form with node data and set editing mode
    setEditingAccountId(String((node as any).id || node.code));
    setForm({
      code: node.code || '',
      name: node.name || '',
      description: node.description || '',
      level: node.level || 1,
      acceptsPosting: !!node.acceptsPosting,
      active: node.active || 'ACTIVE',
      parentAccountId: (node.parentAccountId as string) || '',
    });
    // expand the node so user sees children
    const nodeKey = String((node as any).id || node.code);
    setExpanded(prev => ({ ...prev, [nodeKey]: true }));
  };

  const renderNode = (node: any, depth = 0) => {
    const nodeKey = String(node.id || node.code);
    const isExpanded = !!expanded[nodeKey];
    return (
      <div key={nodeKey} style={{ paddingLeft: depth * 12 }}>
        <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-md px-2">
          <div className="flex items-center space-x-2">
            {node.children?.length ? (
              <button type="button" onClick={() => toggle(nodeKey)} className="p-1 rounded hover:bg-gray-100">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}

            <div>
              <div className="text-sm font-medium text-gray-800">
                <button type="button" onClick={() => handleEditClick(node)} className="text-left cursor-pointer">{node.name}</button>
                <span className="text-xs text-gray-500 ml-2">({node.code})</span>
                {node.active === 'INACTIVE' && (
                  <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded ml-2">Inativa</span>
                )}
              </div>
              <div className="text-xs text-gray-500">Nível: {node.level} • {node.acceptsPosting ? 'Lançável' : 'Não lançável'}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => handleUseAsParent(node.id || node.code)}>Usar como pai</button>
            {node.active === 'ACTIVE' && (
              <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => handleInactivateClick(String(node.id || node.code))}>Inativar</button>
            )}
          </div>
        </div>

        {isExpanded && node.children?.length > 0 && (
          <div className="mt-1">
            {node.children.map((c: any) => renderNode(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Função para gerar o próximo código automaticamente
  const generateNextCode = (parentCode: string): string => {
    // Buscar todas as contas filhas da conta pai
    const parentAccount = accounts.find(p => p.code === parentCode);
    if (!parentAccount) return `${parentCode}.1`;

    const childrenAccounts = accounts.filter(acc => {
      return String(acc.parentAccountId) === String((parentAccount as any).id || parentAccount.code);
    });

    if (childrenAccounts.length === 0) {
      // Primeira conta filha
      return `${parentCode}.1`;
    }

    // Encontrar o maior número sequencial usado
    const childNumbers = childrenAccounts
      .map(child => child.code)
      .filter(code => code && code.startsWith(`${parentCode}.`))
      .map(code => {
        const suffix = code.substring(parentCode.length + 1); // Remove "parentCode."
        const parts = suffix.split('.');
        const firstNumber = parseInt(parts[0]) || 0;
        return firstNumber;
      })
      .filter(num => !isNaN(num) && num > 0);

    const maxNumber = childNumbers.length > 0 ? Math.max(...childNumbers) : 0;
    return `${parentCode}.${maxNumber + 1}`;
  };

  const handleChange = (field: keyof CreateAccountDto, value: any) => {
    // when parentAccountId changes, update level to parent's level + 1 and generate code
    if (field === 'parentAccountId') {
      const parentIdOrCode = value;
      if (!parentIdOrCode) {
        // no parent selected -> base level 1, code manual
        setForm(prev => ({ ...prev, parentAccountId: '', level: 1, code: '' }));
        return;
      }
      const parent = accounts.find(acc => String((acc as any).id) === String(parentIdOrCode) || acc.code === parentIdOrCode);
      const nextLevel = parent ? (parent.level || 0) + 1 : 1;
      
      // Generate automatic code based on parent
      let generatedCode = '';
      if (parent && parent.code) {
        generatedCode = generateNextCode(parent.code);
      }
      
      setForm(prev => ({ 
        ...prev, 
        parentAccountId: parentIdOrCode, 
        level: nextLevel,
        code: generatedCode
      }));
      
      // optionally expand parent
      const parentKey = String((parent as any)?.id || parent?.code || parentIdOrCode);
      setExpanded(prev => ({ ...prev, [parentKey]: true }));
      return;
    }

    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!form.code || form.code.trim().length < 1) errors.push('Código obrigatório');
    if (!form.name || form.name.trim().length < 2) errors.push('Nome obrigatório');
    if (!form.level || form.level < 1) errors.push('Nível deve ser >= 1');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    if (errs.length) {
      setInfoModal({ isOpen: true, title: 'Erro de Validação', message: errs.join(', '), confirmText: 'Fechar', type: 'danger', onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) });
      return;
    }

    try {
      setLoading(true);

      if (editingAccountId) {
        // update
        const dataToSend: UpdateAccountDto = {
          code: form.code,
          name: form.name,
          description: form.description,
          level: form.level,
          acceptsPosting: form.acceptsPosting,
          active: form.active,
          parentAccountId: form.parentAccountId || undefined,
        };

        await accountService.update(editingAccountId, dataToSend);
        setInfoModal({ isOpen: true, title: 'Sucesso', message: 'Conta atualizada com sucesso', confirmText: 'Fechar', type: 'info', onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) });
        setEditingAccountId(null);
      } else {
        // create
        await accountService.create(form);
        setInfoModal({ isOpen: true, title: 'Sucesso', message: 'Conta criada com sucesso', confirmText: 'Fechar', type: 'info', onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) });
      }

      // reload
      const resp = await accountService.findAll({ limit: -1 });
      setAccounts(resp.data || []);
      // reset form
      setForm({ code: '', name: '', description: '', level: 1, acceptsPosting: true, active: 'ACTIVE', parentAccountId: '' });
    } catch (err: any) {
      console.error(err);
      setInfoModal({ isOpen: true, title: 'Erro', message: err.message || (editingAccountId ? 'Falha ao atualizar conta' : 'Falha ao criar conta'), confirmText: 'Fechar', type: 'danger', onConfirm: () => setInfoModal({ ...infoModal, isOpen: false }) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-[#0c4c6e] rounded-full p-3 text-white">
              <MdAccountBalance />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gerenciar Contas</h1>
              <p className="text-gray-600">Visualize a hierarquia de contas e cadastre novas contas contábeis</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT: Hierarquia */}
          <div className="col-span-6 bg-white rounded-2xl shadow p-6 overflow-auto max-h-[70vh]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Hierarquia de Contas</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
            ) : (
              <div className="space-y-2">
                {tree.length === 0 && <div className="text-sm text-gray-500">Nenhuma conta cadastrada</div>}
                {tree.map(node => renderNode(node))}
              </div>
            )}
          </div>

          {/* RIGHT: Formulário */}
          <div className="col-span-6 bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Novo / Editar Conta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input 
                  type="text" 
                  placeholder={form.parentAccountId ? "Código gerado automaticamente" : "Código"} 
                  value={form.code} 
                  onChange={e => handleChange('code', e.target.value)} 
                  label="Código" 
                  disabled={!!form.parentAccountId}
                />
                {form.parentAccountId && (
                  <p className="text-xs text-blue-600 mt-1">
                    ℹ️ Código gerado automaticamente baseado na conta pai
                  </p>
                )}
              </div>
              <Input type="text" placeholder="Nome" value={form.name} onChange={e => handleChange('name', e.target.value)} label="Nome" />
              <Input type="text" placeholder="Descrição" value={form.description} onChange={e => handleChange('description', e.target.value)} label="Descrição" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nível</label>
                  <input type="number" min={1} value={form.level} onChange={e => handleChange('level', Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Aceita Lançamento</label>
                  <select value={form.acceptsPosting ? 'true' : 'false'} onChange={e => handleChange('acceptsPosting', e.target.value === 'true')} className="w-full border border-gray-300 rounded-lg p-2">
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Conta Pai (opcional)</label>
                <select value={form.parentAccountId || ''} onChange={e => handleChange('parentAccountId', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="">Nenhuma</option>
                  {accounts.map(acc => (
                    <option key={(acc as any).id || acc.code} value={(acc as any).id || acc.code}>{acc.name} ({acc.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select value={form.active} onChange={e => handleChange('active', e.target.value as 'ACTIVE' | 'INACTIVE')} className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                {editingAccountId && (
                  <button
                    type="button"
                    onClick={() => {
                      // cancel edit
                      setEditingAccountId(null);
                      setForm({ code: '', name: '', description: '', level: 1, acceptsPosting: true, active: 'ACTIVE', parentAccountId: '' });
                    }}
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" className="flex-1 px-6 py-3 bg-[#0c4c6e] text-white rounded-lg hover:bg-[#083f5d]">{editingAccountId ? 'Atualizar Conta' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onCancel={() => { setConfirmModalOpen(false); setSelectedAccountId(null); }}
        onConfirm={handleInactivateConfirm}
        title="Tem certeza que deseja inativar esta conta?"
        message="Esta ação irá impedir novos lançamentos nesta conta. Você pode reativar posteriormente." 
        confirmText="Sim, inativar"
        cancelText="Cancelar"
        type="danger"
      />

      <InfoModal isOpen={infoModal.isOpen} title={infoModal.title} message={infoModal.message} confirmText={infoModal.confirmText} onConfirm={infoModal.onConfirm} type={infoModal.type} />
    </div>
  );
};

export default GerenciarAccounts;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Shield, Settings, Users } from 'lucide-react';
import { roleService } from '../../../services/role';
import { resourceService } from '../../../services/resource';
import type { CreateRoleDto, permissions } from '../../../types/Role';
import type { ResourceResponse } from '../../../types/Resource';
import { LoadingSpinner } from '../../../components/loading/LoadingSpinner';
import { InfoModal } from '../../../components/modal/InfoModal';

const ACTIONS = [
  { value: 'manage', label: 'Gerenciar (Todas as ações)', color: 'bg-purple-500' },
  { value: 'read', label: 'Visualizar', color: 'bg-blue-500' },
  { value: 'create', label: 'Criar', color: 'bg-green-500' },
  { value: 'update', label: 'Editar', color: 'bg-yellow-500' },
  { value: 'delete', label: 'Excluir', color: 'bg-red-500' }
] as const;

// Interface para controlar ações selecionadas
interface ResourcePermission {
  resource: string;
  selectedActions: string[];
}

const CadastrarRole: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  // Estado para controlar permissões com checkboxes
  const [resourcePermissions, setResourcePermissions] = useState<ResourcePermission[]>([]);

  // Estado do formulário
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
    isDefault: false,
    permissions: []
  });

  // Modal de informações
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'OK',
    type: undefined as 'success' | 'error' | 'info' | undefined
  });

  // Carregar recursos na inicialização
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoadingResources(true);
        const response = await resourceService.findAll();
        setResources(response.data || []);
      } catch (error: any) {
        console.error('Erro ao carregar recursos:', error);
        setInfoModal({
          isOpen: true,
          title: 'Erro',
          message: 'Erro ao carregar recursos do sistema',
          confirmText: 'OK',
          type: 'error'
        });
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, []);

  // Função para adicionar nova permissão (recurso)
  const addPermission = () => {
    if (resources.length === 0) return;
    
    // Encontrar recursos que ainda não foram adicionados
    const usedResources = resourcePermissions.map(rp => rp.resource);
    const availableResources = resources.filter(resource => !usedResources.includes(resource.name));
    
    // Se não há recursos disponíveis, não adiciona
    if (availableResources.length === 0) {
      setInfoModal({
        isOpen: true,
        title: 'Aviso',
        message: 'Todos os recursos disponíveis já foram adicionados às permissões.',
        confirmText: 'OK',
        type: 'info'
      });
      return;
    }
    
    const newResourcePermission: ResourcePermission = {
      resource: availableResources[0].name,
      selectedActions: []
    };

    setResourcePermissions(prev => [...prev, newResourcePermission]);
  };

  // Função para remover permissão (recurso)
  const removePermission = (index: number) => {
    setResourcePermissions(prev => prev.filter((_, i) => i !== index));
  };

  // Função para atualizar recurso selecionado
  const updateResource = (index: number, resourceName: string) => {
    // Verificar se o recurso já está sendo usado em outra permissão
    const isResourceUsed = resourcePermissions.some((rp, i) => 
      i !== index && rp.resource === resourceName
    );

    if (isResourceUsed) {
      setInfoModal({
        isOpen: true,
        title: 'Recurso Duplicado',
        message: `O recurso "${resourceName}" já está sendo usado em outra permissão. Cada recurso pode ser configurado apenas uma vez.`,
        confirmText: 'OK',
        type: 'error'
      });
      return;
    }

    setResourcePermissions(prev => 
      prev.map((rp, i) => 
        i === index ? { ...rp, resource: resourceName } : rp
      )
    );
  };

  // Função para alternar ação selecionada
  const toggleAction = (index: number, action: string) => {
    setResourcePermissions(prev => 
      prev.map((rp, i) => {
        if (i !== index) return rp;

        let newSelectedActions = [...rp.selectedActions];

        if (action === 'manage') {
          // Se selecionar manage, limpa todas as outras e adiciona apenas manage
          newSelectedActions = newSelectedActions.includes('manage') ? [] : ['manage'];
        } else if (action === 'read') {
          // Lógica especial para 'read'
          if (newSelectedActions.includes('read')) {
            // Se está removendo 'read', remove também todas as ações que dependem dele
            newSelectedActions = newSelectedActions.filter(a => 
              !['read', 'create', 'update', 'delete'].includes(a)
            );
          } else {
            // Se está adicionando 'read', remove manage primeiro e adiciona read
            newSelectedActions = newSelectedActions.filter(a => a !== 'manage');
            newSelectedActions.push('read');
          }
        } else {
          // Para outras ações (create, update, delete)
          // Remove manage primeiro
          newSelectedActions = newSelectedActions.filter(a => a !== 'manage');
          
          if (newSelectedActions.includes(action)) {
            // Se está removendo a ação
            newSelectedActions = newSelectedActions.filter(a => a !== action);
            
            // Verificar se ainda precisa do 'read'
            const hasOtherActions = ['create', 'update', 'delete'].some(a => 
              a !== action && newSelectedActions.includes(a)
            );
            // Se não tem mais nenhuma ação que precise de 'read', remove o 'read' também
            if (!hasOtherActions) {
              newSelectedActions = newSelectedActions.filter(a => a !== 'read');
            }
          } else {
            // Se está adicionando a ação
            newSelectedActions.push(action);
            
            // Adicionar 'read' automaticamente se não estiver presente
            if (!newSelectedActions.includes('read')) {
              newSelectedActions.push('read');
            }
          }
        }

        return { ...rp, selectedActions: newSelectedActions };
      })
    );
  };

  // Função para gerar permissões finais baseadas nas seleções
  const generateFinalPermissions = (): permissions[] => {
    const finalPermissions: permissions[] = [];

    resourcePermissions.forEach(rp => {
      const hasAllCrudActions = ['create', 'read', 'update', 'delete'].every(action => 
        rp.selectedActions.includes(action)
      );

      if (rp.selectedActions.includes('manage') || hasAllCrudActions) {
        // Se tem manage explícito OU todas as ações CRUD, cria apenas uma permissão de manage
        finalPermissions.push({
          resource: rp.resource,
          action: 'manage',
          fields: [],
          conditions: {}
        });
      } else {
        // Senão, cria uma permissão para cada ação selecionada
        rp.selectedActions.forEach(action => {
          finalPermissions.push({
            resource: rp.resource,
            action: action as 'manage' | 'create' | 'read' | 'update' | 'delete',
            fields: [],
            conditions: {}
          });
        });
      }
    });

    return finalPermissions;
  };

  // Atualizar formData.permissions sempre que resourcePermissions mudar
  useEffect(() => {
    const finalPermissions = generateFinalPermissions();
    setFormData(prev => ({
      ...prev,
      permissions: finalPermissions
    }));
  }, [resourcePermissions]);

  // Função para submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.name.trim()) {
      setInfoModal({
        isOpen: true,
        title: 'Erro de Validação',
        message: 'O nome da função é obrigatório',
        confirmText: 'OK',
        type: 'error'
      });
      return;
    }

    if (!formData.description.trim()) {
      setInfoModal({
        isOpen: true,
        title: 'Erro de Validação',
        message: 'A descrição da função é obrigatória',
        confirmText: 'OK',
        type: 'error'
      });
      return;
    }

    if (!hasAnyPermissions()) {
      setInfoModal({
        isOpen: true,
        title: 'Erro de Validação',
        message: 'Pelo menos uma permissão deve ser definida',
        confirmText: 'OK',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await roleService.create(formData);
      
      setInfoModal({
        isOpen: true,
        title: 'Sucesso',
        message: 'Função criada com sucesso!',
        confirmText: 'OK',
        type: 'success'
      });

      // Resetar formulário após sucesso
      setTimeout(() => {
        navigate('/usuarios/permissoes/visualizar');
      }, 1500);

    } catch (error: any) {
      setInfoModal({
        isOpen: true,
        title: 'Erro',
        message: error.message || 'Erro ao criar função',
        confirmText: 'OK',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para validar se pelo menos uma permissão foi configurada
  const hasAnyPermissions = () => {
    return resourcePermissions.some(rp => rp.selectedActions.length > 0);
  };

  if (loadingResources) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2ecf1] to-[#e0eef5] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#0c4c6e] px-6 py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Cadastrar Função</h1>
                <p className="text-white text-sm opacity-90">Crie uma nova função com suas respectivas permissões</p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Informações Básicas */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2 text-[#0c4c6e]" />
                Informações Básicas
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Função *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0c4c6e] focus:border-transparent"
                    placeholder="Ex: Administrador, Gerente, Operador..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0c4c6e] focus:border-transparent"
                    placeholder="Descreva as responsabilidades desta função..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Permissões */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-[#0c4c6e]" />
                  Permissões ({resourcePermissions.length})
                </h2>
                <button
                  type="button"
                  onClick={addPermission}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-[#0c4c6e] text-white rounded-md hover:bg-[#083f5d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={resources.length === 0 || resourcePermissions.length >= resources.length}
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {resourcePermissions.length >= resources.length 
                      ? 'Todos adicionados' 
                      : 'Adicionar'
                    }
                  </span>
                </button>
              </div>

              {/* Lista de Permissões */}
              <div className="space-y-3">
                {resourcePermissions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Shield className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Nenhuma permissão definida</p>
                    <p className="text-xs text-gray-400">Clique em "Adicionar Permissão" para começar</p>
                  </div>
                ) : (
                  resourcePermissions.map((resourcePermission, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            {resources.find(r => r.name === resourcePermission.resource)?.description || resourcePermission.resource}
                          </span>
                          {resourcePermission.selectedActions.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {(() => {
                                const hasAllCrudActions = ['create', 'read', 'update', 'delete'].every(action => 
                                  resourcePermission.selectedActions.includes(action)
                                );

                                if (resourcePermission.selectedActions.includes('manage') || hasAllCrudActions) {
                                  return 'Gerenciar';
                                } else {
                                  return `${resourcePermission.selectedActions.length} ações`;
                                }
                              })()}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePermission(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Seleção de Recurso */}
                        <div>
                          <select
                            value={resourcePermission.resource}
                            onChange={(e) => updateResource(index, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0c4c6e] focus:border-transparent"
                          >
                            {resources
                              .filter(resource => {
                                const usedResources = resourcePermissions
                                  .filter((_, i) => i !== index)
                                  .map(rp => rp.resource);
                                return resource.name === resourcePermission.resource || !usedResources.includes(resource.name);
                              })
                              .map(resource => (
                                <option key={resource.id} value={resource.name}>
                                  {resource.description}
                                </option>
                              ))
                            }
                          </select>
                        </div>

                        {/* Checkboxes de Ações - Compacto */}
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {ACTIONS.map(action => {
                              const isSelected = resourcePermission.selectedActions.includes(action.value);
                              const isManageSelected = resourcePermission.selectedActions.includes('manage');
                              const isDisabled = isManageSelected && action.value !== 'manage';
                              
                              // Verificar se 'read' está automaticamente selecionado devido a outras ações
                              const hasModifyingActions = ['create', 'update', 'delete'].some(a => 
                                resourcePermission.selectedActions.includes(a)
                              );
                              const isReadAutoSelected = action.value === 'read' && hasModifyingActions && isSelected;
                              
                              return (
                                <label
                                  key={action.value}
                                  className={`flex items-center px-3 py-1.5 rounded-md border cursor-pointer transition-all text-sm relative ${
                                    isSelected 
                                      ? `border-[#0c4c6e] bg-[#0c4c6e] text-white` 
                                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => toggleAction(index, action.value)}
                                    className="sr-only"
                                  />
                                  <span className="text-xs font-medium">
                                    {action.value === 'manage' ? 'Gerenciar' : 
                                     action.value === 'read' ? 'Ver' :
                                     action.value === 'create' ? 'Criar' :
                                     action.value === 'update' ? 'Editar' :
                                     'Excluir'}
                                  </span>
                                  {isReadAutoSelected && (
                                    <span className="ml-1 text-xs opacity-75">*</span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                          {/* Legenda para visualizar automático */}
                          {(() => {
                            const hasModifyingActions = ['create', 'update', 'delete'].some(a => 
                              resourcePermission.selectedActions.includes(a)
                            );
                            const hasReadAutoSelected = resourcePermission.selectedActions.includes('read') && hasModifyingActions;
                            
                            if (hasReadAutoSelected) {
                              return (
                                <p className="text-xs text-gray-500 mt-2">
                                  * Visualizar adicionado automaticamente. Desmarcar removerá todas as outras ações.
                                </p>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      {/* Aviso de conversão automática - apenas quando necessário */}
                      {(() => {
                        const hasAllCrudActions = ['create', 'read', 'update', 'delete'].every(action => 
                          resourcePermission.selectedActions.includes(action)
                        );
                        
                        if (hasAllCrudActions && !resourcePermission.selectedActions.includes('manage')) {
                          return (
                            <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded-md">
                              <span className="text-xs text-purple-800">
                                ⚡ Conversão automática para "Gerenciar"
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-[#0c4c6e] text-white rounded-md hover:bg-[#083f5d] transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Criar Função</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Modal de Informações */}
        <InfoModal
          isOpen={infoModal.isOpen}
          title={infoModal.title}
          message={infoModal.message}
          confirmText={infoModal.confirmText}
          onConfirm={() => setInfoModal({ ...infoModal, isOpen: false })}
          type={infoModal.type}
        />
      </div>
    </div>
  );
};

export default CadastrarRole;

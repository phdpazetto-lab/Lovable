import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, Wrench, ClipboardList } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { Material, getAllMateriais } from '../../services/materiaisService';
import {
  MaterialOcorrencia,
  createOcorrencia,
  getAllOcorrencias,
  removeOcorrencia,
  updateOcorrencia,
  uploadOcorrenciaFiles,
} from '../../services/materiaisOcorrenciasService';
import {
  MaterialSolicitacao,
  createSolicitacao,
  getAllSolicitacoes,
  removeSolicitacao,
  updateSolicitacao,
} from '../../services/materiaisSolicitacoesService';

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
}

type OccurrenceFormValues = {
  equipamento: string;
  patrimonio: string;
  data: string;
  descricao: string;
  anexos?: FileList;
};

type SolicitationFormValues = {
  titulo: string;
  materiais_necessarios: string;
  motivo: string;
  data: string;
  urgencia: string;
};

type ModalBaseProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  showToast: ReturnType<typeof useToast>["showToast"];
};

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;

function OcorrenciaModal({ open, onClose, onSaved, showToast, initialData }: ModalBaseProps & { initialData?: MaterialOcorrencia | null }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<OccurrenceFormValues>({
    defaultValues: {
      equipamento: '',
      patrimonio: '',
      data: '',
      descricao: '',
    },
  });

  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [removeAttachments, setRemoveAttachments] = useState(false);

  useEffect(() => {
    if (open) {
      reset({
        equipamento: initialData?.equipamento || '',
        patrimonio: initialData?.patrimonio || '',
        data: initialData?.data || '',
        descricao: initialData?.descricao || '',
      });
      setExistingAttachments(initialData?.anexos || []);
      setRemoveAttachments(false);
    } else {
      reset({
        equipamento: '',
        patrimonio: '',
        data: '',
        descricao: '',
      });
      setExistingAttachments([]);
      setRemoveAttachments(false);
    }
  }, [initialData, open, reset]);

  const files = watch('anexos');

  const onSubmit = async (values: OccurrenceFormValues) => {
    try {
      let anexos = removeAttachments ? [] : existingAttachments;
      const filesArray = values.anexos ? Array.from(values.anexos) : [];

      if (filesArray.length > MAX_FILES) {
        showToast({ message: `Selecione no máximo ${MAX_FILES} arquivos.`, type: 'error' });
        return;
      }

      const oversize = filesArray.find((file) => file.size / 1024 / 1024 > MAX_FILE_SIZE_MB);
      if (oversize) {
        showToast({ message: `Cada arquivo deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`, type: 'error' });
        return;
      }

      if (filesArray.length) {
        const uploaded = await uploadOcorrenciaFiles(filesArray);
        anexos = [...(removeAttachments ? [] : existingAttachments), ...uploaded];
      }

      const payload = {
        equipamento: values.equipamento,
        patrimonio: values.patrimonio,
        data: values.data || undefined,
        descricao: values.descricao || '',
        anexos,
      };

      if (initialData?.id) {
        await updateOcorrencia(initialData.id, payload);
        showToast({ message: 'Ocorrência atualizada com sucesso!', type: 'success' });
      } else {
        await createOcorrencia(payload);
        showToast({ message: 'Ocorrência registrada com sucesso!', type: 'success' });
      }

      onSaved();
      onClose();
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao salvar ocorrência.', type: 'error' });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/20 p-4">
      <div className="mt-10 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-secondary">{initialData ? 'Editar ocorrência' : 'Registrar problema'}</h2>
            <p className="text-sm text-gray-500">Informe o problema com o equipamento atual.</p>
          </div>
          <button className="text-sm text-gray-500 hover:text-gray-700" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Equipamento *</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('equipamento', { required: 'Equipamento é obrigatório' })}
              />
              {errors.equipamento && <p className="text-xs text-red-500">{errors.equipamento.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Patrimônio *</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('patrimonio', { required: 'Patrimônio é obrigatório' })}
              />
              {errors.patrimonio && <p className="text-xs text-red-500">{errors.patrimonio.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Data *</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('data', { required: 'Data é obrigatória' })}
              />
              {errors.data && <p className="text-xs text-red-500">{errors.data.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Descrição *</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('descricao', { required: 'Descrição é obrigatória' })}
                placeholder="Descreva o problema encontrado"
              />
              {errors.descricao && <p className="text-xs text-red-500">{errors.descricao.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Fotos ou PDFs adicionais</label>
            <input type="file" multiple accept="image/*,application/pdf" {...register('anexos')} className="block w-full text-sm" />
            {files?.length ? <p className="text-xs text-gray-500">{files.length} arquivo(s) selecionado(s)</p> : null}
            {existingAttachments.length > 0 && !removeAttachments && !files?.length && (
              <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
                <p className="font-medium">Anexos atuais</p>
                <ul className="list-disc space-y-1 pl-4">
                  {existingAttachments.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">
                        Ver arquivo
                      </a>
                    </li>
                  ))}
                </ul>
                <button type="button" className="mt-2 text-red-600 hover:underline" onClick={() => setRemoveAttachments(true)}>
                  Remover anexos
                </button>
              </div>
            )}
            {removeAttachments && <p className="text-xs text-amber-600">Os anexos atuais serão removidos ao salvar.</p>}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar ocorrência'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SolicitacaoModal({ open, onClose, onSaved, showToast, initialData }: ModalBaseProps & { initialData?: MaterialSolicitacao | null }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolicitationFormValues>({
    defaultValues: {
      titulo: '',
      materiais_necessarios: '',
      motivo: '',
      data: '',
      urgencia: 'normal',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        titulo: initialData?.titulo || '',
        materiais_necessarios: initialData?.materiais_necessarios || '',
        motivo: initialData?.motivo || '',
        data: initialData?.data || '',
        urgencia: initialData?.urgencia || 'normal',
      });
    } else {
      reset({ titulo: '', materiais_necessarios: '', motivo: '', data: '', urgencia: 'normal' });
    }
  }, [initialData, open, reset]);

  const onSubmit = async (values: SolicitationFormValues) => {
    try {
      const payload = {
        titulo: values.titulo,
        materiais_necessarios: values.materiais_necessarios,
        motivo: values.motivo,
        data: values.data || undefined,
        urgencia: values.urgencia,
      };

      if (initialData?.id) {
        await updateSolicitacao(initialData.id, payload);
        showToast({ message: 'Solicitação atualizada com sucesso!', type: 'success' });
      } else {
        await createSolicitacao(payload);
        showToast({ message: 'Solicitação enviada com sucesso!', type: 'success' });
      }

      onSaved();
      onClose();
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao salvar solicitação.', type: 'error' });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/20 p-4">
      <div className="mt-10 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-secondary">{initialData ? 'Editar solicitação' : 'Nova solicitação'}</h2>
            <p className="text-sm text-gray-500">Informe o que precisa para continuar seu trabalho.</p>
          </div>
          <button className="text-sm text-gray-500 hover:text-gray-700" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Título *</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('titulo', { required: 'Título é obrigatório' })}
              />
              {errors.titulo && <p className="text-xs text-red-500">{errors.titulo.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Data necessária *</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('data', { required: 'Data é obrigatória' })}
              />
              {errors.data && <p className="text-xs text-red-500">{errors.data.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Materiais necessários *</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('materiais_necessarios', { required: 'Informe o que precisa' })}
                placeholder="Ex: notebook, mouse, monitor..."
              />
              {errors.materiais_necessarios && <p className="text-xs text-red-500">{errors.materiais_necessarios.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Motivo *</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('motivo', { required: 'Descreva o motivo' })}
                placeholder="Explique a necessidade"
              />
              {errors.motivo && <p className="text-xs text-red-500">{errors.motivo.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Urgência *</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('urgencia', { required: 'Urgência é obrigatória' })}
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
              </select>
              {errors.urgencia && <p className="text-xs text-red-500">{errors.urgencia.message}</p>}
            </div>
            <div className="flex items-end">
              <p className="text-xs text-gray-500">Ao salvar, a equipe responsável receberá sua solicitação.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Salvar solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type ActivityRow =
  | { type: 'ocorrencia'; data: MaterialOcorrencia }
  | { type: 'solicitacao'; data: MaterialSolicitacao };

export function MateriaisPage() {
  const { toast, showToast, clearToast } = useToast();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loadingMateriais, setLoadingMateriais] = useState(true);

  const [ocorrencias, setOcorrencias] = useState<MaterialOcorrencia[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<MaterialSolicitacao[]>([]);
  const [loadingAtividades, setLoadingAtividades] = useState(true);

  const [occModalOpen, setOccModalOpen] = useState(false);
  const [solModalOpen, setSolModalOpen] = useState(false);
  const [occEditing, setOccEditing] = useState<MaterialOcorrencia | null>(null);
  const [solEditing, setSolEditing] = useState<MaterialSolicitacao | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'ocorrencia' | 'solicitacao'; id: number } | null>(null);

  const loadMateriais = useCallback(async () => {
    setLoadingMateriais(true);
    try {
      const data = await getAllMateriais();
      setMateriais(data);
    } catch (error: any) {
      showToast({ message: error?.message || 'Não foi possível carregar os materiais.', type: 'error' });
    } finally {
      setLoadingMateriais(false);
    }
  }, [showToast]);

  const loadAtividades = useCallback(async () => {
    setLoadingAtividades(true);
    try {
      const [occ, sol] = await Promise.all([getAllOcorrencias(), getAllSolicitacoes()]);
      setOcorrencias(occ);
      setSolicitacoes(sol);
    } catch (error: any) {
      showToast({ message: error?.message || 'Não foi possível carregar as atividades.', type: 'error' });
    } finally {
      setLoadingAtividades(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMateriais();
    loadAtividades();
  }, [loadMateriais, loadAtividades]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'ocorrencia') {
        await removeOcorrencia(deleteTarget.id);
      } else {
        await removeSolicitacao(deleteTarget.id);
      }
      showToast({ message: 'Registro removido com sucesso!', type: 'success' });
      setConfirmOpen(false);
      setDeleteTarget(null);
      loadAtividades();
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao excluir.', type: 'error' });
    }
  };

  const activities: ActivityRow[] = useMemo(() => {
    const occRows = ocorrencias.map((data) => ({ type: 'ocorrencia' as const, data }));
    const solRows = solicitacoes.map((data) => ({ type: 'solicitacao' as const, data }));
    return [...occRows, ...solRows].sort((a, b) => {
      const dateA = new Date((a.data as any).data || a.data.created_at).getTime();
      const dateB = new Date((b.data as any).data || b.data.created_at).getTime();
      return dateB - dateA;
    });
  }, [ocorrencias, solicitacoes]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Materiais</h1>
          <p className="text-sm text-gray-500">Controle de equipamentos e patrimônio.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="flex items-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setOccEditing(null);
              setOccModalOpen(true);
            }}
          >
            <Wrench size={16} className="mr-2" /> Problema no equipamento
          </button>
          <button
            className="flex items-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setSolEditing(null);
              setSolModalOpen(true);
            }}
          >
            <ClipboardList size={16} className="mr-2" /> Nova solicitação
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Colaborador</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Entrega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loadingMateriais && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Carregando materiais...
                  </td>
                </tr>
              )}

              {!loadingMateriais && materiais.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Nenhum material cadastrado.
                  </td>
                </tr>
              )}

              {!loadingMateriais &&
                materiais.map((material) => (
                  <tr key={material.id}>
                    <td className="px-4 py-3">{material.nome}</td>
                    <td className="px-4 py-3">{material.tipo}</td>
                    <td className="px-4 py-3">{material.colaborador}</td>
                    <td className="px-4 py-3">{formatDate(material.data_entrega)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-secondary">Solicitações e ocorrências</h2>
            <p className="text-xs text-gray-500">Acompanhe seus pedidos e problemas registrados.</p>
          </div>
        </div>

        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Título/Equipamento</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Data</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Detalhes</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loadingAtividades && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Carregando registros...
                  </td>
                </tr>
              )}

              {!loadingAtividades && activities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Nenhuma solicitação ou ocorrência registrada.</td>
                </tr>
              )}

              {!loadingAtividades &&
                activities.map((activity) => {
                  if (activity.type === 'ocorrencia') {
                    const item = activity.data;
                    return (
                      <tr key={`occ-${item.id}`}>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Ocorrência</span>
                        </td>
                        <td className="px-4 py-3">{item.equipamento}</td>
                        <td className="px-4 py-3">{formatDate(item.data)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.descricao || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                setOccEditing(item);
                                setOccModalOpen(true);
                              }}
                            >
                              <Pencil size={14} className="mr-1 inline" /> Editar
                            </button>
                            <button
                              className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setDeleteTarget({ type: 'ocorrencia', id: item.id });
                                setConfirmOpen(true);
                              }}
                            >
                              <Trash2 size={14} className="mr-1 inline" /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const item = activity.data;
                  return (
                    <tr key={`sol-${item.id}`}>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">Solicitação</span>
                      </td>
                      <td className="px-4 py-3">{item.titulo}</td>
                      <td className="px-4 py-3">{formatDate(item.data)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="capitalize text-gray-800">Urgência: {item.urgencia}</span>
                        <div className="text-xs text-gray-500">{item.materiais_necessarios}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                              setSolEditing(item);
                              setSolModalOpen(true);
                            }}
                          >
                            <Pencil size={14} className="mr-1 inline" /> Editar
                          </button>
                          <button
                            className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setDeleteTarget({ type: 'solicitacao', id: item.id });
                              setConfirmOpen(true);
                            }}
                          >
                            <Trash2 size={14} className="mr-1 inline" /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <OcorrenciaModal
        open={occModalOpen}
        onClose={() => setOccModalOpen(false)}
        onSaved={loadAtividades}
        showToast={showToast}
        initialData={occEditing}
      />

      <SolicitacaoModal
        open={solModalOpen}
        onClose={() => setSolModalOpen(false)}
        onSaved={loadAtividades}
        showToast={showToast}
        initialData={solEditing}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar exclusão"
        description="Deseja excluir este registro?"
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} onClose={clearToast} />
    </div>
  );
}

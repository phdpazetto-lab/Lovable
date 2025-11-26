import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { createSolicitacao, getSolicitacaoById, updateSolicitacao } from '../../services/materiaisSolicitacoesService';

interface FormValues {
  titulo: string;
  materiais_necessarios: string;
  motivo: string;
  data: string;
  urgencia: string;
}

const urgencyOptions = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

export function SolicitacaoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = useMemo(() => Boolean(id), [id]);
  const { toast, showToast, clearToast } = useToast();
  const [loading, setLoading] = useState(isEditing);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      titulo: '',
      materiais_necessarios: '',
      motivo: '',
      data: '',
      urgencia: 'normal',
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      const loadData = async () => {
        try {
          const solicitacao = await getSolicitacaoById(Number(id));
          reset({
            titulo: solicitacao.titulo || '',
            materiais_necessarios: solicitacao.materiais_necessarios || '',
            motivo: solicitacao.motivo || '',
            data: solicitacao.data || '',
            urgencia: solicitacao.urgencia || 'normal',
          });
        } catch (error: any) {
          showToast({ message: error?.message || 'Solicitação não encontrada.', type: 'error' });
          navigate('/materiais/solicitacoes');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id, isEditing, navigate, reset, showToast]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        titulo: values.titulo,
        materiais_necessarios: values.materiais_necessarios,
        motivo: values.motivo,
        data: values.data || undefined,
        urgencia: values.urgencia,
      };

      if (isEditing && id) {
        await updateSolicitacao(Number(id), payload);
        showToast({ message: 'Solicitação atualizada com sucesso!', type: 'success' });
      } else {
        await createSolicitacao(payload);
        showToast({ message: 'Solicitação criada com sucesso!', type: 'success' });
      }

      navigate('/materiais/solicitacoes');
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao salvar solicitação.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">{isEditing ? 'Editar solicitação' : 'Nova solicitação'}</h1>
          <p className="text-sm text-gray-500">Peça materiais, descrevendo o motivo e urgência.</p>
        </div>
      </div>

      <div className="card p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium text-gray-700">Título *</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('titulo', { required: 'Título é obrigatório' })}
                placeholder="Resumo da solicitação"
              />
              {errors.titulo && <p className="text-xs text-red-500">{errors.titulo.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Materiais necessários *</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...register('materiais_necessarios', { required: 'Informe os materiais' })}
                placeholder="Liste os itens desejados"
              />
              {errors.materiais_necessarios && <p className="text-xs text-red-500">{errors.materiais_necessarios.message}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Motivo *</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('motivo', { required: 'Motivo é obrigatório' })}
                  placeholder="Justifique a necessidade"
                />
                {errors.motivo && <p className="text-xs text-red-500">{errors.motivo.message}</p>}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    {...register('data')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Urgência *</label>
                  <select
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    {...register('urgencia', { required: 'Urgência é obrigatória' })}
                  >
                    {urgencyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.urgencia && <p className="text-xs text-red-500">{errors.urgencia.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => navigate('/materiais/solicitacoes')}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </div>

      <Toast toast={toast} onClose={clearToast} />
    </div>
  );
}

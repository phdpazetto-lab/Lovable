import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { createNota, getNotaById, updateNota } from '../../services/notasService';

interface FormValues {
  numero: string;
  emissor: string;
  tomador: string;
  valor: number | string;
  data_emissao: string;
  descricao: string;
}

export function NotaForm() {
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
      numero: '',
      emissor: '',
      tomador: '',
      valor: '',
      data_emissao: '',
      descricao: '',
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchData = async () => {
        try {
          const nota = await getNotaById(Number(id));
          reset({
            numero: nota.numero || '',
            emissor: nota.emissor || '',
            tomador: nota.tomador || '',
            valor: nota.valor || '',
            data_emissao: nota.data_emissao || '',
            descricao: nota.descricao || '',
          });
        } catch (error: any) {
          showToast({ message: error?.message || 'Nota não encontrada.', type: 'error' });
          navigate('/notas');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isEditing, navigate, reset, showToast]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        numero: values.numero,
        emissor: values.emissor,
        tomador: values.tomador,
        valor: Number(values.valor),
        data_emissao: values.data_emissao || undefined,
        descricao: values.descricao || '',
      };

      if (isEditing && id) {
        await updateNota(Number(id), payload);
        showToast({ message: 'Nota atualizada com sucesso!', type: 'success' });
      } else {
        await createNota(payload);
        showToast({ message: 'Nota criada com sucesso!', type: 'success' });
      }

      navigate('/notas');
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao salvar nota.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-secondary">{isEditing ? 'Editar nota' : 'Nova nota'}</h1>
        <p className="text-sm text-gray-500">Informe os dados da nota fiscal.</p>
      </div>

      <div className="card p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Número *</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('numero', { required: 'Número é obrigatório' })}
                  placeholder="NF-0001"
                />
                {errors.numero && <p className="text-xs text-red-500">{errors.numero.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Emissor *</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('emissor', { required: 'Emissor é obrigatório' })}
                  placeholder="Empresa emissora"
                />
                {errors.emissor && <p className="text-xs text-red-500">{errors.emissor.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Tomador *</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('tomador', { required: 'Tomador é obrigatório' })}
                  placeholder="Cliente / tomador"
                />
                {errors.tomador && <p className="text-xs text-red-500">{errors.tomador.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('valor', {
                    required: 'Valor é obrigatório',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Valor deve ser positivo' },
                  })}
                  placeholder="0,00"
                />
                {errors.valor && <p className="text-xs text-red-500">{errors.valor.message as string}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Data de emissão *</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('data_emissao', { required: 'Data de emissão é obrigatória' })}
                />
                {errors.data_emissao && <p className="text-xs text-red-500">{errors.data_emissao.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('descricao')}
                  placeholder="Observações adicionais"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => navigate('/notas')}
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

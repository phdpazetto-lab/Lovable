import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import {
  createDespesa,
  getDespesaById,
  updateDespesa,
  uploadDespesaComprovante,
} from '../../services/despesasService';

interface FormValues {
  titulo: string;
  valor: number | string;
  categoria: string;
  data: string;
  descricao: string;
  comprovante?: FileList;
}

const categories = ['Transporte', 'Alimentação', 'Hospedagem', 'Serviços', 'Outros'];
const MAX_FILE_SIZE_MB = 10;

export function DespesaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = useMemo(() => Boolean(id), [id]);
  const { toast, showToast, clearToast } = useToast();
  const [loading, setLoading] = useState(isEditing);
  const [comprovanteUrl, setComprovanteUrl] = useState<string | null>(null);
  const [removeFile, setRemoveFile] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      titulo: '',
      valor: '',
      categoria: '',
      data: '',
      descricao: '',
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchData = async () => {
        try {
          const despesa = await getDespesaById(Number(id));
          reset({
            titulo: despesa.titulo || '',
            valor: despesa.valor || '',
            categoria: despesa.categoria || '',
            data: despesa.data || '',
            descricao: despesa.descricao || '',
          });
          setComprovanteUrl(despesa.comprovante_url || null);
        } catch (error: any) {
          showToast({ message: error?.message || 'Despesa não encontrada.', type: 'error' });
          navigate('/despesas');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isEditing, navigate, reset, showToast]);

  const fileList = watch('comprovante');

  const onSubmit = async (values: FormValues) => {
    try {
      let comprovantePublicUrl = comprovanteUrl;

      const file = values.comprovante?.item(0);
      if (file) {
        if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
          showToast({ message: `Arquivo deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`, type: 'error' });
          return;
        }
        const { publicUrl } = await uploadDespesaComprovante(file);
        comprovantePublicUrl = publicUrl;
      }

      if (removeFile) {
        comprovantePublicUrl = null;
      }

      const payload = {
        titulo: values.titulo,
        valor: Number(values.valor),
        categoria: values.categoria || undefined,
        data: values.data || undefined,
        descricao: values.descricao || '',
        comprovante_url: comprovantePublicUrl,
      };

      if (isEditing && id) {
        await updateDespesa(Number(id), payload);
        showToast({ message: 'Despesa atualizada com sucesso!', type: 'success' });
      } else {
        await createDespesa(payload);
        showToast({ message: 'Despesa criada com sucesso!', type: 'success' });
      }

      navigate('/despesas');
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao salvar despesa.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">{isEditing ? 'Editar despesa' : 'Nova despesa'}</h1>
          <p className="text-sm text-gray-500">Preencha os dados da despesa.</p>
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
                placeholder="Descreva a despesa"
              />
              {errors.titulo && <p className="text-xs text-red-500">{errors.titulo.message}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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

              <div>
                <label className="text-sm font-medium text-gray-700">Categoria *</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('categoria', { required: 'Categoria é obrigatória' })}
                >
                  <option value="">Selecione</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.categoria && <p className="text-xs text-red-500">{errors.categoria.message}</p>}
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
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('descricao')}
                  placeholder="Detalhes adicionais"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Comprovante (imagem ou PDF)</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                {...register('comprovante')}
                className="block w-full text-sm"
              />
              {fileList?.item(0) && (
                <p className="text-xs text-gray-500">Arquivo selecionado: {fileList.item(0)?.name}</p>
              )}
              {comprovanteUrl && !fileList?.length && !removeFile && (
                <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
                  <a href={comprovanteUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                    Ver comprovante atual
                  </a>
                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                    onClick={() => setRemoveFile(true)}
                  >
                    Remover
                  </button>
                </div>
              )}
              {removeFile && <p className="text-xs text-amber-600">O comprovante será removido ao salvar.</p>}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => navigate('/despesas')}
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

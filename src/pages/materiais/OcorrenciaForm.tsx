import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import {
  createOcorrencia,
  getOcorrenciaById,
  updateOcorrencia,
  uploadOcorrenciaFiles,
} from '../../services/materiaisOcorrenciasService';

interface FormValues {
  equipamento: string;
  patrimonio: string;
  data: string;
  descricao: string;
  anexos?: FileList;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;

export function OcorrenciaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = useMemo(() => Boolean(id), [id]);
  const { toast, showToast, clearToast } = useToast();
  const [loading, setLoading] = useState(isEditing);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [removeAttachments, setRemoveAttachments] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      equipamento: '',
      patrimonio: '',
      data: '',
      descricao: '',
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      const loadData = async () => {
        try {
          const ocorrencia = await getOcorrenciaById(Number(id));
          reset({
            equipamento: ocorrencia.equipamento || '',
            patrimonio: ocorrencia.patrimonio || '',
            data: ocorrencia.data || '',
            descricao: ocorrencia.descricao || '',
          });
          setExistingAttachments(ocorrencia.anexos || []);
        } catch (error: any) {
          showToast({ message: error?.message || 'Ocorrência não encontrada.', type: 'error' });
          navigate('/materiais/ocorrencias');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id, isEditing, navigate, reset, showToast]);

  const files = watch('anexos');

  const onSubmit = async (values: FormValues) => {
    try {
      let anexos: string[] = removeAttachments ? [] : existingAttachments;
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
        anexos = await uploadOcorrenciaFiles(filesArray);
      }

      const payload = {
        equipamento: values.equipamento,
        patrimonio: values.patrimonio,
        data: values.data || undefined,
        descricao: values.descricao || '',
        anexos,
      };

      if (isEditing && id) {
        await updateOcorrencia(Number(id), payload);
        showToast({ message: 'Ocorrência atualizada com sucesso!', type: 'success' });
      } else {
        await createOcorrencia(payload);
        showToast({ message: 'Ocorrência registrada com sucesso!', type: 'success' });
      }

      navigate('/materiais/ocorrencias');
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao salvar ocorrência.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">{isEditing ? 'Editar ocorrência' : 'Nova ocorrência'}</h1>
          <p className="text-sm text-gray-500">Informe o problema encontrado no equipamento.</p>
        </div>
      </div>

      <div className="card p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
              {files?.length ? (
                <p className="text-xs text-gray-500">{files.length} arquivo(s) selecionado(s)</p>
              ) : null}
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
                onClick={() => navigate('/materiais/ocorrencias')}
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

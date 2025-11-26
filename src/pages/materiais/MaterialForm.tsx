import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { createMaterial, getMaterialById, updateMaterial } from '../../services/materiaisService';

interface FormValues {
  nome: string;
  tipo: string;
  numero_serie: string;
  colaborador: string;
  data_entrega: string;
}

export function MaterialForm() {
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
      nome: '',
      tipo: '',
      numero_serie: '',
      colaborador: '',
      data_entrega: '',
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchData = async () => {
        try {
          const material = await getMaterialById(Number(id));
          reset({
            nome: material.nome || '',
            tipo: material.tipo || '',
            numero_serie: material.numero_serie || '',
            colaborador: material.colaborador || '',
            data_entrega: material.data_entrega || '',
          });
        } catch (error: any) {
          showToast({ message: error?.message || 'Material não encontrado.', type: 'error' });
          navigate('/materiais');
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
        nome: values.nome,
        tipo: values.tipo,
        numero_serie: values.numero_serie,
        colaborador: values.colaborador,
        data_entrega: values.data_entrega || undefined,
      };

      if (isEditing && id) {
        await updateMaterial(Number(id), payload);
        showToast({ message: 'Material atualizado com sucesso!', type: 'success' });
      } else {
        await createMaterial(payload);
        showToast({ message: 'Material criado com sucesso!', type: 'success' });
      }

      navigate('/materiais');
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao salvar material.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-secondary">{isEditing ? 'Editar material' : 'Novo material'}</h1>
        <p className="text-sm text-gray-500">Registre os dados do material/patrimônio.</p>
      </div>

      <div className="card p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome *</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  placeholder="Notebook, celular..."
                />
                {errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Tipo *</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('tipo', { required: 'Tipo é obrigatório' })}
                  placeholder="Equipamento, mobiliário, etc"
                />
                {errors.tipo && <p className="text-xs text-red-500">{errors.tipo.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Número de série *</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('numero_serie', { required: 'Número de série é obrigatório' })}
                  placeholder="SN123456"
                />
                {errors.numero_serie && <p className="text-xs text-red-500">{errors.numero_serie.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Colaborador responsável *</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('colaborador', { required: 'Colaborador é obrigatório' })}
                  placeholder="Nome do colaborador"
                />
                {errors.colaborador && <p className="text-xs text-red-500">{errors.colaborador.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Data de entrega *</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...register('data_entrega', { required: 'Data de entrega é obrigatória' })}
                />
                {errors.data_entrega && <p className="text-xs text-red-500">{errors.data_entrega.message}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => navigate('/materiais')}
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

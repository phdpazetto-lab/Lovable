import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { Despesa, getAllDespesas, removeDespesa } from '../../services/despesasService';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

export function DespesasPage() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadDespesas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllDespesas();
      setDespesas(data);
    } catch (error: any) {
      showToast({ message: error?.message || 'Não foi possível carregar as despesas.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDespesas();
  }, [loadDespesas]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await removeDespesa(deletingId);
      showToast({ message: 'Despesa excluída com sucesso!', type: 'success' });
      setConfirmOpen(false);
      setDeletingId(null);
      loadDespesas();
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao excluir despesa.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Despesas</h1>
          <p className="text-sm text-gray-500">Cadastre e gerencie suas despesas.</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => navigate('/despesas/novo')}
        >
          <Plus size={16} className="mr-2" /> Nova despesa
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Título</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Categoria</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Data</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Comprovante</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Valor</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Carregando despesas...
                  </td>
                </tr>
              )}

              {!loading && despesas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Nenhuma despesa encontrada.
                  </td>
                </tr>
              )}

              {!loading &&
                despesas.map((despesa) => (
                  <tr key={despesa.id}>
                    <td className="px-4 py-3">{despesa.titulo}</td>
                    <td className="px-4 py-3">{despesa.categoria || '-'}</td>
                    <td className="px-4 py-3">{formatDate(despesa.data)}</td>
                    <td className="px-4 py-3">
                      {despesa.comprovante_url ? (
                        <a
                          className="text-primary underline"
                          href={despesa.comprovante_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(despesa.valor)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => navigate(`/despesas/${despesa.id}`)}
                        >
                          <Pencil size={14} className="mr-1 inline" /> Editar
                        </button>
                        <button
                          className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDeletingId(despesa.id);
                            setConfirmOpen(true);
                          }}
                        >
                          <Trash2 size={14} className="mr-1 inline" /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir esta despesa? Esta ação não poderá ser desfeita."
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} onClose={clearToast} />
    </div>
  );
}

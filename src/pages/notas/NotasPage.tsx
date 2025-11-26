import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { Nota, getAllNotas, removeNota } from '../../services/notasService';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

export function NotasPage() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadNotas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllNotas();
      setNotas(data);
    } catch (error: any) {
      showToast({ message: error?.message || 'Não foi possível carregar as notas.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadNotas();
  }, [loadNotas]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await removeNota(deletingId);
      showToast({ message: 'Nota excluída com sucesso!', type: 'success' });
      setConfirmOpen(false);
      setDeletingId(null);
      loadNotas();
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao excluir nota.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Notas</h1>
          <p className="text-sm text-gray-500">Cadastre suas notas fiscais.</p>
        </div>
        <button className="button button-primary" onClick={() => navigate('/notas/novo')}>
          <Plus size={16} className="mr-2" /> Nova nota
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Número</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Competência</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Data de emissão</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">NF</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Valor</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Carregando notas...
                  </td>
                </tr>
              )}

              {!loading && notas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Nenhuma nota encontrada.
                  </td>
                </tr>
              )}

              {!loading &&
                notas.map((nota) => (
                  <tr key={nota.id}>
                    <td className="px-4 py-3">{nota.numero}</td>
                    <td className="px-4 py-3">{nota.competencia || '-'}</td>
                    <td className="px-4 py-3">{formatDate(nota.data_emissao)}</td>
                    <td className="px-4 py-3">
                      {nota.nf_url ? (
                        <a className="text-primary underline" href={nota.nf_url} target="_blank" rel="noreferrer">
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(nota.valor)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => navigate(`/notas/${nota.id}`)}
                        >
                          <Pencil size={14} className="mr-1 inline" /> Editar
                        </button>
                        <button
                          className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDeletingId(nota.id);
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
        description="Deseja excluir esta nota?"
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

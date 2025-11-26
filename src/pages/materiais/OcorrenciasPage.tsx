import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { MaterialOcorrencia, getAllOcorrencias, removeOcorrencia } from '../../services/materiaisOcorrenciasService';

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

export function OcorrenciasPage() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();
  const [ocorrencias, setOcorrencias] = useState<MaterialOcorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllOcorrencias();
      setOcorrencias(data);
    } catch (error: any) {
      showToast({ message: error?.message || 'Não foi possível carregar as ocorrências.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await removeOcorrencia(deletingId);
      showToast({ message: 'Ocorrência excluída com sucesso!', type: 'success' });
      setConfirmOpen(false);
      setDeletingId(null);
      loadData();
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao excluir ocorrência.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Ocorrências</h1>
          <p className="text-sm text-gray-500">Registre problemas com o equipamento.</p>
        </div>
        <button className="button button-primary" onClick={() => navigate('/materiais/ocorrencias/novo')}>
          <Plus size={16} className="mr-2" /> Registrar ocorrência
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Equipamento</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Patrimônio</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Data</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Anexos</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Carregando ocorrências...
                  </td>
                </tr>
              )}

              {!loading && ocorrencias.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Nenhuma ocorrência registrada.</td>
                </tr>
              )}

              {!loading &&
                ocorrencias.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">{item.equipamento}</td>
                    <td className="px-4 py-3">{item.patrimonio}</td>
                    <td className="px-4 py-3">{formatDate(item.data)}</td>
                    <td className="px-4 py-3">{item.anexos?.length || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => navigate(`/materiais/ocorrencias/${item.id}`)}
                        >
                          <Pencil size={14} className="mr-1 inline" /> Editar
                        </button>
                        <button
                          className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDeletingId(item.id);
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
        description="Deseja excluir esta ocorrência?"
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

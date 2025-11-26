import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { Material, getAllMateriais, removeMaterial } from '../../services/materiaisService';

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

export function MateriaisPage() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadMateriais = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllMateriais();
      setMateriais(data);
    } catch (error: any) {
      showToast({ message: error?.message || 'Não foi possível carregar os materiais.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMateriais();
  }, [loadMateriais]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await removeMaterial(deletingId);
      showToast({ message: 'Material excluído com sucesso!', type: 'success' });
      setConfirmOpen(false);
      setDeletingId(null);
      loadMateriais();
    } catch (error: any) {
      showToast({ message: error?.message || 'Erro ao excluir material.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Materiais</h1>
          <p className="text-sm text-gray-500">Controle de equipamentos e patrimônio.</p>
        </div>
        <button className="button button-primary" onClick={() => navigate('/materiais/novo')}>
          <Plus size={16} className="mr-2" /> Novo material
        </button>
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
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Carregando materiais...
                  </td>
                </tr>
              )}

              {!loading && materiais.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Nenhum material cadastrado.
                  </td>
                </tr>
              )}

              {!loading &&
                materiais.map((material) => (
                  <tr key={material.id}>
                    <td className="px-4 py-3">{material.nome}</td>
                    <td className="px-4 py-3">{material.tipo}</td>
                    <td className="px-4 py-3">{material.colaborador}</td>
                    <td className="px-4 py-3">{formatDate(material.data_entrega)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => navigate(`/materiais/${material.id}`)}
                        >
                          <Pencil size={14} className="mr-1 inline" /> Editar
                        </button>
                        <button
                          className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDeletingId(material.id);
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
        description="Deseja excluir este material?"
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

import { useEffect, useState } from 'react';
import { Loader2, Paperclip, Pencil, Plus, UploadCloud, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  Expense,
  createExpense,
  deleteComprovante,
  deleteExpense,
  formatCurrency,
  getComprovanteSignedUrl,
  listExpenses,
  updateExpense,
  uploadComprovante,
} from '../services/despesasService';
import { DespesaForm, type ExpenseFormValues } from './despesas/DespesaForm';

export function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [existingComprovanteUrl, setExistingComprovanteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const data = await listExpenses(user.id);
        setExpenses(data);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar as despesas');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
    setExistingComprovanteUrl(null);
  };

  const handleNewExpense = () => {
    setEditingExpense(null);
    setExistingComprovanteUrl(null);
    setIsFormOpen(true);
  };

  const handleEditExpense = async (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
    setExistingComprovanteUrl(null);
    if (expense.comprovante_url) {
      try {
        const signed = await getComprovanteSignedUrl(expense.comprovante_url);
        setExistingComprovanteUrl(signed);
      } catch (err) {
        console.error(err);
        setExistingComprovanteUrl(null);
      }
    }
  };

  const handleSubmitExpense = async (values: ExpenseFormValues, comprovante?: File | null, removeExisting?: boolean) => {
    if (!user) return;

    try {
      setSubmitting(true);
      setError(null);
      let comprovantePath = editingExpense?.comprovante_url ?? null;

      if (comprovante) {
        comprovantePath = await uploadComprovante(comprovante, user.id, values.date || values.reference_month);
        if (editingExpense?.comprovante_url && editingExpense.comprovante_url !== comprovantePath) {
          await deleteComprovante(editingExpense.comprovante_url);
        }
      } else if (removeExisting && editingExpense?.comprovante_url) {
        await deleteComprovante(editingExpense.comprovante_url);
        comprovantePath = null;
      }

      const payload = {
        ...values,
        cost_center: values.cost_center ? values.cost_center : null,
        comprovante_url: comprovantePath,
      };
      const saved = editingExpense
        ? await updateExpense(editingExpense.id, payload)
        : await createExpense(user.id, payload);

      setExpenses((prev) => {
        if (editingExpense) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...prev];
      });

      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Erro ao salvar a despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenComprovante = async (expense: Expense) => {
    if (!expense.comprovante_url) return;
    try {
      const signed = await getComprovanteSignedUrl(expense.comprovante_url);
      if (signed) window.open(signed, '_blank');
    } catch (err) {
      console.error(err);
      setError('Não foi possível abrir o comprovante');
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    const confirmed = window.confirm('Tem certeza que deseja excluir esta despesa?');
    if (!confirmed) return;

    try {
      setSubmitting(true);
      await deleteExpense(expense.id);
      if (expense.comprovante_url) {
        await deleteComprovante(expense.comprovante_url);
      }
      setExpenses((prev) => prev.filter((item) => item.id !== expense.id));
    } catch (err) {
      console.error(err);
      setError('Não foi possível excluir a despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return 'bg-emerald-50 text-emerald-700';
      case 'REJEITADO':
        return 'bg-red-50 text-red-700';
      case 'PAGO':
        return 'bg-indigo-50 text-indigo-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Despesas</h1>
          <p className="text-sm text-gray-500">Cadastre novas despesas e acompanhe o status de aprovação.</p>
        </div>
        <div className="flex gap-2">
          <button className="button bg-white text-gray-700 hover:bg-gray-100" type="button">
            <UploadCloud size={16} className="mr-2" /> Importar CSV
          </button>
          <button className="button button-primary" type="button" onClick={handleNewExpense}>
            <Plus size={16} className="mr-2" /> Nova Despesa
          </button>
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {isFormOpen && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary">
              {editingExpense ? 'Editar despesa' : 'Nova despesa'}
            </h2>
            <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-700" aria-label="Fechar formulário">
              <X size={18} />
            </button>
          </div>
          <DespesaForm
            initialData={editingExpense}
            existingComprovanteUrl={existingComprovanteUrl}
            onSubmit={handleSubmitExpense}
            onCancel={resetForm}
            submitting={submitting}
          />
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-secondary">Minhas despesas</h2>
            <p className="text-xs text-gray-500">Visualize comprovantes e atualize suas solicitações.</p>
          </div>
          {loading && <Loader2 className="animate-spin text-gray-500" size={18} />}
        </div>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Data</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Categoria</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Descrição</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Valor</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Comprovante</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {expenses.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                  Nenhuma despesa cadastrada até o momento.
                </td>
              </tr>
            )}
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{expense.date}</td>
                <td className="px-4 py-3">{expense.category}</td>
                <td className="px-4 py-3">{expense.description}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(expense.status)}`}>
                    {expense.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {expense.comprovante_url ? (
                    <button
                      type="button"
                      onClick={() => handleOpenComprovante(expense)}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      <Paperclip size={14} /> Abrir
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Nenhum</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditExpense(expense)}
                      className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      disabled={submitting}
                    >
                      <Pencil size={14} className="mr-1" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(expense)}
                      className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                      disabled={submitting}
                    >
                      <X size={14} className="mr-1" /> Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

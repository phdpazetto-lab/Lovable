import { Plus, UploadCloud } from 'lucide-react';

const mockExpenses = [
  { id: 1, date: '2024-09-02', category: 'Transporte', description: 'Uber reunião', amount: 52.5, status: 'PENDENTE' },
  { id: 2, date: '2024-09-03', category: 'Alimentação', description: 'Almoço cliente', amount: 98.4, status: 'APROVADO' },
];

export function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Despesas</h1>
          <p className="text-sm text-gray-500">Cadastre novas despesas e acompanhe o status de aprovação.</p>
        </div>
        <div className="flex gap-2">
          <button className="button bg-white text-gray-700 hover:bg-gray-100">
            <UploadCloud size={16} className="mr-2" /> Importar CSV
          </button>
          <button className="button button-primary">
            <Plus size={16} className="mr-2" /> Nova Despesa
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Data</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Categoria</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Descrição</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Valor</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {mockExpenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-3">{expense.date}</td>
                <td className="px-4 py-3">{expense.category}</td>
                <td className="px-4 py-3">{expense.description}</td>
                <td className="px-4 py-3 text-right">R$ {expense.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {expense.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

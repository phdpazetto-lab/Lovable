import { CheckCircle2, CircleSlash, DollarSign } from 'lucide-react';

const adminReports = [
  { id: 1, user: 'João Silva', month: '2024-08-01', total: 1234.5, status: 'EM_ANALISE' },
  { id: 2, user: 'Maria Souza', month: '2024-07-01', total: 980.1, status: 'APROVADO' },
];

export function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-secondary">Aprovação de Relatórios</h1>
        <p className="text-sm text-gray-500">Aprove, rejeite ou marque como pago os relatórios mensais.</p>
      </header>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Usuário</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Mês</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {adminReports.map((report) => (
              <tr key={report.id}>
                <td className="px-4 py-3">{report.user}</td>
                <td className="px-4 py-3">{report.month}</td>
                <td className="px-4 py-3 text-right">R$ {report.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">{report.status}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="button bg-white text-success hover:bg-green-50">
                      <CheckCircle2 size={16} className="mr-2" /> Aprovar
                    </button>
                    <button className="button bg-white text-danger hover:bg-red-50">
                      <CircleSlash size={16} className="mr-2" /> Rejeitar
                    </button>
                    <button className="button bg-white text-primary hover:bg-blue-50">
                      <DollarSign size={16} className="mr-2" /> Pago
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

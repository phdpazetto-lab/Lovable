import { Download, History } from 'lucide-react';

const reports = [
  { id: 1, month: '2024-08-01', total: 1234.5, status: 'EM_ANALISE', updated_at: '2024-09-05' },
  { id: 2, month: '2024-07-01', total: 980.1, status: 'PAGO', updated_at: '2024-08-10' },
];

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Meus Relatórios</h1>
          <p className="text-sm text-gray-500">Acompanhe os PDFs mensais e status de aprovação.</p>
        </div>
      </header>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Mês</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Última atualização</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-4 py-3">{report.month}</td>
                <td className="px-4 py-3 text-right">R$ {report.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">{report.status}</td>
                <td className="px-4 py-3">{report.updated_at}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="button bg-white text-gray-700 hover:bg-gray-100">
                      <Download size={16} className="mr-2" /> PDF
                    </button>
                    <button className="button bg-white text-gray-700 hover:bg-gray-100">
                      <History size={16} className="mr-2" /> Detalhes
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

import { FileUp } from 'lucide-react';

const mockInvoices = [
  { id: 1, reference_month: '2024-08-01', invoice_number: 'NF-1209', amount: 5000, status: 'EM_ANALISE' },
  { id: 2, reference_month: '2024-07-01', invoice_number: 'NF-1208', amount: 4800, status: 'PAGA' },
];

export function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Notas Fiscais</h1>
          <p className="text-sm text-gray-500">Envie e acompanhe suas notas fiscais para pagamento PJ.</p>
        </div>
        <button className="button button-primary">
          <FileUp size={16} className="mr-2" /> Enviar Nota Fiscal
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Mês Ref.</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Número</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Valor</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {mockInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-4 py-3">{invoice.reference_month}</td>
                <td className="px-4 py-3">{invoice.invoice_number}</td>
                <td className="px-4 py-3 text-right">R$ {invoice.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    {invoice.status}
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

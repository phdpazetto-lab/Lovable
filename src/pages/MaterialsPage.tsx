const agreements = [
  { id: 1, title: 'Termo Notebook Dell', file_name: 'termo-dell.pdf', signed_at: '2024-02-10' },
  { id: 2, title: 'Termo Monitor 27', file_name: 'termo-monitor.pdf', signed_at: null },
];

const requests = [
  { id: 1, title: 'Substituição notebook', type: 'SUBSTITUICAO', status: 'EM_ANALISE', priority: 'ALTA' },
  { id: 2, title: 'Manutenção headset', type: 'MANUTENCAO', status: 'EM_ANDAMENTO', priority: 'MEDIA' },
];

export function MaterialsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-secondary">Materiais</h1>
        <p className="text-sm text-gray-500">Termos de comodato e solicitações de materiais.</p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Termos de Comodato</h2>
          <button className="button button-primary">Assinar novo termo</button>
        </div>
        <div className="card divide-y divide-gray-100">
          {agreements.map((agreement) => (
            <div key={agreement.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{agreement.title}</div>
                <div className="text-sm text-gray-500">{agreement.file_name}</div>
              </div>
              <div className="text-sm text-gray-600">
                {agreement.signed_at ? `Assinado em ${agreement.signed_at}` : 'Aguardando assinatura'}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Solicitações de Materiais</h2>
          <button className="button button-primary">Nova solicitação</button>
        </div>
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Título</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Prioridade</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-3">{request.title}</td>
                  <td className="px-4 py-3">{request.type}</td>
                  <td className="px-4 py-3">{request.priority}</td>
                  <td className="px-4 py-3">{request.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

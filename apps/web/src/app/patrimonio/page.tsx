const assetStatuses = [
  { label: 'Ativo', description: 'Equipamento disponível e em operação dentro do hub.' },
  { label: 'Emprestado', description: 'Cedido temporariamente a outro hub ou colaborador.' },
  { label: 'Manutenção', description: 'Em processo de reparo ou vistoria técnica.' },
  { label: 'Inativo', description: 'Descontinuado ou aguardando baixa contábil.' }
];

export default function PatrimonioPage() {
  return (
    <main className="space-y-6 p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Gestão de Patrimônio</h1>
        <p className="text-sm text-slate-600">
          Controle ativos físicos por hub, responsáveis e histórico de movimentações sincronizado com o Google Sheets.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-800">Status Operacionais</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {assetStatuses.map((status) => (
            <article key={status.label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-800">{status.label}</h3>
              <p className="mt-2 text-sm text-slate-600">{status.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        <p>
          Utilize a tabela <code>assets</code> para registrar dados mestre (tag, categoria, valor) e a tabela{' '}
          <code>asset_movements</code> para acompanhar transferências entre hubs. Coordenadores possuem permissão para editar e
          movimentar ativos locais, enquanto administradores enxergam todas as unidades.
        </p>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <main className="space-y-6 p-8">
      <header>
        <h2 className="text-xl font-semibold">Dashboard Operacional</h2>
        <p className="text-sm text-slate-600">
          Resumo dos principais indicadores financeiros e de patrimônio por hub.
        </p>
      </header>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600">Receitas</h3>
          <p className="mt-2 text-2xl font-semibold">R$ 0,00</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600">Despesas</h3>
          <p className="mt-2 text-2xl font-semibold">R$ 0,00</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600">Resultado</h3>
          <p className="mt-2 text-2xl font-semibold">R$ 0,00</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600">Ativos em uso</h3>
          <p className="mt-2 text-2xl font-semibold">0 itens</p>
        </article>
      </section>
    </main>
  );
}

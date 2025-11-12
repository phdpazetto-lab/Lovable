export default function AdiantamentosPage() {
  return (
    <main className="space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold">Adiantamentos</h1>
        <p className="text-sm text-slate-600">
          Controle liberações antecipadas para prestadores, com etapas de aprovação, liberação e baixa.
        </p>
      </header>
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        <p>
          Utilize o estado da entidade <code>advances</code> para guiar o funil (pending → approved → released → settled) e
          sincronize eventos relevantes com o Google Sheets quando necessário.
        </p>
      </section>
    </main>
  );
}

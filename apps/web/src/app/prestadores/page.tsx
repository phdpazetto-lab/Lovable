export default function PrestadoresPage() {
  return (
    <main className="space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold">Prestadores</h1>
        <p className="text-sm text-slate-600">
          Centralize o cadastro de fornecedores PJ com vínculos a hubs e contratos vigentes.
        </p>
      </header>
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        <p>
          Estruture formulários e tabelas alimentados pelas tabelas <code>providers</code> e <code>contracts</code> para garantir
          governança dos dados dos prestadores.
        </p>
      </section>
    </main>
  );
}

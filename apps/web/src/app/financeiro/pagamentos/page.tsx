export default function PagamentosPage() {
  return (
    <main className="space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold">Pagamentos</h1>
        <p className="text-sm text-slate-600">
          Registre liberações financeiras e concilie comprovantes vinculados às notas fiscais aprovadas.
        </p>
      </header>
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        <p>
          Estruture componentes para listar pagamentos e permitir uploads seguros para <code>proof_url</code> utilizando o
          Storage do Supabase ou o Google Drive.
        </p>
      </section>
    </main>
  );
}

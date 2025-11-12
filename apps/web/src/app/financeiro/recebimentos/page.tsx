export default function RecebimentosPage() {
  return (
    <main className="space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold">Recebimentos de Notas Fiscais</h1>
        <p className="text-sm text-slate-600">
          Cadastre e acompanhe as notas fiscais de prestadores vinculadas aos hubs autorizados.
        </p>
      </header>
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        <p>
          Este é um esqueleto inicial. Utilize chamadas para Edge Functions do Supabase para criar, atualizar e sincronizar
          registros de <code>ap_invoices</code> com Google Sheets.
        </p>
      </section>
    </main>
  );
}

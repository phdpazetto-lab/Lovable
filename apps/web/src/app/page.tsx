import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold">StarMKT OS</h1>
      <p className="max-w-2xl text-balance text-slate-600">
        Plataforma operacional com autenticação via Supabase, fluxos financeiros hierárquicos e módulo de patrimônio integrado ao
        Google Sheets.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/login" className="rounded-xl border px-4 py-2">
          Acessar login
        </Link>
        <Link href="/dashboard" className="rounded-xl border px-4 py-2">
          Ver dashboard
        </Link>
        <Link href="/financeiro/reembolsos/aprovacoes" className="rounded-xl border px-4 py-2">
          Workflow de reembolsos
        </Link>
        <Link href="/patrimonio" className="rounded-xl border px-4 py-2">
          Gestão de patrimônio
        </Link>
      </div>
    </main>
  );
}

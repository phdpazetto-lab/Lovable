import Link from 'next/link';

const links = [
  { href: '/financeiro/recebimentos', label: 'Recebimentos (NF)' },
  { href: '/financeiro/pagamentos', label: 'Pagamentos' },
  { href: '/financeiro/reembolsos', label: 'Reembolsos' },
  { href: '/financeiro/reembolsos/aprovacoes', label: 'Pipeline de aprovações' },
  { href: '/financeiro/adiantamentos', label: 'Adiantamentos' }
];

export default function FinanceiroPage() {
  return (
    <main className="space-y-8 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Módulo Financeiro</h1>
        <p className="text-sm text-slate-600">
          Acesse os submódulos para gerenciar notas fiscais, pagamentos, reembolsos, aprovações hierárquicas e adiantamentos.
        </p>
      </header>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
          >
            <h2 className="text-lg font-semibold">{link.label}</h2>
            <p className="mt-2 text-sm text-slate-600">Fluxos operacionais iniciais para {link.label.toLowerCase()}.</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

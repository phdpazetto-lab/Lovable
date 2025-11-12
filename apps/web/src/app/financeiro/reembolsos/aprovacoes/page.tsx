import Link from 'next/link';

const approvalColumns = [
  {
    title: 'Coordenador',
    description:
      'Aprova solicitações do hub, valida notas fiscais anexas e indica o responsável local. Pode devolver para ajustes.'
  },
  {
    title: 'Financeiro',
    description:
      'Confere centro de custo, calcula impostos e prepara o pagamento. Atualiza status para "awaiting_juridico" ou rejeita.'
  },
  {
    title: 'Jurídico',
    description:
      'Realiza auditoria documental, verifica contratos vigentes e sinaliza conformidade antes da liquidação.'
  }
];

export default function ReembolsoAprovacoesPage() {
  return (
    <main className="space-y-8 p-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold">Aprovações de Reembolsos</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Painel consolidado para times coordenador, financeiro e jurídico atuarem em sequência. Utilize filtros por HUB e status
          para priorizar demandas críticas.
        </p>
        <p className="text-xs text-slate-500">
          Consulte a visão geral do fluxo em{' '}
          <Link href="/financeiro/reembolsos" className="text-sky-600 hover:underline">
            /financeiro/reembolsos
          </Link>
          .
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {approvalColumns.map((column) => (
          <article key={column.title} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">{column.title}</h2>
            <p className="mt-3 text-sm text-slate-600">{column.description}</p>
            <ul className="mt-4 space-y-2 text-xs text-slate-500">
              <li>• Atualize os campos booleanos de aprovação no Supabase para rastreio.</li>
              <li>• Dispare notificações via Edge Function <code>sync-to-sheets</code> para o Google Sheets.</li>
              <li>• Registre decisões no <code>audit_log</code> para auditoria futura.</li>
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-700">Ações Técnicas</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Crie componentes de tabela com filtros por status (awaiting_coordinator, awaiting_finance, awaiting_juridico).</li>
          <li>Implemente server actions protegidas para aprovar, reprovar ou enviar comentários aos solicitantes.</li>
          <li>Integre com o módulo de notificações (email ou Slack) conforme prioridade do hub.</li>
        </ol>
      </section>
    </main>
  );
}

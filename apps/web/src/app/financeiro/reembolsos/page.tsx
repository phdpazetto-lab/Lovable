const stages = [
  {
    title: 'Solicitação',
    description:
      'Colaboradores vinculados ao hub enviam o reembolso com anexos e justificativa. O registro começa como "awaiting_coordinator".'
  },
  {
    title: 'Aprovação do Coordenador',
    description:
      'O coordenador do hub confirma a despesa local, define o responsável e sinaliza "approved_by_coordinator" para avançar.'
  },
  {
    title: 'Financeiro',
    description:
      'Equipe financeira valida centro de custo, agenda pagamento e muda o status para "awaiting_juridico".'
  },
  {
    title: 'Jurídico',
    description:
      'Revisão documental e compliance antes da liquidação. Ao finalizar, marca "reviewed_by_juridico" ou rejeita.'
  }
];

export default function ReembolsosPage() {
  return (
    <main className="space-y-6 p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Reembolsos</h1>
        <p className="text-sm text-slate-600">
          Gestione o pipeline hierárquico de solicitações e acompanhe o status em tempo real com sincronização no Sheets.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Etapas do Workflow</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {stages.map((stage) => (
            <article key={stage.title} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-800">{stage.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{stage.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        <p>
          Utilize Edge Functions dedicadas para alterar status críticos (aprovações, revisões, pagamentos) e disparar notificações
          em cada etapa. Os perfis de coordenador, financeiro e jurídico possuem ações específicas mapeadas em <code>rbac.ts</code>.
        </p>
      </section>
    </main>
  );
}

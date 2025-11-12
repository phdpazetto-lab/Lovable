export default function AdminUsuariosPage() {
  return (
    <main className="space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold">Administração de Usuários</h1>
        <p className="text-sm text-slate-600">
          Gere perfis globais, associe usuários aos hubs e defina papéis segundo o modelo de RBAC (incluindo coordenadores de hub).
        </p>
      </header>
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        <p>
          Combine os dados das tabelas <code>profiles</code> e <code>users_hubs</code> para construir uma visão consolidada de
          permissões e status de acesso. Utilize o novo papel <strong>coordenador</strong> para aprovações locais e gestão de patrimônio.
        </p>
      </section>
    </main>
  );
}

# StarMKT OS – Esqueleto Técnico

Este repositório contém a base inicial do StarMKT OS com autenticação via Supabase (Google), modelo híbrido com Google Sheets e
estrutura Next.js. O objetivo é acelerar a implementação do Módulo Financeiro v1 e do painel de patrimônio corporativo.

## Estrutura de Pastas

```
apps/
  web/               # Projeto Next.js (App Router)
    src/app/...
    src/lib/...
    middleware.ts
supabase/
  migrations/        # Esquema SQL e políticas RLS
  functions/         # Edge Functions (Supabase)
scripts/
  seed.sql           # Dados iniciais
infrastructure/
  *.json             # Configurações de deploy
external/
  apps-script-sheets # Microserviço Google Apps Script
```

## Configuração Local

1. Crie um projeto Supabase e habilite o login com Google.
2. Configure as variáveis de ambiente indicadas em `apps/web/.env.local.example` (incluindo `FUNCTIONS_URL_SYNC_TO_SHEETS`).
3. Execute as migrações SQL em `supabase/migrations` (inicial + atualização do coordenador e patrimônio).
4. Faça o deploy das Edge Functions e configure os webhooks de banco para sincronizar com o Google Sheets.
5. Publique o Apps Script como WebApp e informe a URL nas variáveis `SHEETS_WEBAPP_URL`.

## Destaques da Atualização

- **Novo perfil de Coordenador** com permissões específicas para aprovações locais e gestão de patrimônio.
- **Fluxo hierárquico de reembolsos** com campos de aprovação e status dedicados para coordenador, financeiro e jurídico.
- **Módulo de Gestão de Patrimônio** cobrindo cadastro de ativos, movimentações e sincronização com Sheets.
- Páginas adicionais no Next.js para o pipeline de aprovações (`/financeiro/reembolsos/aprovacoes`) e visão de patrimônio (`/patrimonio`).

## Próximos Passos

- Implementar componentes de UI para o CRUD financeiro.
- Expandir políticas RLS para todas as entidades.
- Integrar uploads de anexos (Supabase Storage / Google Drive).
- Construir dashboards com a view `v_finance_hub_month` e métricas de patrimônio.

# Gestão de Reembolsos, Notas Fiscais e Materiais

Implementação base em Supabase + React + Tailwind para atender o fluxo descrito na SPEC.

## Estrutura
- `supabase/sql/schema.sql`: tabelas, buckets e políticas RLS.
- `supabase/functions/*`: Edge Functions (criação de usuário, geração de PDF mensal, notificações).
- `src/`: front-end React com React Router, Tailwind e integração Supabase.

## Variáveis de ambiente
Crie um arquivo `.env.local` com:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Para Edge Functions, configure:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Scripts
Instale dependências e rode localmente:
```
npm install
npm run dev
```

## Deploy
1. Execute o SQL em `supabase/sql/schema.sql` no projeto Supabase.
2. Publique as Edge Functions:
```
supabase functions deploy admin-create-user
supabase functions deploy generate-monthly-user-reports
supabase functions deploy send-notification
```
3. Configure cron no Supabase para `generate-monthly-user-reports` rodar mensalmente.
4. Ajuste templates de e-mail no provedor (SMTP) e conecte ao `send-notification`.

## Observações
- Layouts e tabelas usam dados mockados para facilitar visualização.
- PDF gera layout conforme SPEC e salva em `relatorios-reembolso`.
- RLS garante acesso por usuário; admins recebem acesso completo por claim `role`.

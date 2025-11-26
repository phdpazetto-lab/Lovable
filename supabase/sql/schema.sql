-- Auth profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text check (role in ('admin','user')) default 'user',
  status text check (status in ('active','inactive')) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists user_permissions (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete cascade,
  module_name text check (module_name in ('DESPESAS','NOTAS_FISCAIS','MATERIAIS')),
  level text check (level in ('NONE','READ','WRITE','MANAGE')) default 'READ',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, module_name)
);

create table if not exists expenses (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  reference_month date not null,
  category text not null,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  cost_center text,
  comprovante_url text,
  status text check (status in ('PENDENTE','APROVADO','REJEITADO','PAGO')) default 'PENDENTE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table expenses add column if not exists comprovante_url text;

create table if not exists expense_receipts (
  id bigserial primary key,
  expense_id bigint references expenses(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  uploaded_at timestamptz default now()
);

create table if not exists expense_reports (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete cascade,
  reference_month date not null,
  pdf_storage_path text not null,
  total_amount numeric(12,2) not null,
  status text check (status in ('PENDENTE','EM_ANALISE','APROVADO','REJEITADO','PAGO')) default 'PENDENTE',
  justification text,
  approved_at timestamptz,
  rejected_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, reference_month)
);

create table if not exists expense_report_history (
  id bigserial primary key,
  report_id bigint references expense_reports(id) on delete cascade,
  old_status text,
  new_status text,
  justification text,
  changed_by uuid references profiles(id),
  changed_at timestamptz default now()
);

create table if not exists invoices (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete cascade,
  reference_month date not null,
  invoice_number text not null,
  amount numeric(12,2),
  storage_path text not null,
  file_name text not null,
  status text check (status in ('RECEBIDA','EM_ANALISE','APROVADA','REJEITADA','PAGA')) default 'RECEBIDA',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, invoice_number)
);

create table if not exists equipment_agreements (
  id bigserial primary key,
  user_id uuid references profiles(id),
  title text not null,
  description text,
  storage_path text not null,
  file_name text not null,
  signed_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists material_requests (
  id bigserial primary key,
  user_id uuid references profiles(id),
  type text check (type in ('NOVO_EQUIPAMENTO','SUBSTITUICAO','DEVOLUCAO','MANUTENCAO','OUTROS')) not null,
  title text not null,
  description text not null,
  priority text check (priority in ('BAIXA','MEDIA','ALTA')) default 'MEDIA',
  status text check (status in ('ABERTO','EM_ANALISE','EM_ANDAMENTO','CONCLUIDO','CANCELADO')) default 'ABERTO',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists material_request_attachments (
  id bigserial primary key,
  material_request_id bigint references material_requests(id),
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  uploaded_at timestamptz default now()
);

create table if not exists notifications (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete cascade,
  subject text not null,
  content text not null,
  sent_at timestamptz default now()
);

-- Storage buckets
insert into storage.buckets (id, name, public) values
  ('despesas-comprovantes','despesas-comprovantes', false),
  ('comprovantes-despesas','comprovantes-despesas', false),
  ('notas-fiscais','notas-fiscais', false),
  ('materiais-termos','materiais-termos', false),
  ('materiais-anexos','materiais-anexos', false),
  ('relatorios-reembolso','relatorios-reembolso', false)
  on conflict (id) do nothing;

-- Enable RLS
alter table profiles enable row level security;
alter table user_permissions enable row level security;
alter table expenses enable row level security;
alter table expense_receipts enable row level security;
alter table expense_reports enable row level security;
alter table expense_report_history enable row level security;
alter table invoices enable row level security;
alter table equipment_agreements enable row level security;
alter table material_requests enable row level security;
alter table material_request_attachments enable row level security;
alter table notifications enable row level security;

-- Policies for admin
create policy "Admins full access" on profiles for all using (auth.jwt() ->> 'role' = 'admin');
create policy "Admins full access" on user_permissions for all using (auth.jwt() ->> 'role' = 'admin');
create policy "Admins full access" on expenses for all using (auth.jwt() ->> 'role' = 'admin');
create policy "Admins full access" on expense_receipts for all using (auth.jwt() ->> 'role' = 'admin');
create policy "Admins full access" on expense_reports for all using (auth.jwt() ->> 'role' = 'admin');
create policy "Admins full access" on expense_report_history for all using (auth.jwt() ->> 'role' = 'admin');
create policy "Admins full access" on invoices for all using (auth.jwt() ->> 'role' = 'admin');
create policy "Admins full access" on equipment_agreements for all using (auth.jwt() ->> 'role' = 'admin');
create policy "Admins full access" on material_requests for all using (auth.jwt() ->> 'role' = 'admin');
create policy "Admins full access" on material_request_attachments for all using (auth.jwt() ->> 'role' = 'admin');
create policy "Admins full access" on notifications for all using (auth.jwt() ->> 'role' = 'admin');

-- Policies for user ownership
create policy "Users manage own profile" on profiles for select using (id = auth.uid());
create policy "User permissions view" on user_permissions for select using (user_id = auth.uid());

create policy "Users access own expenses" on expenses for all using (user_id = auth.uid());
create policy "Users access own receipts" on expense_receipts for all using (
  exists(select 1 from expenses e where e.id = expense_id and e.user_id = auth.uid())
);
create policy "Users access own reports" on expense_reports for select using (user_id = auth.uid());
create policy "Users access own report history" on expense_report_history for select using (
  exists(select 1 from expense_reports r where r.id = report_id and r.user_id = auth.uid())
);
create policy "Users access own invoices" on invoices for all using (user_id = auth.uid());
create policy "Users access own agreements" on equipment_agreements for all using (user_id = auth.uid());
create policy "Users access own material requests" on material_requests for all using (user_id = auth.uid());
create policy "Users access own attachments" on material_request_attachments for all using (
  exists(select 1 from material_requests mr where mr.id = material_request_id and mr.user_id = auth.uid())
);
create policy "Users view notifications" on notifications for select using (user_id = auth.uid());

-- Storage policies
create policy "Admin storage full" on storage.objects for all using (auth.jwt() ->> 'role' = 'admin');
create policy "User upload receipts" on storage.objects for insert with check (
  bucket_id in ('comprovantes-despesas','despesas-comprovantes','notas-fiscais','materiais-termos','materiais-anexos','relatorios-reembolso')
  and coalesce((storage.foldername(name))[1], '') = auth.uid()::text
);

create policy "User manage own storage objects" on storage.objects for update using (
  coalesce((storage.foldername(name))[1], '') = auth.uid()::text
) with check (
  coalesce((storage.foldername(name))[1], '') = auth.uid()::text
);

create policy "User delete own storage objects" on storage.objects for delete using (
  coalesce((storage.foldername(name))[1], '') = auth.uid()::text
);

create policy "User own file access" on storage.objects for select using (
  bucket_id in ('comprovantes-despesas','despesas-comprovantes','notas-fiscais','materiais-termos','materiais-anexos','relatorios-reembolso')
  and coalesce((storage.foldername(name))[1], '') = auth.uid()::text
);

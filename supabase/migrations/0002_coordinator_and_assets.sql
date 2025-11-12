-- StarMKT OS - Coordenador, fluxo de reembolsos e patrimônio
set search_path = public;

-- Atualiza roles aceitos em profiles
alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (
    role in ('admin','finance','juridico','hub','viewer','coordenador')
  );

-- Atualiza roles aceitos em users_hubs
alter table public.users_hubs
drop constraint if exists users_hubs_role_check;

alter table public.users_hubs
  add constraint users_hubs_role_check check (
    role in ('admin','finance','juridico','hub','viewer','coordenador')
  );

-- Fluxo hierárquico de reembolsos
alter table public.reimbursements
  add column if not exists coordinator_id uuid references auth.users(id),
  add column if not exists approved_by_coordinator boolean default false,
  add column if not exists approved_by_finance boolean default false,
  add column if not exists reviewed_by_juridico boolean default false;

alter table public.reimbursements
drop constraint if exists reimbursements_status_check;

alter table public.reimbursements
  add constraint reimbursements_status_check check (
    status in (
      'pending',
      'awaiting_coordinator',
      'awaiting_finance',
      'awaiting_juridico',
      'approved',
      'paid',
      'rejected'
    )
  );

-- Política de leitura para reembolsos
create policy if not exists "reimb_read" on public.reimbursements
  for select using (
    auth.uid() = requester
    or user_in_hub(hub_id)
    or (
      select pr.role from public.profiles pr
      where pr.user_id = auth.uid()
    ) in ('admin','finance','juridico','coordenador')
  );

-- Aprovação coordenador
create policy if not exists "reimb_coordinator_approve" on public.reimbursements
  for update using (
    (
      select pr.role from public.profiles pr
      where pr.user_id = auth.uid()
    ) = 'coordenador'
    and user_in_hub(hub_id)
  ) with check (
    (
      status = 'rejected'
      and approved_by_coordinator is false
    )
    or (
      approved_by_coordinator = true
      and status in ('awaiting_finance','approved','awaiting_juridico','paid')
    )
  );

-- Aprovação financeira
create policy if not exists "reimb_finance_approve" on public.reimbursements
  for update using (
    (
      select pr.role from public.profiles pr
      where pr.user_id = auth.uid()
    ) = 'finance'
    and approved_by_coordinator = true
  ) with check (
    (
      status = 'rejected'
      and approved_by_finance is false
    )
    or (
      approved_by_finance = true
      and status in ('awaiting_juridico','approved','paid')
    )
  );

-- Revisão jurídica
create policy if not exists "reimb_juridico_review" on public.reimbursements
  for update using (
    (
      select pr.role from public.profiles pr
      where pr.user_id = auth.uid()
    ) = 'juridico'
    and approved_by_finance = true
  ) with check (
    (
      status = 'rejected'
      and reviewed_by_juridico is false
    )
    or (
      reviewed_by_juridico = true
      and status in ('approved','paid')
    )
  );

-- Patrimônio: tabela principal
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  tag text unique not null,
  description text not null,
  category text check (category in ('notebook','camera','celular','mobiliario','outro')),
  hub_id uuid references public.hubs(id),
  assigned_to uuid references auth.users(id),
  acquisition_date date,
  value numeric(14,2),
  status text check (status in ('ativo','emprestado','manutencao','inativo')) default 'ativo',
  location text,
  notes text,
  created_at timestamptz default now()
);

-- Histórico de movimentações de patrimônio
create table if not exists public.asset_movements (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.assets(id) on delete cascade,
  moved_by uuid references auth.users(id),
  previous_user uuid references auth.users(id),
  new_user uuid references auth.users(id),
  moved_at timestamptz default now(),
  hub_origin uuid references public.hubs(id),
  hub_destination uuid references public.hubs(id),
  notes text
);

alter table public.assets enable row level security;
alter table public.asset_movements enable row level security;

-- RLS para patrimônio
create policy if not exists "assets_read" on public.assets
  for select using (
    user_in_hub(hub_id)
    or (
      select pr.role from public.profiles pr
      where pr.user_id = auth.uid()
    ) = 'admin'
  );

create policy if not exists "assets_insert" on public.assets
  for insert with check (
    (
      select pr.role from public.profiles pr
      where pr.user_id = auth.uid()
    ) = 'admin'
    or (
      (
        select pr.role from public.profiles pr
        where pr.user_id = auth.uid()
      ) = 'coordenador'
      and user_in_hub(hub_id)
    )
  );

create policy if not exists "assets_update" on public.assets
  for update using (
    (
      select pr.role from public.profiles pr
      where pr.user_id = auth.uid()
    ) = 'admin'
    or (
      (
        select pr.role from public.profiles pr
        where pr.user_id = auth.uid()
      ) = 'coordenador'
      and user_in_hub(hub_id)
    )
  );

-- Movimentações: leitura para o hub e administradores
create policy if not exists "asset_movements_read" on public.asset_movements
  for select using (
    exists (
      select 1
      from public.assets a
      where a.id = asset_movements.asset_id
        and (
          user_in_hub(a.hub_id)
          or (
            select pr.role from public.profiles pr
            where pr.user_id = auth.uid()
          ) = 'admin'
        )
    )
  );

create policy if not exists "asset_movements_insert" on public.asset_movements
  for insert with check (
    (
      select pr.role from public.profiles pr
      where pr.user_id = auth.uid()
    ) = 'admin'
    or (
      (
        select pr.role from public.profiles pr
        where pr.user_id = auth.uid()
      ) = 'coordenador'
      and exists (
        select 1
        from public.assets a
        where a.id = asset_movements.asset_id
          and user_in_hub(a.hub_id)
      )
    )
  );

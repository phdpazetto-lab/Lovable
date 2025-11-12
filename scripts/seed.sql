insert into public.hubs (name, code)
values ('Matriz SP', 'HUB_SP'), ('Salvador', 'HUB_SSA');

-- Após o primeiro login com Google, crie manualmente os perfis iniciais (admin e coordenadores por hub).
-- Exemplo:
-- insert into public.profiles (user_id, full_name, email, role, default_hub, is_active)
-- values ('<uuid>', 'Pedro Domingues', 'pedro@starmkt.com.br', 'admin', (select id from public.hubs where code = 'HUB_SP'), true);
-- insert into public.users_hubs (user_id, hub_id, role)
-- values ('<uuid-coordenador>', (select id from public.hubs where code = 'HUB_SP'), 'coordenador');

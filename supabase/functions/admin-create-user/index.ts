// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+';
  const all = upper + lower + numbers + special;
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  let password = pick(upper) + pick(lower) + pick(numbers) + pick(special);
  for (let i = 0; i < 8; i++) password += pick(all);
  return password;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const body = await req.json();
  const { email, full_name, role = 'user', permissions = [] } = body as any;

  const password = generatePassword();
  const { data: user, error: authError } = await supabaseClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role },
  });

  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), { status: 400, headers: corsHeaders });
  }

  const profilePayload = {
    id: user.user?.id,
    full_name,
    email,
    role,
  };

  const { error: profileError } = await supabaseClient.from('profiles').insert(profilePayload);
  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), { status: 400, headers: corsHeaders });
  }

  if (permissions.length) {
    const { error: permError } = await supabaseClient.from('user_permissions').insert(
      permissions.map((p: any) => ({ user_id: user.user?.id, module_name: p.module_name, level: p.level }))
    );
    if (permError) {
      return new Response(JSON.stringify({ error: permError.message }), { status: 400, headers: corsHeaders });
    }
  }

  return new Response(
    JSON.stringify({ message: 'User created', user_id: user.user?.id, initial_password: password }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

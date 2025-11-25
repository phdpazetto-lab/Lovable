// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const body = await req.json();
  const { user_id, type, month, total, justification, paid_at } = body as any;

  const { data: profile } = await supabaseClient.from('profiles').select('email, full_name').eq('id', user_id).single();
  if (!profile) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: corsHeaders });

  let subject = '';
  let content = '';

  if (type === 'APPROVED') {
    subject = `Relatório de ${month} aprovado`;
    content = `Seu relatório de ${month} foi aprovado. Total: R$ ${Number(total).toFixed(2)}`;
  } else if (type === 'REJECTED') {
    subject = `Relatório de ${month} rejeitado`;
    content = `Seu relatório de ${month} foi rejeitado. Justificativa: ${justification}`;
  } else if (type === 'PAID') {
    subject = `Reembolso ${month} pago`;
    content = `Seu reembolso de ${month} foi pago em ${paid_at}`;
  }

  await supabaseClient.from('notifications').insert({ user_id, subject, content });

  return new Response(JSON.stringify({ message: 'Notification queued' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

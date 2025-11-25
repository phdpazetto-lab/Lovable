// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import PDFDocument from 'https://esm.sh/pdfkit@0.13.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generatePdf(payload: any) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Uint8Array[] = [];
  const stream = doc as any;
  stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));

  doc.fontSize(18).text('RELATÓRIO INDIVIDUAL DE REEMBOLSO', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Usuário: ${payload.user.name}`);
  doc.text(`E-mail: ${payload.user.email}`);
  doc.text(`Mês de Referência: ${payload.month}`);
  doc.text(`Data de Geração: ${new Date(payload.generated_at).toLocaleString('pt-BR')}`);

  doc.addPage();
  doc.fontSize(14).text('Despesas', { underline: true });
  doc.moveDown();
  doc.fontSize(10);
  payload.expenses.forEach((expense: any) => {
    doc.text(`${expense.date} | ${expense.category} | ${expense.description} | R$ ${expense.amount.toFixed(2)} | ${expense.status}`);
  });
  doc.moveDown();
  doc.fontSize(12).text(`TOTAL DO MÊS: R$ ${payload.total.toFixed(2)}`, { align: 'right' });

  doc.addPage();
  doc.fontSize(14).text('Status do relatório');
  doc.moveDown();
  doc.fontSize(12).text(`Status atual: ${payload.status}`);
  if (payload.justification) {
    doc.moveDown();
    doc.text('Justificativa:');
    doc.text(payload.justification);
  }

  doc.addPage();
  doc.fontSize(14).text('Histórico de alterações');
  doc.moveDown();
  payload.history.forEach((item: any) => {
    doc.text(`${item.changed_at} — ${item.old_status} -> ${item.new_status}`);
  });

  doc.end();
  return new Uint8Array(await new Response(new Blob(chunks)).arrayBuffer());
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { referenceMonth } = await req.json();

  const { data: profiles } = await supabaseClient.from('profiles').select('id, full_name, email');
  const month = referenceMonth || new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();

  for (const profile of profiles || []) {
    const { data: expenses } = await supabaseClient
      .from('expenses')
      .select('*')
      .eq('user_id', profile.id)
      .eq('reference_month', month);

    const total = (expenses || []).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const payload = {
      user: { id: profile.id, name: profile.full_name, email: profile.email },
      month,
      generated_at: new Date().toISOString(),
      expenses: expenses || [],
      total,
      status: 'PENDENTE',
      justification: null,
      history: [],
    };

    const pdfBuffer = await generatePdf(payload);
    const fileName = `relatorio-${profile.id}-${month}.pdf`;
    const { data: storageData, error: storageError } = await supabaseClient.storage
      .from('relatorios-reembolso')
      .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true });

    if (storageError) continue;

    await supabaseClient.from('expense_reports').upsert({
      user_id: profile.id,
      reference_month: month,
      pdf_storage_path: storageData.path,
      total_amount: total,
    });
  }

  return new Response(JSON.stringify({ message: 'Relatórios processados' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

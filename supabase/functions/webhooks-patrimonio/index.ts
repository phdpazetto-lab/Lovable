import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SYNC_URL = Deno.env.get('FUNCTIONS_URL_SYNC_TO_SHEETS');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!SYNC_URL) {
    return new Response('FUNCTIONS_URL_SYNC_TO_SHEETS not configured', { status: 500 });
  }

  const event = await req.json();
  const entity = event.table === 'asset_movements' ? 'asset_movements' : 'assets';
  const payload = { entity, record: event.record };

  await fetch(SYNC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return new Response('ok');
});

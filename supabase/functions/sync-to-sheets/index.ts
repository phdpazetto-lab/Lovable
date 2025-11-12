import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SHEETS_WEBAPP_URL = Deno.env.get('SHEETS_WEBAPP_URL');
const SIGNING_SECRET = Deno.env.get('SHEETS_SIGNING_SECRET');

async function sign(body: string) {
  if (!SIGNING_SECRET) throw new Error('SHEETS_SIGNING_SECRET not configured');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!SHEETS_WEBAPP_URL) {
    return new Response('SHEETS_WEBAPP_URL is not configured', { status: 500 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const signature = await sign(body);

  const res = await fetch(SHEETS_WEBAPP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Star-Signature': signature
    },
    body
  });

  const text = await res.text();
  return new Response(text, { status: res.status });
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.json().catch(()=> ({}));
  console.log('[telemetry]', new Date().toISOString(), body?.tag, body);
  await new Promise(r => setTimeout(r, 80)); // tiny delay for nicer RTT
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
}

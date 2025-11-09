export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { startCapture } from '@/lib/capture';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const seconds = Math.max(3, Math.min(120, Number(body?.seconds ?? 6)));
  const filter  = String(body?.filter ?? 'tcp port 3000');
  const info = startCapture({ seconds, filter });
  await new Promise(r => setTimeout(r, 400)); // arm delay
  return new Response(JSON.stringify({ ok: true, capture: info }), {
    headers: { 'content-type': 'application/json' },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { summarizeCapture } from '@/lib/capture';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const pcap = searchParams.get('pcap') || '';
  if (!pcap) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing ?pcap=' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }
  try {
    const report = await summarizeCapture(pcap);
    return new Response(JSON.stringify({ ok: true, report }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500, headers: { 'content-type': 'application/json' },
    });
  }
}

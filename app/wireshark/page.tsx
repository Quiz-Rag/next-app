// import UnderDevelopment from '@/components/UnderDevelopment';

// export default function WiresharkPage() {
//   return <UnderDevelopment title="Wireshark Analysis" />;
// }


'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Report = {
  pcap: string;
  conv: string;
  io: string;
  events: Array<{
    type: 'http_request'|'http_response';
    when: number;
    stream?: string;
    method?: string;
    uri?: string;
    code?: string;
    rtt_ms?: number;
  }>;
};

async function startTrace(seconds = 10, filter = 'tcp port 3000') {
  const r = await fetch('/api/trace/start', {
    method:'POST',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({ seconds, filter })
  });
  const j = await r.json();
  const pcap = j?.capture?.pcap || null;
  try { if (pcap) localStorage.setItem('lastPcap', pcap); } catch {}
  return pcap;
}

export default function WiresharkPage() {
  const sp = useSearchParams();
  const initialFromQS = sp.get('pcap');
  const [pcap, setPcap] = useState<string>(initialFromQS || '');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If no query param, try lastPcap from localStorage
  useEffect(() => {
    if (pcap) return;
    try {
      const last = localStorage.getItem('lastPcap');
      if (last) setPcap(last);
    } catch {}
  }, [pcap]);

  async function fetchReport(target: string) {
    if (!target) { setErr('Provide a pcap path'); return; }
    setLoading(true); setErr(null);
    try {
      const r = await fetch('/api/trace/report?pcap=' + encodeURIComponent(target));
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to load report');
      setReport(j.report);
    } catch (e:any) {
      setErr(e.message || String(e));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  async function doStartAndFetch() {
    setErr(null);
    const newPcap = await startTrace(8);
    if (!newPcap) { setErr('Could not start capture'); return; }
    setPcap(newPcap);
    // wait a touch longer than duration to ensure file is closed
    setLoading(true);
    setTimeout(() => fetchReport(newPcap), 9500);
  }

  const httpRows = useMemo(() => {
    return (report?.events || []).map((e, i) => ({
      k: i,
      t: new Date(Math.floor(e.when*1000)).toLocaleTimeString(),
      kind: e.type.replace('http_', '').toUpperCase(),
      stream: e.stream ?? '',
      detail: e.method ? `${e.method} ${e.uri || ''}` : (e.code ? `${e.code}` : ''),
      rtt: e.rtt_ms ? `${e.rtt_ms} ms` : ''
    }));
  }, [report]);

  return (
    <div style={{padding:'1rem', maxWidth: 1100, margin: '0 auto'}}>
      <h1>Wireshark Trace</h1>

      <div style={{display:'grid', gap:12, gridTemplateColumns:'1fr auto auto'}}>
        <input
          placeholder="pcap path (e.g., /tmp/trace-....pcapng)"
          value={pcap}
          onChange={e=>setPcap(e.target.value)}
          style={{padding:'8px'}}
        />
        <button onClick={()=>fetchReport(pcap)} disabled={loading} style={{padding:'8px 12px'}}>
          {loading ? 'Loading…' : 'Load report'}
        </button>
        <button onClick={doStartAndFetch} disabled={loading} style={{padding:'8px 12px'}}>
          Start new 8s capture
        </button>
      </div>

      {err && <p style={{color:'crimson', marginTop:8}}>Error: {err}</p>}
      {report && (
        <>
          <p style={{marginTop:8, fontFamily:'monospace'}}>pcap: {report.pcap}</p>

          <div style={{display:'grid', gap:16, gridTemplateColumns:'1fr 1fr', marginTop:12}}>
            <div>
              <h3>TCP Conversations</h3>
              <pre style={{maxHeight:260, overflow:'auto', background:'#111', color:'#ddd', padding:12}}>
                {report.conv || '(none)'}
              </pre>
            </div>
            <div>
              <h3>I/O Stats</h3>
              <pre style={{maxHeight:260, overflow:'auto', background:'#111', color:'#ddd', padding:12}}>
                {report.io || '(none)'}
              </pre>
            </div>
          </div>

          <div style={{marginTop:16}}>
            <h3>HTTP Events</h3>
            <div style={{overflow:'auto', border:'1px solid #ddd', borderRadius:8}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead style={{background:'#f7f7f7'}}>
                  <tr>
                    <th style={{textAlign:'left', padding:8}}>Time</th>
                    <th style={{textAlign:'left', padding:8}}>Type</th>
                    <th style={{textAlign:'left', padding:8}}>Stream</th>
                    <th style={{textAlign:'left', padding:8}}>Detail</th>
                    <th style={{textAlign:'left', padding:8}}>RTT</th>
                  </tr>
                </thead>
                <tbody>
                  {httpRows.length ? httpRows.map(r=>(
                    <tr key={r.k} style={{borderTop:'1px solid #eee'}}>
                      <td style={{padding:8}}>{r.t}</td>
                      <td style={{padding:8}}>{r.kind}</td>
                      <td style={{padding:8}}>{r.stream}</td>
                      <td style={{padding:8}}>{r.detail}</td>
                      <td style={{padding:8}}>{r.rtt}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} style={{padding:12, fontStyle:'italic'}}>No HTTP events found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
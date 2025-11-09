// lib/capture.js
import { spawn, execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/* ----- resolve binaries (env → common paths → PATH) ----- */
function fromPath(cmd) {
  const sep = process.platform === 'win32' ? ';' : ':';
  for (const dir of (process.env.PATH || '').split(sep)) {
    if (!dir) continue;
    const p = path.join(dir, cmd);
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return null;
}
function pickBin(name, envName, candidates) {
  const fromEnv = process.env[envName];
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  for (const c of candidates) { try { if (c && fs.existsSync(c)) return c; } catch {} }
  const inPath = fromPath(name);
  if (inPath) return inPath;
  // Return null instead of throwing during build
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    console.warn(`${name} not found. Set ${envName} or install Wireshark CLI.`);
    return null;
  }
  throw new Error(`${name} not found. Set ${envName} or install Wireshark CLI.`);
}

// Lazy initialization - only resolve when actually needed
let _DUMPCAP = null;
let _TSHARK = null;

export const DUMPCAP = () => {
  if (_DUMPCAP === null) {
    _DUMPCAP = pickBin('dumpcap', 'DUMPCAP', [
      '/opt/homebrew/bin/dumpcap',
      '/usr/local/bin/dumpcap',
      '/Applications/Wireshark.app/Contents/MacOS/dumpcap',
      '/usr/bin/dumpcap',
    ]) || '';
  }
  return _DUMPCAP;
};

export const TSHARK = () => {
  if (_TSHARK === null) {
    _TSHARK = pickBin('tshark', 'TSHARK', [
      '/opt/homebrew/bin/tshark',
      '/usr/local/bin/tshark',
      '/Applications/Wireshark.app/Contents/MacOS/tshark',
      '/usr/bin/tshark',
    ]) || '';
  }
  return _TSHARK;
};

export const CAP_DIR = process.env.CAP_DIR || '/tmp';
try { fs.mkdirSync(CAP_DIR, { recursive: true }); } catch {}

export const DEFAULT_IFACE =
  process.env.CAP_IFACE ||
  (process.platform === 'darwin' ? 'lo0' :
   process.platform === 'linux'  ? 'any' : 'any');

/* ----- start capture (dumpcap) ----- */
export function startCapture(opts = {}) {
  const dumpcapPath = DUMPCAP();
  if (!dumpcapPath) {
    throw new Error('dumpcap not available');
  }
  
  const seconds = Math.max(3, Math.min(120, Number(opts.seconds ?? 6)));
  const filter  = String(opts.filter ?? 'tcp port 3000');
  const iface   = String(opts.iface ?? DEFAULT_IFACE);

  const pcap = path.join(CAP_DIR, `trace-${Date.now()}.pcapng`);
  const args = ['-i', iface, '-f', filter, '-a', `duration:${seconds}`, '-w', pcap];

  console.log('[capture] cmd:', [dumpcapPath, ...args].join(' '));

  const proc = spawn(dumpcapPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stdout.on('data', d => process.stdout.write('[dumpcap] ' + d.toString()));
  proc.stderr.on('data', d => process.stderr.write('[dumpcap] ' + d.toString()));
  proc.on('error', e => console.error('[dumpcap] spawn error:', e.message));
  proc.on('close', code => console.log('[dumpcap] exit', code));

  return { pcap, seconds, iface, cmd: [dumpcapPath, ...args].join(' ') };
}

/* ----- wait for file to exist and be stable ----- */
async function waitForStableFile(p, timeoutMs = 6000) {
  const deadline = Date.now() + timeoutMs;
  let last = -1, stable = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const st = fs.statSync(p);
      if (st.size > 32) {
        if (st.size === last) { if (++stable >= 2) return fs.realpathSync(p); }
        else { last = st.size; stable = 0; }
      }
    } catch {}
    if (Date.now() > deadline) throw new Error(`pcap not found or still empty: ${p}`);
    await new Promise(r => setTimeout(r, 150));
  }
}

/* ----- run tshark, return stdout as string ----- */
function runTS(args) {
  return new Promise((resolve, reject) => {
    const tsharkPath = TSHARK();
    if (!tsharkPath) {
      return reject(new Error('tshark not available'));
    }
    execFile(tsharkPath, args, { maxBuffer: 20 * 1024 * 1024, encoding: 'utf8' },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve(stdout || '');
      });
  });
}

/* ----- summarize capture (conv, io, http events) ----- */
function deriveEvents(csv) {
  csv = String(csv || '');
  if (!csv.trim()) return [];
  const lines = csv.trim().split(/\r?\n/);
  const hdr = lines.shift().split(',');
  const idx = Object.fromEntries(hdr.map((h,i)=>[h.replace(/^"+|"+$/g,''), i]));
  const cell = (row, k) => (row[idx[k]] || '').replace(/^"+|"+$/g,'');

  const ev = [];
  for (const ln of lines) {
    const row = ln.split(',');
    const when = Number(cell(row, 'frame.time_epoch'));
    const stream = cell(row, 'tcp.stream');
    const method = cell(row, 'http.request.method');
    const uri    = cell(row, 'http.request.uri');
    const code   = cell(row, 'http.response.code');
    if (method) ev.push({ type: 'http_request', when, stream, method, uri });
    else if (code) ev.push({ type: 'http_response', when, stream, code });
  }
  ev.sort((a,b)=>a.when-b.when);
  const first = {};
  for (const e of ev) {
    if (e.type === 'http_request' && !(e.stream in first)) first[e.stream] = e.when;
    if (e.type === 'http_response' && (e.stream in first)) e.rtt_ms = Math.round((e.when - first[e.stream]) * 1000);
  }
  return ev;
}

export async function summarizeCapture(pcapPath) {
  const real = await waitForStableFile(pcapPath, 6000);

  let conv = '', io = '', csv = '';
  try { conv = await runTS(['-r', real, '-q', '-z', 'conv,tcp']); } catch (e) { conv = `ERROR: ${e.message}`; }
  try { io   = await runTS(['-r', real, '-q', '-z', 'io,stat,1']); } catch (e) { io   = `ERROR: ${e.message}`; }

  const fields = [
    '-T','fields',
    '-E','header=y','-E','separator=,','-E','quote=d',
    '-e','frame.time_epoch','-e','ip.src','-e','ip.dst','-e','tcp.stream',
    '-e','http.request.method','-e','http.request.uri','-e','http.response.code'
  ];
  try { csv = await runTS(['-r', real, '-Y', 'http', ...fields]); } catch {}

  return { pcap: real, conv, io, events: deriveEvents(csv) };
}

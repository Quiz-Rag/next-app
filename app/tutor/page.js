"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function TutorPage() {
  const [provider, setProvider] = useState("openai"); // "openai" | "deepseek"
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [cites, setCites] = useState([]);
  const [busy, setBusy] = useState(false);

  function onPickFiles(e) {
    const list = Array.from(e.target.files || []);
    if (list.length > 10) {
      alert("Max 10 files");
      return;
    }
    setFiles(list);
  }

  async function ingestFiles() {
    if (files.length === 0) return alert("Pick up to 10 files first.");
    const fd = new FormData();
    files.forEach(f => fd.append("files", f));
    setBusy(true);
    try {
      const r = await fetch(`${API}/ingest_files`, { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detail || "Upload failed");
      alert(`Files: ${j.files} | Added chunks: ${j.added} | Total: ${j.total}`);
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function ingestText() {
    if (!notes.trim()) return alert("Paste some notes.");
    setBusy(true);
    try {
      const r = await fetch(`${API}/ingest_text`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ text: notes })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detail || "Ingest failed");
      alert(`Added: ${j.added} | Total: ${j.total}`);
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function ask() {
    if (!question.trim()) return alert("Type a question.");
    setBusy(true);
    try {
      const r = await fetch(`${API}/ask`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ text: question, provider, top_k: 5 })
      });
      const j = await r.json();
      setAnswer(j.answer || "");
      setCites(j.citations || []);
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setBusy(true);
    try {
      await fetch(`${API}/reset`, { method: "POST" });
      setAnswer(""); setCites([]); setNotes(""); setFiles([]);
      alert("Cleared store.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1>AI Tutor (ChatGPT + DeepSeek)</h1>

      <div style={{display:"flex", gap:16, alignItems:"center"}}>
        <label><b>Provider:</b></label>
        <label><input type="radio" name="prov" checked={provider==="openai"} onChange={()=>setProvider("openai")} /> ChatGPT (OpenAI)</label>
        <label><input type="radio" name="prov" checked={provider==="deepseek"} onChange={()=>setProvider("deepseek")} /> DeepSeek</label>
      </div>

      <hr style={{margin:"16px 0"}}/>

      <h3>1) Upload your notes (up to 10 files)</h3>
      <input type="file" multiple onChange={onPickFiles} accept=".pdf,.docx,.txt" />
      <button onClick={ingestFiles} disabled={busy}>Ingest Files</button>

      <h3 style={{marginTop:24}}>…or paste text</h3>
      <textarea rows={6} style={{width:"100%"}}
        value={notes} onChange={e=>setNotes(e.target.value)}
        placeholder="Paste class notes, slides text, definitions…" />
      <br/>
      <button onClick={ingestText} disabled={busy}>Ingest Text</button>
      <button onClick={reset} style={{marginLeft:8}} disabled={busy}>Reset Store</button>

      <h3 style={{marginTop:24}}>2) Ask a question</h3>
      <input style={{width:"100%", padding:8}} value={question} onChange={e=>setQuestion(e.target.value)}
        placeholder="e.g., Explain TLS handshake" />
      <br/><br/>
      <button onClick={ask} disabled={busy}>Ask Tutor</button>

      <h3 style={{marginTop:24}}>Answer</h3>
      <div style={{whiteSpace:"pre-wrap"}}>{answer}</div>

      <h4 style={{marginTop:12}}>Citations (top matches from your notes)</h4>
      <ul>{cites.map((c,i)=><li key={i}>{c}</li>)}</ul>
    </div>
  );
}

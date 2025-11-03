"use client";
import { useRef, useState } from "react";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const MAX_FILES = 10;
const ACCEPT = ".pdf,.ppt,.pptx,.docx,.txt,.md";

export default function TutorPage() {
  const [provider, setProvider] = useState("openai"); // "openai" | "deepseek"
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [cites, setCites] = useState([]);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  // ---- helpers -------------------------------------------------------------
  function dedupeCapMerge(existing, incoming) {
    const merged = [...existing, ...incoming];
    const seen = new Set();
    const unique = [];
    for (const f of merged) {
      const key = `${f.name}|${f.size}|${f.lastModified}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(f);
    }
    if (unique.length > MAX_FILES) alert(`Max ${MAX_FILES} files. Extra files ignored.`);
    return unique.slice(0, MAX_FILES);
  }

  async function uploadFiles(filesToUpload) {
    if (!filesToUpload.length) return;
    const fd = new FormData();
    filesToUpload.forEach(f => fd.append("files", f));
    setBusy(true);
    try {
      const r = await fetch(`${API}/ingest_files`, { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.detail || "Upload failed");
      alert(`Files: ${j.files} | Added chunks: ${j.added} | Total: ${j.total}`);
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onPickFiles(e) {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;
    const next = dedupeCapMerge(files, incoming);
    const existingKeys = new Set(files.map(f => `${f.name}|${f.size}|${f.lastModified}`));
    const newOnes = incoming.filter(f => !existingKeys.has(`${f.name}|${f.size}|${f.lastModified}`));
    const nextKeys = new Set(next.map(f => `${f.name}|${f.size}|${f.lastModified}`));
    const willUpload = newOnes.filter(f => nextKeys.has(`${f.name}|${f.size}|${f.lastModified}`));
    setFiles(next);
    await uploadFiles(willUpload);
    e.target.value = "";
  }

  function removeFile(idx) { setFiles(prev => prev.filter((_, i) => i !== idx)); }

  async function insertText() {
    if (!notes.trim()) return alert("Paste some notes.");
    setBusy(true);
    try {
      const r = await fetch(`${API}/ingest_text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notes })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.detail || "Insert failed");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: question, provider, top_k: 5 })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.detail || "Ask failed");

      setAnswer(j.answer || "");
      const raw = j.citations || [];
      const normalized = raw.map((c, i) => {
        if (typeof c === "string") return c;
        if (c && typeof c === "object") {
          const title = c.title ?? c.name ?? `Source ${i + 1}`;
          const loc = c.location ?? c.page ?? c.chunk ?? "";
          const extra = c.snippet ? ` — ${c.snippet}` : "";
          return loc ? `${title} — ${loc}${extra}` : `${title}${extra}`;
        }
        return `Source ${i + 1}`;
      });
      setCites(normalized);
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

  // ---- UI ------------------------------------------------------------------
  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <h1 className={styles.title}>AI Tutor</h1>
        <p className={styles.subtitle}>Chat from your notes & slides • Citations included</p>

        <div className={styles.row} style={{ marginBottom: 8 }}>
          <strong>Chatbot:</strong>
          <label>
            <input
              type="radio"
              name="prov"
              checked={provider === "openai"}
              onChange={() => setProvider("openai")}
              disabled={busy}
            />{" "}
            ChatGPT (OpenAI)
          </label>
          <label>
            <input
              type="radio"
              name="prov"
              checked={provider === "deepseek"}
              onChange={() => setProvider("deepseek")}
              disabled={busy}
            />{" "}
            DeepSeek
          </label>
        </div>

        <hr className={styles.divider} />

        {/* Upload */}
        <h3 className={styles.sectionTitle}>1) Upload your notes (up to {MAX_FILES} files)</h3>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT}
          onChange={onPickFiles}
          disabled={busy}
          style={{ display: "none" }}
        />
        <div className={styles.rowLeft}>
          <button
            className={styles.btn}
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
          >
            Insert Files
          </button>
          <span className={styles.muted}>Accepted: {ACCEPT.replaceAll(",", ", ")}</span>
        </div>

        {files.length > 0 && (
          <div className={styles.fileList}>
            {files.map((f, i) => (
              <div key={`${f.name}-${f.size}-${f.lastModified}`} className={styles.fileItem}>
                <span className={styles.truncate} title={f.name}>{f.name}</span>
                <button className={styles.linkBtn} onClick={() => removeFile(i)} disabled={busy}>
                  Remove
                </button>
              </div>
            ))}
            <div className={styles.muted}>{files.length}/{MAX_FILES} selected</div>
          </div>
        )}

        {/* Paste Text */}
        <h3 className={styles.sectionTitle} style={{ marginTop: 18 }}>Paste Text</h3>
        <textarea
          rows={6}
          className={styles.textarea}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Paste class notes, slide text, definitions…"
          disabled={busy}
        />
        <div className={styles.rowLeft} style={{ marginTop: 8 }}>
          <button className={styles.btn} onClick={insertText} disabled={busy || !notes.trim()}>
            Insert Text
          </button>
          <button className={styles.btnGhost} onClick={reset} disabled={busy}>
            Reset Text
          </button>
        </div>

        {/* Ask */}
        <h3 className={styles.sectionTitle} style={{ marginTop: 18 }}>2) Ask a question</h3>
        <input
          className={styles.input}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g., Explain TLS handshake"
          disabled={busy}
        />
        {/* intentionally pushed down a bit, like your request */}
        <div className={styles.rowLeft} style={{ marginTop: 18 }}>
          <button className={styles.btnPrimary} onClick={ask} disabled={busy || !question.trim()}>
            {busy ? "Working..." : "Ask Tutor"}
          </button>
        </div>

        {/* Answer */}
        <h3 className={styles.sectionTitle} style={{ marginTop: 18 }}>Answer</h3>
        <div className={styles.answerBox}>{answer}</div>

        <h4 className={styles.sectionTitle} style={{ marginTop: 12 }}>Citations (top matches from your notes)</h4>
        <ul className={styles.citeList}>
          {cites.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </section>
    </main>
  );
}

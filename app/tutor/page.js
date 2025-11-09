"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// ---------------- CONFIG ----------------
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
// Default slide collection
const COLLECTION = "lecture_3_slides";
// -----------------------------------------

export default function TutorPage() { 
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How can I help you?", cites: [] },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Tiny toast
  function toast(msg) {
    setStatus(msg);
    setTimeout(() => setStatus(""), 2400);
  }

  // ============================================================
  // CALL BACKEND RAG ENDPOINT
  // ============================================================
  async function askOnce({ text, top_k = 5 }) {
    const body = {
      query: text,
      collection_name: COLLECTION,
      top_k
    };

    const res = await fetch(`${API}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${t}`);
    }

    return await res.json();  // { answer, citations }
  }

  // ============================================================
  // SEND USER MESSAGE
  // ============================================================
  async function sendMessage() {
    if (busy) return;
    const text = input.trim();
    if (!text) return;

    setInput("");
    setMessages(m => [...m, { role: "user", content: text }]);
    setMessages(m => [...m, { role: "assistant", content: "Thinking…", cites: [] }]);
    setBusy(true);

    try {
      const { answer, citations } = await askOnce({ text, top_k: 5 });

      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: answer,
          cites: citations
        };
        return copy;
      });
    } catch (e) {
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `⚠️ Error: ${e.message}`,
          cites: []
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!busy) sendMessage();
    }
  }

  // Chat actions
  function clearChat() {
    setMessages([{ role: "assistant", content: "Chat cleared. Ask away!", cites: [] }]);
  }

  function resetStore() {
    toast("Reset is not available on this backend.");
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "60rem", margin: "0 auto" }}>

        {/* Title */}
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "0.5rem",
            background: "linear-gradient(135deg,#00d9ff,#7c5cff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AI Tutor
        </h1>
        <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "1.5rem" }}>
          Chat • Answers from your slides
        </p>

        {/* Main Card */}
        <section
          style={{
            background: "#111a2b",
            padding: "2rem",
            borderRadius: "1rem",
            border: "1px solid #20304d",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1rem",
              border: "1px solid #20304d",
              borderRadius: "0.875rem",
              background: "#0b1220",
              marginBottom: "1rem",
            }}
          >
  

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={clearChat} style={btnSmall}>Clear Chat</button>
              <button onClick={resetStore} style={btnSmall}>Reset Store</button>
            </div>
          </div>

          {/* Chat window */}
          <div style={{ height: "56vh", overflowY: "auto", padding: 12 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  margin: "12px 0"
                }}
              >
                <div
                  style={{
                    maxWidth: "70ch",
                    border: "1px solid #20304d",
                    background: "#0b1220",
                    color: "#e6eefc",
                    padding: "10px 12px",
                    borderRadius: 14,
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {m.content}
                  {m.cites?.length > 0 && (
                    <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, color: "#93a3bd" }}>
                      {m.cites.map((c, j) => <li key={j}>{c}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <textarea
              placeholder='Type a question… e.g., "TLS handshake (slide 12)"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={busy}
              rows={3}
              style={{
                flex: 1,
                minHeight: 76,
                maxHeight: 220,
                resize: "vertical",
                borderRadius: 12,
                border: "1px solid #20304d",
                background: "#0b1220",
                color: "#e6eefc",
                padding: "10px 12px",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={busy || !input.trim()}
              style={btnSend(busy)}
            >
              {busy ? "Working…" : "Send"}
            </button>
          </div>

          {status && (
            <p style={{ textAlign: "center", marginTop: 8, color: "#00d9ff" }}>{status}</p>
          )}
        </section>
      </div>
    </div>
  );
}

// ---------------- BUTTON STYLES ----------------
const btnSmall = {
  background: "transparent",
  color: "#cfe3ff",
  border: "1px solid #2b3b5a",
  borderRadius: 24,
  padding: "8px 14px",
  cursor: "pointer"
};

const btnSend = (busy) => ({
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  background: "linear-gradient(135deg,#00d9ff,#7c5cff)",
  color: "#08111f",
  fontWeight: 700,
  cursor: busy ? "not-allowed" : "pointer",
  opacity: busy ? 0.6 : 1,
});

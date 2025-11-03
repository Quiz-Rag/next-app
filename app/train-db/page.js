"use client";

import React, { useState } from "react";

export default function TrainDBPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleProcess = async () => {
    if (!file) {
      alert("Please upload a PPTX file first!");
      return;
    }

    setProcessing(true);
    setStatus("Uploading and processing...");
    console.log("component rendered------", processing);


    try {
      const formData = new FormData();
      formData.append("file", file);
      console.log("----A");
      const res = await fetch("api\\query", { method: "POST", body: formData });
      console.log("---B");
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus(`Embeddings are prepared! (${data.embeddingsCount ?? "unknown"} chunks)`);
      } else {
        setStatus(`${data?.error ?? "Something went wrong on the server."}`);
        console.error("Server response error:", data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus(" Network error while calling the API.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10">
      <h1 className="text-2xl font-bold mb-6">Train Database from PPTX</h1>

      <input type="file" accept=".pptx" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleProcess}
        disabled={processing}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {processing ? "Processing..." : "Process File"}
      </button>

      {status && <p className="mt-6 text-lg font-semibold">{status}</p>}
    </div>
  );
}

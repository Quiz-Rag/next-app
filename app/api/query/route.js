// app/api/query/route.js
import fs from "fs/promises";
import path from "path";
import {
  extractTextFromPDF,
  extractTextFromPPTX,
  chunkText,
  storeInChroma,
} from "../../../lib/embeddingUtils.js";

export async function POST(req) {
  try {
    console.log("🧠 Received file for processing...");

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    // ✅ Ensure the tmp directory exists
    const tmpDir = path.join(process.cwd(), "tmp");
    await fs.mkdir(tmpDir, { recursive: true });

    // ✅ Save file
    const tmpPath = path.join(tmpDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tmpPath, buffer);

    // ✅ Extract text depending on file type
    let text = "";
    if (file.name.endsWith(".pdf")) {
      text = await extractTextFromPDF(tmpPath);
    } else if (file.name.endsWith(".pptx")) {
      text = await extractTextFromPPTX(tmpPath);
    } else {
      return new Response(JSON.stringify({ error: "Unsupported file type" }), { status: 400 });
    }

    console.log("📄 Text extracted length:", text.length);

    // ✅ Chunk text
    const docs = await chunkText(text);

    // ✅ Store embeddings in ChromaDB
    await storeInChroma(docs, "presentation_collection");

    // ✅ Clean up
    await fs.unlink(tmpPath);

    return new Response(JSON.stringify({ message: "Embeddings stored successfully!", chunks: docs.length }), {
      status: 200,
    });
  } catch (err) {
    console.error("❌ Error in API route:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
  }
}

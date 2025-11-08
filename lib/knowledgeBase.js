import fs from 'fs';
import pptxParser from 'pptx-parser';
import { pipeline } from '@xenova/transformers';
import Vectra from 'vectra';

// --- Extract text from PPTX ---
export async function extractTextFromPPTX(filePath) {
  const result = await pptxParser(fs.createReadStream(filePath));
  const text = result.slides.map(slide => slide.text).join(' ');
  return text;
}

// --- Chunk text into ~500 words ---
export function chunkText(text, chunkSize = 500) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }
  return chunks;
}

// --- Generate embeddings and store locally ---
export async function createVectorDB(chunks, dbPath = './data/local_vector_store') {
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const db = new Vectra({ path: dbPath });

  for (let i = 0; i < chunks.length; i++) {
    const output = await embedder(chunks[i]);
    const vector = Array.from(output.data[0]);
    await db.add({
      id: `chunk_${i}`,
      vector,
      metadata: { content: chunks[i], source: "network_security_slides" }
    });
  }

  await db.save();
  return true;
}

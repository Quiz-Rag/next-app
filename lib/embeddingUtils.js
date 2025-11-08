// lib/embedUtils.js

import { OpenAIEmbeddings } from "@langchain/openai";

import { Chroma } from "langchain/dist/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import pdf from "pdf-parse";
import { parsePptxFile } from "pptx-parser";
import fs from "fs/promises";

// -------------------
// Extract text from PPTX
// -------------------
export async function extractTextFromPPTX(filePath) {
  const slides = await parsePptxFile(filePath);
  // Join all slide texts into a single string
  return slides.map(slide => slide.text || "").join("\n");
}

// -------------------
// Extract text from PDF
// -------------------
export async function extractTextFromPDF(filePath) {
  const dataBuffer = await fs.readFile(filePath);
  const pdfData = await pdf(dataBuffer);
  return pdfData.text;
}

// -------------------
// Split text into smaller chunks
// -------------------
export async function chunkText(text) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,    // characters per chunk
    chunkOverlap: 200,  // overlap between chunks
  });

  const docs = await splitter.createDocuments([text]);
  return docs;
}


export async function createEmbeddings(texts) {
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const embeddingVectors = await embeddings.embedDocuments(texts);
  return embeddingVectors;
}
// -------------------
// Store chunks in ChromaDB
// -------------------
export async function storeInChroma(docs, collectionName = "default_collection") {
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const vectorStore = await Chroma.fromDocuments(docs, embeddings, {
    collectionName,
    persistDirectory: process.env.CHROMA_DB_PATH, // change from url -> persistDirectory
  });

  await vectorStore.persist(); // make sure data is actually saved
  return vectorStore;
}


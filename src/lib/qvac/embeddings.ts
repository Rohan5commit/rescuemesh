// QVAC Embeddings & Semantic Search
//
// Provides a complete embedding pipeline:
//   1. Model lifecycle management (singleton pattern)
//   2. Text embedding generation via QVAC SDK
//   3. Batch embedding for document ingestion
//   4. Cosine similarity for vector comparison
//   5. Semantic search across embedded documents

import { loadModel, embed, unloadModel } from '@qvac/sdk';
import { EMBED_MODEL } from './models';

let embedModelId: string | null = null;

/**
 * Initialize the embedding model (singleton).
 * Uses QVAC's GTE Large FP16 model for high-quality text embeddings.
 */
export async function initEmbeddings(): Promise<string> {
  if (embedModelId) return embedModelId;
  const modelId = await loadModel({
    modelSrc: EMBED_MODEL,
    modelType: 'embedding',
  });
  embedModelId = modelId;
  return modelId;
}

/**
 * Generate a vector embedding for a single text string.
 * Returns a Float32Array of dimension ~768 (GTE Large).
 */
export async function generateEmbedding(text: string): Promise<Float32Array> {
  const modelId = await initEmbeddings();
  const result = await embed({
    modelId,
    input: text,
  });
  return result.embedding;
}

/**
 * Generate embeddings for multiple texts in a single batch.
 * More efficient than calling generateEmbedding() in a loop.
 * Used during document ingestion for RAG indexing.
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<Float32Array[]> {
  const modelId = await initEmbeddings();
  const results = await Promise.all(
    texts.map((text) => embed({ modelId, input: text }))
  );
  return results.map((r) => r.embedding);
}

/**
 * Compute cosine similarity between two embedding vectors.
 * Returns a value between -1 (opposite) and 1 (identical).
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimensions mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Semantic search: find the most similar documents to a query.
 * Takes pre-embedded documents and a query, returns ranked results.
 *
 * @param query - The search query text
 * @param documents - Array of { id, text, embedding } tuples
 * @param topK - Number of results to return (default 5)
 * @returns Ranked results sorted by similarity descending
 */
export async function semanticSearch(
  query: string,
  documents: Array<{ id: string; text: string; embedding: Float32Array }>,
  topK: number = 5
): Promise<Array<{ id: string; text: string; score: number }>> {
  const queryEmbedding = await generateEmbedding(query);

  const scored = documents.map((doc) => ({
    id: doc.id,
    text: doc.text,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Shutdown the embedding model and free resources.
 */
export async function shutdownEmbeddings(): Promise<void> {
  if (embedModelId) {
    await unloadModel({ modelId: embedModelId });
    embedModelId = null;
  }
}

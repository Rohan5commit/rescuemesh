// QVAC Embedding Generation
import {
  loadModel,
  embed,
  unloadModel,
} from '@qvac/sdk';
import { EMBED_MODEL } from './models';

let embedModelId: string | null = null;

export async function initEmbeddings(): Promise<string> {
  if (embedModelId) return embedModelId;
  embedModelId = await loadModel({
    modelSrc: EMBED_MODEL,
    modelType: 'embedding',
  });
  return embedModelId;
}

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const modelId = await initEmbeddings();
  const result = await embed({ modelId, text });
  return result.embedding;
}

export async function shutdownEmbeddings(): Promise<void> {
  if (embedModelId) {
    await unloadModel({ modelId: embedModelId });
    embedModelId = null;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

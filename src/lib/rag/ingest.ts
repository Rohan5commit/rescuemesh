// Local RAG Document Ingestion
import { ragIngest, type RagIngestOptions } from '@qvac/sdk';
import { initLLM } from '../qvac';
import type { KnowledgeDocument, KnowledgeChunk } from '../schemas';
import { v4 as uuid } from 'uuid';

const WORKSPACE_DIR = 'rescuemesh-rag';

function chunkText(text: string, maxChunkSize = 500): string[] {
  const sentences = text.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > maxChunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export async function ingestDocument(
  filename: string,
  content: string,
  packId: string,
  metadata?: { title?: string; category?: string; source?: string }
): Promise<KnowledgeDocument> {
  const modelId = await initLLM();
  const rawChunks = chunkText(content);

  const docId = uuid();
  const chunks: KnowledgeChunk[] = rawChunks.map((c, i) => ({
    id: uuid(),
    documentId: docId,
    content: c,
    index: i,
  }));

  // Use QVAC built-in RAG ingestion
  await ragIngest({
    modelId,
    workspace: `${WORKSPACE_DIR}/${packId}`,
    documents: rawChunks.map((c, i) => ({
      id: chunks[i].id,
      text: c,
      metadata: { documentId: docId, chunkIndex: i },
    })),
  });

  return {
    id: docId,
    filename,
    packId,
    content,
    chunks,
    metadata: {
      ...metadata,
      ingestedAt: new Date().toISOString(),
    },
  };
}

export async function ingestFile(
  file: File,
  packId: string
): Promise<KnowledgeDocument> {
  const content = await file.text();
  return ingestDocument(file.name, content, packId, {
    title: file.name,
    category: 'uploaded',
  });
}

export function chunkTextForDisplay(text: string, maxLen = 200): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

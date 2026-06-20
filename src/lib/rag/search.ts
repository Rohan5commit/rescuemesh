// Local RAG Search & Retrieval
import { ragSearch } from '@qvac/sdk';
import { initLLM } from '../qvac';
import type { RetrievedEvidence } from '../schemas';
import { v4 as uuid } from 'uuid';

const WORKSPACE_DIR = 'rescuemesh-rag';

export interface SearchOptions {
  packId?: string;
  topK?: number;
  minSimilarity?: number;
}

export async function searchKnowledge(
  query: string,
  options?: SearchOptions
): Promise<RetrievedEvidence[]> {
  const modelId = await initLLM();
  const topK = options?.topK ?? 5;
  const workspace = options?.packId
    ? `${WORKSPACE_DIR}/${options.packId}`
    : WORKSPACE_DIR;

  const results = await ragSearch({
    modelId,
    workspace,
    query,
    topK,
  });

  return results.hits
    .filter((h) => !options?.minSimilarity || h.score >= options.minSimilarity)
    .map((hit) => ({
      id: uuid(),
      content: hit.text,
      source: 'knowledge_pack' as const,
      documentName: hit.metadata?.documentName ?? 'Unknown',
      documentId: hit.metadata?.documentId,
      chunkIndex: hit.metadata?.chunkIndex,
      similarity: hit.score,
      excerpt: hit.text.slice(0, 200),
    }));
}

export async function searchCaseAndKnowledge(
  query: string,
  caseInputs: Array<{ content: string; id: string }>,
  options?: SearchOptions
): Promise<RetrievedEvidence[]> {
  // Search knowledge packs
  const knowledgeResults = await searchKnowledge(query, options);

  // Simple local case input matching (keyword-based since case data is local)
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

  const caseResults: RetrievedEvidence[] = caseInputs
    .map((input) => {
      const contentLower = input.content.toLowerCase();
      const matchCount = queryWords.filter((w) => contentLower.includes(w)).length;
      const similarity = queryWords.length > 0 ? matchCount / queryWords.length : 0;
      return {
        id: uuid(),
        content: input.content,
        source: 'case_input' as const,
        similarity,
        excerpt: input.content.slice(0, 200),
        caseInputId: input.id,
      };
    })
    .filter((r) => r.similarity > 0.2)
    .sort((a, b) => b.similarity - a.similarity);

  // Merge and rank
  const all = [...knowledgeResults, ...caseResults]
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, options?.topK ?? 8);

  return all;
}

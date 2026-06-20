// RAG Search — Knowledge packs + Case inputs via QVAC ragSearch
//
// Both knowledge packs AND case inputs are ingested into QVAC workspaces
// and searched via ragSearch(). This means:
//   - User notes like "structural collapse on east wing" will match queries
//     like "what are the hazards in the building" via semantic similarity
//   - No keyword matching needed — QVAC embeddings handle this natively

import { loadModel, ragSearch } from '@qvac/sdk';
import { LLM_MODEL } from '../qvac/models';
import type { RetrievedEvidence } from '../schemas';
import { v4 as uuid } from 'uuid';

type SearchOptions = {
  topK?: number;
  minSimilarity?: number;
};

/**
 * Search the knowledge RAG workspace (rescuemesh-rag/packs/*)
 * for relevant evidence from ingested knowledge packs.
 */
export async function searchKnowledge(
  query: string,
  options?: SearchOptions
): Promise<RetrievedEvidence[]> {
  const modelId = await loadModel({ modelSrc: LLM_MODEL, modelType: 'llm' });
  const topK = options?.topK ?? 5;

  const results = await ragSearch({
    modelId,
    workspace: 'rescuemesh-rag',
    query,
    topK,
  });

  return results
    .filter((r) => !options?.minSimilarity || r.score >= options.minSimilarity)
    .map((r) => ({
      id: uuid(),
      documentId: r.metadata?.documentId ?? 'unknown',
      chunkIndex: r.metadata?.chunkIndex ?? 0,
      content: r.text,
      source: r.metadata?.source ?? 'knowledge-pack',
      score: r.score,
    }));
}

/**
 * Search case inputs via QVAC ragSearch on the per-case workspace.
 *
 * Case inputs are ingested into 'rescuemesh-rag/cases/{caseId}' whenever
 * a new input is added. This uses the SAME QVAC ragSearch pipeline as
 * knowledge packs — no keyword matching, pure semantic similarity.
 *
 * For example, a user note "structural collapse on east wing" will
 * semantically match a query like "what are the hazards in the building"
 * because QVAC embeddings capture meaning, not just exact words.
 */
export async function searchCaseInputs(
  query: string,
  caseId: string,
  options?: SearchOptions
): Promise<RetrievedEvidence[]> {
  const modelId = await loadModel({ modelSrc: LLM_MODEL, modelType: 'llm' });
  const topK = options?.topK ?? 5;

  try {
    const results = await ragSearch({
      modelId,
      workspace: `rescuemesh-rag/cases/${caseId}`,
      query,
      topK,
    });

    return results
      .filter((r) => !options?.minSimilarity || r.score >= options.minSimilarity)
      .map((r) => ({
        id: uuid(),
        documentId: r.metadata?.documentId ?? 'unknown',
        chunkIndex: r.metadata?.chunkIndex ?? 0,
        content: r.text,
        source: 'case-input',
        score: r.score,
      }));
  } catch {
    // Case workspace may not exist yet (no inputs ingested)
    return [];
  }
}

/**
 * Search both knowledge packs AND case inputs.
 *
 * Both sources use QVAC ragSearch — no keyword fallback.
 * Results from both workspaces are merged and ranked by score.
 */
export async function searchCaseAndKnowledge(
  query: string,
  caseInputs: Array<{ id: string; content: string }>,
  options?: SearchOptions
): Promise<RetrievedEvidence[]> {
  const topK = options?.topK ?? 5;

  // Search knowledge packs (existing)
  const knowledgeResults = await searchKnowledge(query, { topK });

  // Search case inputs via RAG (NEW — replaces keyword matching)
  const caseId = caseInputs[0]?.id?.split('-')[0] ?? 'unknown';
  const caseResults = await searchCaseInputs(query, caseId, { topK });

  // Merge and rank by score
  const allResults = [...knowledgeResults, ...caseResults];
  allResults.sort((a, b) => b.score - a.score);

  return allResults.slice(0, topK);
}

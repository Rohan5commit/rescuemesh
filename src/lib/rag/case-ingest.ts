// Case Input RAG Ingestion
//
// When case inputs are added (text notes, voice transcriptions, image descriptions),
// they are ingested into a per-case QVAC workspace so they can be searched
// semantically via ragSearch() — not just keyword matching.
//
// Workspace: rescuemesh-rag/cases/{caseId}
// This means "structural collapse on east wing" will match
// "what are the hazards in the building" via semantic similarity.

import { ingestDocument } from './ingest';
import type { IncidentInput } from '../schemas';

/**
 * Ingest a single case input into the per-case QVAC workspace.
 * Called whenever a new input is added to the active case.
 */
export async function ingestCaseInput(
  caseId: string,
  input: IncidentInput
): Promise<void> {
  const title = `${input.type} input — ${new Date(input.metadata.createdAt).toLocaleString()}`;
  const content = input.content;

  if (!content || content.trim().length === 0) return;

  await ingestDocument(title, content, {
    source: 'case-input',
    category: input.type,
    caseId,
    packId: `cases/${caseId}`,
  });
}


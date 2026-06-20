// Grounded Q&A — Ask RescueMesh
import { generate } from '../qvac';
import { searchCaseAndKnowledge } from '../rag/search';
import type { IncidentCase, RetrievedEvidence } from '../schemas';

const QA_SYSTEM_PROMPT = `You are RescueMesh, an emergency response AI copilot running entirely on-device.\n\nYou answer questions using ONLY the provided case context and retrieved evidence.\nRules:\n- Never fabricate information not present in the provided context.\n- If the evidence is insufficient, say so clearly.\n- Cite your sources by referencing [Evidence 1], [Evidence 2], etc.\n- Be concise and actionable.\n- Prioritize life safety in all recommendations.`;

export interface QAResponse {
  answer: string;
  evidence: RetrievedEvidence[];
  confidence: number;
  hasSufficientEvidence: boolean;
}

export async function askRescueMesh(
  question: string,
  caseData: IncidentCase
): Promise<QAResponse> {
  // Retrieve relevant evidence
  const evidence = await searchCaseAndKnowledge(
    question,
    caseData.inputs.map((i) => ({ content: i.content, id: i.id })),
    { topK: 6 }
  );

  // Build context from evidence
  const evidenceContext = evidence
    .map((e, i) => `[Evidence ${i + 1}] (Source: ${e.source}${e.documentName ? ', ' + e.documentName : ''}, Similarity: ${(e.similarity * 100).toFixed(0)}%):\n${e.content}`)
    .join('\n\n');

  const caseContext = caseData.inputs.map((i) => \`[Case Input - ${i.type}]: ${i.content.slice(0, 300)}\`).join('\n');

  const prompt = `Case: ${caseData.title}\nAssessment: ${caseData.assessment?.summary || 'Not yet assessed'}\nCategory: ${caseData.assessment?.category || 'unknown'}\nSeverity: ${caseData.assessment?.severity || 'unknown'}\n\nCase Inputs:\n${caseContext}\n\nRetrieved Evidence:\n${evidenceContext}\n\nQuestion: ${question}`;

  const result = await generate(prompt, QA_SYSTEM_PROMPT, { temperature: 0.1, maxTokens: 1024 });

  const hasSufficientEvidence = evidence.length > 0 && evidence.some((e) => e.similarity > 0.4);
  const confidence = hasSufficientEvidence
    ? Math.min(0.9, evidence.reduce((max, e) => Math.max(max, e.similarity), 0))
    : 0.3;

  return {
    answer: result.text,
    evidence,
    confidence,
    hasSufficientEvidence,
  };
}

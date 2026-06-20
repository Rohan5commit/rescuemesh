// Incident Understanding Engine — powered by QVAC local inference
import { generate } from '../qvac';
import { searchCaseAndKnowledge } from '../rag/search';
import type { IncidentCase, IncidentAssessment, SituationCategory, IncidentSeverity, RetrievedEvidence } from '../schemas';
import { v4 as uuid } from 'uuid';

const ASSESSMENT_SYSTEM_PROMPT = `You are an emergency incident assessment AI running on-device. You analyze field reports and produce structured assessments.

You MUST respond with valid JSON matching this structure:
{
  "category": "fire|flood|medical|hazmat|structural|logistics|weather|other",
  "severity": "critical|high|medium|low",
  "title": "Brief incident title",
  "summary": "2-3 sentence summary",
  "keyHazards": ["hazard1", "hazard2"],
  "affectedPeople": "description of affected people",
  "affectedAssets": "description of affected assets",
  "timeSensitivity": "immediate|hours|days",
  "missingInformation": ["info1", "info2"],
  "recommendedQuestions": ["question1", "question2"]
}

Be factual. Do not speculate beyond what is provided. If information is missing, say so.`;

function parseAssessment(raw: string): Partial<IncidentAssessment> {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    const jsonStr = jsonMatch[1]?.trim() || raw.trim();
    return JSON.parse(jsonStr);
  } catch {
    return {
      category: 'other',
      severity: 'unknown' as IncidentSeverity,
      title: 'Unparsed Incident',
      summary: raw.slice(0, 500),
      keyHazards: [],
      affectedPeople: 'Unknown',
      affectedAssets: 'Unknown',
      timeSensitivity: 'unknown' as any,
      missingInformation: ['Full assessment could not be parsed'],
      recommendedQuestions: [],
    };
  }
}

export async function assessIncident(
  caseData: IncidentCase
): Promise<{ assessment: IncidentAssessment; evidence: RetrievedEvidence[] }> {
  // Gather all case inputs into a prompt
  const inputDescriptions = caseData.inputs.map((inp) => {
    switch (inp.type) {
      case 'text': return `[TEXT INPUT]: ${inp.content}`;
      case 'voice': return `[VOICE NOTE - transcribed]: ${inp.content}`;
      case 'image': return `[IMAGE DESCRIPTION]: ${inp.content}`;
      case 'document': return `[DOCUMENT - ${inp.metadata.filename}]: ${inp.content.slice(0, 1000)}`;
      default: return `[INPUT]: ${inp.content}`;
    }
  }).join('\n\n');

  const prompt = `Analyze this incident and provide a structured assessment:\n\nTitle: ${caseData.title}\nDescription: ${caseData.description}\n\nInputs:\n${inputDescriptions}`;

  // Run local inference
  const result = await generate(prompt, ASSESSMENT_SYSTEM_PROMPT, { temperature: 0.2 });
  const parsed = parseAssessment(result.text);

  // Retrieve relevant evidence from knowledge base
  const evidence = await searchCaseAndKnowledge(
    `${parsed.category || 'emergency'} ${parsed.title || caseData.title} ${(parsed.keyHazards || []).join(' ')}`,
      caseData.id,
      { topK: 6 }
  );

  const assessment: IncidentAssessment = {
    id: uuid(),
    caseId: caseData.id,
    category: (parsed.category as SituationCategory) || 'other',
    severity: (parsed.severity as IncidentSeverity) || 'unknown',
    title: parsed.title || caseData.title,
    summary: parsed.summary || 'Assessment pending review.',
    keyHazards: parsed.keyHazards || [],
    affectedPeople: parsed.affectedPeople || 'Unknown',
    affectedAssets: parsed.affectedAssets || 'Unknown',
    timeSensitivity: parsed.timeSensitivity || 'unknown',
    missingInformation: parsed.missingInformation || [],
    recommendedQuestions: parsed.recommendedQuestions || [],
    confidence: result.text.includes('```') ? 0.8 : 0.6,
    assessedAt: new Date().toISOString(),
  };

  return { assessment, evidence };
}

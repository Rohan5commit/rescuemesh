// Action Plan Generator — powered by QVAC local inference
import { generate } from '../qvac';
import { searchCaseAndKnowledge } from '../rag/search';
import type { IncidentCase, ActionChecklist, ChecklistItem, SafetyWarning, RetrievedEvidence } from '../schemas';
import { v4 as uuid } from 'uuid';

const ACTION_PLAN_PROMPT = `You are an emergency response action planner. Based on an incident assessment and relevant knowledge, generate a practical action plan.

Respond with valid JSON:
{
  "immediatePriorities": [{ "text": "priority task", "priority": "critical|high|medium" }],
  "nextSteps": [{ "text": "step description", "priority": "high|medium|low" }],
  "requiredEquipment": ["equipment1", "equipment2"],
  "safetyWarnings": [{ "warning": "warning text", "severity": "critical|caution|advisory" }],
  "escalationGuidance": "When and how to escalate",
  "handoffSummary": "Brief summary for next responder"
}

Be specific, terse, and practical. Prioritize life safety.`;

function parseActionPlan(raw: string): Partial<ActionChecklist> {
  try {
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    const jsonStr = jsonMatch[1]?.trim() || raw.trim();
    const parsed = JSON.parse(jsonStr);
    return {
      immediatePriorities: (parsed.immediatePriorities || []).map((p: any) => ({
        id: uuid(), text: p.text, priority: p.priority || 'medium', completed: false,
      })),
      nextSteps: (parsed.nextSteps || []).map((s: any) => ({
        id: uuid(), text: s.text, priority: s.priority || 'medium', completed: false,
      })),
      requiredEquipment: parsed.requiredEquipment || [],
      safetyWarnings: (parsed.safetyWarnings || []).map((w: any) => ({
        id: uuid(), warning: w.warning, severity: w.severity || 'caution',
      })),
      escalationGuidance: parsed.escalationGuidance || '',
      handoffSummary: parsed.handoffSummary || '',
    };
  } catch {
    return { immediatePriorities: [], nextSteps: [], requiredEquipment: [], safetyWarnings: [], escalationGuidance: '', handoffSummary: raw.slice(0, 500) };
  }
}

export async function generateActionPlan(
  caseData: IncidentCase
): Promise<{ plan: ActionChecklist; evidence: RetrievedEvidence[] }> {
  const assessment = caseData.assessment;
  const inputSummary = caseData.inputs.map((i) => i.content.slice(0, 300)).join('\n');

  const prompt = `Generate an action plan for this incident:\n\nTitle: ${caseData.title}\nCategory: ${assessment?.category || 'unknown'}\nSeverity: ${assessment?.severity || 'unknown'}\nSummary: ${assessment?.summary || caseData.description}\nKey Hazards: ${(assessment?.keyHazards || []).join(', ')}\nTime Sensitivity: ${assessment?.timeSensitivity || 'unknown'}\n\nCase Inputs:\n${inputSummary}`;

  const result = await generate(prompt, ACTION_PLAN_PROMPT, { temperature: 0.2 });
  const parsed = parseActionPlan(result.text);

  // Get relevant evidence for safety warnings
  const evidence = await searchCaseAndKnowledge(
    `safety warnings ${assessment?.category || 'emergency'} ${(assessment?.keyHazards || []).join(' ')}`,
    caseData.inputs.map((i) => ({ content: i.content, id: i.id })),
    { topK: 4 }
  );

  const plan: ActionChecklist = {
    id: uuid(),
    caseId: caseData.id,
    immediatePriorities: parsed.immediatePriorities || [],
    nextSteps: parsed.nextSteps || [],
    requiredEquipment: parsed.requiredEquipment || [],
    safetyWarnings: parsed.safetyWarnings || [],
    escalationGuidance: parsed.escalationGuidance || '',
    handoffSummary: parsed.handoffSummary || '',
    generatedAt: new Date().toISOString(),
  };

  return { plan, evidence };
}

// Local Case Storage (in-memory + persisted)
import type { IncidentCase, IncidentInput } from '../schemas';
import { v4 as uuid } from 'uuid';

let cases: IncidentCase[] = [];
let activeCaseId: string | undefined;

export function getAllCases(): IncidentCase[] {
  return [...cases].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getActiveCase(): IncidentCase | undefined {
  return cases.find((c) => c.id === activeCaseId);
}

export function setActiveCase(caseId: string | undefined): void {
  activeCaseId = caseId;
}

export function getCaseById(caseId: string): IncidentCase | undefined {
  return cases.find((c) => c.id === caseId);
}

export function createCase(title: string, description: string = ''): IncidentCase {
  const now = new Date().toISOString();
  const incident: IncidentCase = {
    id: uuid(),
    title,
    description,
    severity: 'unknown',
    status: 'active',
    category: 'other',
    reportedAt: now,
    updatedAt: now,
    inputs: [],
  };
  cases.push(incident);
  activeCaseId = incident.id;
  return incident;
}

export function updateCase(caseId: string, updates: Partial<IncidentCase>): IncidentCase | undefined {
  const idx = cases.findIndex((c) => c.id === caseId);
  if (idx === -1) return undefined;
  cases[idx] = { ...cases[idx], ...updates, updatedAt: new Date().toISOString() };
  return cases[idx];
}

export function deleteCase(caseId: string): void {
  cases = cases.filter((c) => c.id !== caseId);
  if (activeCaseId === caseId) activeCaseId = undefined;
}

export function addInputToCase(
  caseId: string,
  input: Omit<IncidentInput, 'id' | 'caseId'>
): IncidentInput | undefined {
  const idx = cases.findIndex((c) => c.id === caseId);
  if (idx === -1) return undefined;
  const newInput: IncidentInput = {
    ...input,
    id: uuid(),
    caseId,
  };
  cases[idx].inputs.push(newInput);
  cases[idx].updatedAt = new Date().toISOString();
  return newInput;
}

export function removeInputFromCase(caseId: string, inputId: string): void {
  const idx = cases.findIndex((c) => c.id === caseId);
  if (idx === -1) return;
  cases[idx].inputs = cases[idx].inputs.filter((i) => i.id !== inputId);
  cases[idx].updatedAt = new Date().toISOString();
}

export function loadCases(loaded: IncidentCase[]): void {
  cases = loaded;
}

export function loadActiveCase(id: string | undefined): void {
  activeCaseId = id;
}

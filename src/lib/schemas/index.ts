// ─── RescueMesh Core Data Models ─────────────────────────────────────────

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'unknown';
export type IncidentStatus = 'active' | 'stabilized' | 'resolved' | 'archived';
export type SituationCategory = 'fire' | 'flood' | 'medical' | 'hazmat' | 'structural' | 'logistics' | 'weather' | 'other';
export type InputType = 'text' | 'voice' | 'image' | 'document';
export type EvidenceSource = 'case_input' | 'knowledge_pack' | 'both';

export interface IncidentCase {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: SituationCategory;
  location?: string;
  reportedAt: string;
  updatedAt: string;
  inputs: IncidentInput[];
  assessment?: IncidentAssessment;
  actionPlan?: ActionChecklist;
  handoffSummary?: HandoffSummary;
  exportedAt?: string;
}

export interface IncidentInput {
  id: string;
  caseId: string;
  type: InputType;
  content: string; // text content or file path
  metadata: {
    filename?: string;
    mimeType?: string;
    duration?: number; // for voice notes
    size?: number;
    createdAt: string;
  };
}

export interface IncidentAssessment {
  id: string;
  caseId: string;
  category: SituationCategory;
  severity: IncidentSeverity;
  title: string;
  summary: string;
  keyHazards: string[];
  affectedPeople: string;
  affectedAssets: string;
  timeSensitivity: 'immediate' | 'hours' | 'days' | 'unknown';
  missingInformation: string[];
  recommendedQuestions: string[];
  confidence: number; // 0-1
  assessedAt: string;
}

export interface ActionChecklist {
  id: string;
  caseId: string;
  immediatePriorities: ChecklistItem[];
  nextSteps: ChecklistItem[];
  requiredEquipment: string[];
  safetyWarnings: SafetyWarning[];
  escalationGuidance: string;
  handoffSummary: string;
  generatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  completed: boolean;
  sourceEvidenceId?: string;
}

export interface SafetyWarning {
  id: string;
  warning: string;
  severity: 'critical' | 'caution' | 'advisory';
  sourceEvidenceId?: string;
}

export interface KnowledgeDocument {
  id: string;
  filename: string;
  packId: string;
  content: string;
  chunks: KnowledgeChunk[];
  metadata: {
    title?: string;
    category?: string;
    source?: string;
    ingestedAt: string;
  };
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  embedding?: number[];
}

export interface KnowledgePack {
  id: string;
  name: string;
  description: string;
  category: string;
  documents: KnowledgeDocument[];
  version: string;
  createdAt: string;
}

export interface RetrievedEvidence {
  id: string;
  content: string;
  source: EvidenceSource;
  documentName?: string;
  documentId?: string;
  chunkIndex?: number;
  similarity: number; // 0-1
  excerpt: string;
  caseInputId?: string;
}

export interface HandoffSummary {
  caseTitle: string;
  severity: IncidentSeverity;
  category: SituationCategory;
  keyFacts: string[];
  actionsTaken: string[];
  currentStatus: string;
  nextSteps: string[];
  warnings: string[];
  generatedAt: string;
}

export interface PeerDevice {
  id: string;
  name: string;
  publicKey: string;
  status: 'available' | 'busy' | 'offline';
  capabilities: string[];
  lastSeen: string;
  deviceType: 'laptop' | 'mobile' | 'desktop';
}

export interface ComputeTask {
  id: string;
  type: 'indexing' | 'summarization' | 'analysis' | 'embedding';
  status: 'pending' | 'delegated' | 'running' | 'completed' | 'failed';
  payload: string;
  result?: string;
  assignedTo?: string; // peer device id
  createdAt: string;
  completedAt?: string;
  isLocal: boolean;
}

export interface ExportArtifact {
  id: string;
  caseId: string;
  type: 'incident-report' | 'action-checklist' | 'handoff-note' | 'full-export';
  content: string;
  format: 'markdown' | 'json' | 'text';
  createdAt: string;
}

export interface QVACState {
  modelsLoaded: boolean;
  llmModelId?: string;
  embedModelId?: string;
  providerRunning: boolean;
  loading: boolean;
  error?: string;
}

export interface AppState {
  cases: IncidentCase[];
  activeCaseId?: string;
  knowledgePacks: KnowledgePack[];
  peerDevices: PeerDevice[];
  computeTasks: ComputeTask[];
  qvac: QVACState;
}

import { create } from 'zustand';
import type {
  IncidentCase,
  IncidentAssessment,
  ActionChecklist,
  KnowledgePack,
  PeerDevice,
  ComputeTask,
  QVACState,
  RetrievedEvidence,
} from '../lib/schemas';
import * as CaseStore from '../lib/case/store';
import { assessIncident } from '../lib/case/assessment';
import { generateActionPlan } from '../lib/case/action-plan';
import { askRescueMesh, type QAResponse } from '../lib/case/grounded-qa';
import { getKnowledgePacks, setKnowledgePacks, loadDemoKnowledgePacks } from '../lib/rag/knowledge-pack';
import { discoverPeers, getDiscoveredPeers, shareKnowledgePack, getShareHistory } from '../lib/p2p/sharing';
import { createComputeTask, delegateTask, executeOnPeer, executeLocally, getComputeTasks } from '../lib/delegated-compute';
import { generateIncidentReport, generateActionChecklistReport, generateHandoffNote } from '../lib/export/report';
import type { ComputeTask as CT } from '../lib/schemas';

type Screen = 'landing' | 'dashboard' | 'intake' | 'action-plan' | 'ask' | 'evidence' | 'p2p' | 'architecture' | 'export';

interface AppState {
  // Navigation
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;

  // Cases
  cases: IncidentCase[];
  activeCase: IncidentCase | undefined;
  selectCase: (id: string) => void;
  createCase: (title: string, description?: string) => IncidentCase;
  updateActiveCase: (updates: Partial<IncidentCase>) => void;
  deleteCase: (id: string) => void;

  // Assessment
  assessing: boolean;
  assessmentEvidence: RetrievedEvidence[];
  runAssessment: () => Promise<void>;

  // Action Plan
  generatingPlan: boolean;
  planEvidence: RetrievedEvidence[];
  generatePlan: () => Promise<void>;
  toggleChecklistItem: (planId: string, listKey: 'immediatePriorities' | 'nextSteps', itemId: string) => void;

  // Q&A
  qaHistory: Array<{ question: string; response: QAResponse };
  askingQA: boolean;
  askQuestion: (question: string) => Promise<void>;

  // Knowledge
  knowledgePacks: KnowledgePack[];
  loadDemoPacks: () => Promise<void>;

  // P2P
  peers: PeerDevice[];
  shareHistory: Array<{ packId: string; peerId: string; timestamp: string; status: string }>;
  scanningPeers: boolean;
  scanPeers: () => Promise<void>;
  sharePack: (packId: string, peerId: string) => Promise<void>;

  // Delegated Compute
  computeTasks: CT[];
  offloading: boolean;
  createAndDelegateTask: (type: CT['type'], payload: string, peer: PeerDevice) => Promise<void>;
  createAndRunLocally: (type: CT['type'], payload: string) => Promise<void>;

  // Export
  exportReport: () => string;
  exportChecklist: () => string;
  exportHandoff: () => string;

  // QVAC
  qvac: QVACState;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'landing',
  setScreen: (screen) => set({ currentScreen: screen }),

  cases: [],
  activeCase: undefined,
  selectCase: (id) => {
    CaseStore.setActiveCase(id);
    set({ activeCase: CaseStore.getCaseById(id), currentScreen: 'dashboard' });
  },
  createCase: (title, description) => {
    const c = CaseStore.createCase(title, description);
    set({ cases: CaseStore.getAllCases(), activeCase: c, currentScreen: 'intake' });
    return c;
  },
  updateActiveCase: (updates) => {
    const active = get().activeCase;
    if (!active) return;
    const updated = CaseStore.updateCase(active.id, updates);
    set({ activeCase: updated, cases: CaseStore.getAllCases() });
  },
  deleteCase: (id) => {
    CaseStore.deleteCase(id);
    set({ cases: CaseStore.getAllCases(), activeCase: undefined, currentScreen: 'dashboard' });
  },

  assessing: false,
  assessmentEvidence: [],
  runAssessment: async () => {
    const active = get().activeCase;
    if (!active || active.inputs.length === 0) return;
    set({ assessing: true });
    try {
      const { assessment, evidence } = await assessIncident(active);
      CaseStore.updateCase(active.id, { assessment, category: assessment.category, severity: assessment.severity });
      set({
        assessing: false,
        activeCase: CaseStore.getCaseById(active.id),
        cases: CaseStore.getAllCases(),
        assessmentEvidence: evidence,
      });
    } catch (err) {
      console.error('Assessment failed:', err);
      set({ assessing: false });
    }
  },

  generatingPlan: false,
  planEvidence: [],
  generatePlan: async () => {
    const active = get().activeCase;
    if (!active) return;
    set({ generatingPlan: true });
    try {
      const { plan, evidence } = await generateActionPlan(active);
      CaseStore.updateCase(active.id, { actionPlan: plan });
      set({
        generatingPlan: false,
        activeCase: CaseStore.getCaseById(active.id),
        cases: CaseStore.getAllCases(),
        planEvidence: evidence,
        currentScreen: 'action-plan',
      });
    } catch (err) {
      console.error('Plan generation failed:', err);
      set({ generatingPlan: false });
    }
  },

  toggleChecklistItem: (planId, listKey, itemId) => {
    const active = get().activeCase;
    if (!active?.actionPlan) return;
    const items = active.actionPlan[listKey];
    const updated = items.map((i) => i.id === itemId ? { ...i, completed: !i.completed } : i);
    CaseStore.updateCase(active.id, {
      actionPlan: { ...active.actionPlan, [listKey]: updated },
    });
    set({ activeCase: CaseStore.getCaseById(active.id) });
  },

  qaHistory: [],
  askingQA: false,
  askQuestion: async (question) => {
    const active = get().activeCase;
    if (!active) return;
    set({ askingQA: true });
    try {
      const response = await askRescueMesh(question, active);
      set((s) => ({
        qaHistory: [...s.qaHistory, { question, response }],
        askingQA: false,
      }));
    } catch (err) {
      console.error('QA failed:', err);
      set({ askingQA: false });
    }
  },

  knowledgePacks: [],
  loadDemoPacks: async () => {
    const packs = await loadDemoKnowledgePacks();
    set({ knowledgePacks: packs });
  },

  peers: [],
  shareHistory: [],
  scanningPeers: false,
  scanPeers: async () => {
    set({ scanningPeers: true });
    const peers = await discoverPeers();
    set({ peers, scanningPeers: false, shareHistory: getShareHistory() });
  },
  sharePack: async (packId, peerId) => {
    const pack = get().knowledgePacks.find((p) => p.id === packId);
    if (!pack) return;
    const result = await shareKnowledgePack(pack, peerId);
    set({ shareHistory: getShareHistory() });
    return result as any;
  },

  computeTasks: [],
  offloading: false,
  createAndDelegateTask: async (type, payload, peer) => {
    set({ offloading: true });
    const task = createComputeTask(type, payload);
    delegateTask(task.id, peer);
    set({ computeTasks: getComputeTasks() });
    await executeOnPeer(task, peer);
    set({ computeTasks: getComputeTasks(), offloading: false });
  },
  createAndRunLocally: async (type, payload) => {
    set({ offloading: true });
    const task = createComputeTask(type, payload);
    set({ computeTasks: getComputeTasks() });
    await executeLocally(task);
    set({ computeTasks: getComputeTasks(), offloading: false });
  },

  exportReport: () => {
    const active = get().activeCase;
    return active ? generateIncidentReport(active) : '';
  },
  exportChecklist: () => {
    const active = get().activeCase;
    return active ? generateActionChecklistReport(active) : '';
  },
  exportHandoff: () => {
    const active = get().activeCase;
    return active ? generateHandoffNote(active) : '';
  },

  qvac: {
    modelsLoaded: false,
    providerRunning: false,
    loading: false,
  },
}));

// Knowledge Pack Management
// Loads demo knowledge packs from assets/demo-knowledge-packs/*.json

import type { KnowledgePack, KnowledgeDocument } from '../schemas';
import { ingestDocument } from './ingest';
import { v4 as uuid } from 'uuid';

let knowledgePacks: KnowledgePack[] = [];

export function getKnowledgePacks(): KnowledgePack[] {
  return [...knowledgePacks];
}

export function setKnowledgePacks(packs: KnowledgePack[]): void {
  knowledgePacks = packs;
}

export function createKnowledgePack(
  name: string,
  description: string
): KnowledgePack {
  const pack: KnowledgePack = {
    id: uuid(),
    name,
    description,
    documents: [],
    createdAt: new Date().toISOString(),
    version: '1.0.0',
  };
  knowledgePacks.push(pack);
  return pack;
}

export async function addDocumentToPack(
  packId: string,
  title: string,
  content: string,
  metadata?: Partial<KnowledgeDocument['metadata']>
): Promise<KnowledgeDocument> {
  const doc = await ingestDocument(title, content, {
    source: 'demo-pack',
    ...metadata,
  });

  const pack = knowledgePacks.find((p) => p.id === packId);
  if (pack) {
    pack.documents.push(doc);
  }
  return doc;
}

export function removeKnowledgePack(packId: string): void {
  knowledgePacks = knowledgePacks.filter((p) => p.id !== packId);
}

export function getPackById(packId: string): KnowledgePack | undefined {
  return knowledgePacks.find((p) => p.id === packId);
}

// --- Demo Knowledge Pack Loading ---
//
// Pack JSON files live in assets/demo-knowledge-packs/<category>/pack.json
// Each file contains: { id, name, description, version, documents: [{ id, title, content, metadata }] }
//
// In Vite, we import JSON files directly as modules.
// The packManifest array below maps each pack to its import path.

import firePack from '../../../assets/demo-knowledge-packs/fire-safety/pack.json';
import floodPack from '../../../assets/demo-knowledge-packs/flood-relief/pack.json';
import medicalPack from '../../../assets/demo-knowledge-packs/medical-emergency/pack.json';
import logisticsPack from '../../../assets/demo-knowledge-packs/logistics/pack.json';

const PACK_MANIFEST = [
  firePack,
  floodPack,
  medicalPack,
  logisticsPack,
] as const;

/**
 * Load all demo knowledge packs from JSON assets.
 *
 * Each pack JSON file contains the full document content (real emergency SOPs).
 * Documents are ingested into the RAG system via ingestDocument().
 */
export async function loadDemoKnowledgePacks(): Promise<KnowledgePack[]> {
  const loaded: KnowledgePack[] = [];

  for (const packData of PACK_MANIFEST) {
    const pack = createKnowledgePack(packData.name, packData.description);

    for (const doc of packData.documents) {
      await addDocumentToPack(pack.id, doc.title, doc.content, {
        source: doc.metadata?.source ?? 'demo-pack',
        category: doc.metadata?.category ?? packData.name,
      });
    }

    loaded.push(pack);
  }

  return loaded;
}

/**
 * Load a single knowledge pack from a JSON file path.
 * Useful for importing custom packs at runtime.
 */
export async function loadKnowledgePackFromJSON(
  packData: typeof PACK_MANIFEST[number]
): Promise<KnowledgePack> {
  const pack = createKnowledgePack(packData.name, packData.description);

  for (const doc of packData.documents) {
    await addDocumentToPack(pack.id, doc.title, doc.content, {
      source: doc.metadata?.source ?? 'imported-pack',
      category: doc.metadata?.category ?? packData.name,
    });
  }

  return pack;
}

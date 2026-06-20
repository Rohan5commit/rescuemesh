// Knowledge Pack Management
import type { KnowledgePack, KnowledgeDocument } from '../schemas';
import { ingestDocument } from './ingest';
import { v4 as uuid } from 'uuid';

// In-memory knowledge pack store (persisted via Tauri)
let knowledgePacks: KnowledgePack[] = [];

export function getKnowledgePacks(): KnowledgePack[] {
  return knowledgePacks;
}

export function setKnowledgePacks(packs: KnowledgePack[]): void {
  knowledgePacks = packs;
}

export function createKnowledgePack(
  name: string,
  description: string,
  category: string
): KnowledgePack {
  const pack: KnowledgePack = {
    id: uuid(),
    name,
    description,
    category,
    documents: [],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
  };
  knowledgePacks.push(pack);
  return pack;
}

export async function addDocumentToPack(
  packId: string,
  filename: string,
  content: string,
  metadata?: { title?: string; category?: string; source?: string }
): Promise<KnowledgeDocument> {
  const doc = await ingestDocument(filename, content, packId, metadata);
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

// Pre-built demo knowledge pack content
export const DEMO_KNOWLEDGE: Record<string, { title: string; content: string }[]> = {
  fire: [
    {
      title: 'Fire Emergency Response SOP',
      content: `SECTION 1: INITIAL RESPONSE\nUpon detecting fire or smoke:\n1. Activate nearest fire alarm if available.\n2. Evacuate all personnel from immediate area.\n3. Call emergency services (911/local equivalent).\n4. Close doors behind you to slow fire spread.\n5. Do NOT use elevators.\n\nSECTION 2: ASSESSMENT\nBefore re-entering:\n- Confirm fire department has been notified.\n- Assess smoke conditions (light grey = early, black = advanced).\n- Check for visible flames, heat sources.\n- Identify escape routes and rally points.\n- Account for all personnel at designated assembly area.\n\nSECTION 3: SUPPRESSION (trained personnel only)\n- Use PASS technique with fire extinguisher: Pull pin, Aim at base, Squeeze handle, Sweep side to side.\n- Only fight fire if: escape route is behind you, fire is smaller than a wastebasket, you have appropriate extinguisher.\n- If fire exceeds trash-can size, EVACUATE IMMEDIATELY.\n\nSECTION 4: SAFETY WARNINGS\n- Never re-enter a burning building without authorization.\n- Watch for flashover conditions (entire room ignites simultaneously).\n- Carbon monoxide is colorless and deadly.\n- Structural damage may cause collapse.\n- Hazmat materials may be present.`,
    },
    {
      title: 'Smoke Inhalation First Aid',
      content: `SMOKE INHALATION TREATMENT:\n1. Move victim to fresh air immediately.\n2. Call emergency services.\n3. If not breathing, begin CPR.\n4. If breathing, keep victim calm and still.\n5. Monitor for: coughing, difficulty breathing, burns around nose/mouth, soot in nostrils.\n6. Give oxygen if available and trained.\n7. Do NOT give food or water to conscious victims (may need intubation).\n8. Watch for delayed symptoms up to 48 hours.`,
    },
  ],
  flood: [
    {
      title: 'Flood Relief Distribution Protocol',
      content: `SECTION 1: DISTRIBUTION POINT SETUP\n1. Select high ground, away from water flow.\n2. Ensure vehicle access for supply delivery.\n3. Set up canopy/tent for weather protection.\n4. Establish clear entry/exit flow.\n5. Post signage in multiple languages.\n6. Set up separate lines for: registration, medical screening, supply distribution.\n\nSECTION 2: SUPPLY PRIORITIES\nPriority 1 (Life-saving): Clean water, purification tablets, emergency blankets, first aid kits.\nPriority 2 (Health): Medications, hygiene supplies, baby formula/diapers.\nPriority 3 (Sustenance): Non-perishable food, cooking implements, water containers.\nPriority 4 (Shelter): Tarps, rope, tools, sleeping bags.\n\nSECTION 3: SAFETY\n- Do not wade through moving water above knee height.\n- Watch for displaced wildlife (snakes, insects).\n- All water must be tested or purified before distribution.\n- Maintain sanitation facilities at distribution point.\n- Report any disease outbreaks immediately.`,
    },
  ],
  medical: [
    {
      title: 'Campus Medical Emergency Response',
      content: `SECTION 1: INITIAL ASSESSMENT (DRABC)\nD - Danger: Check scene safety first.\nR - Response: Check if person responds to voice/touch.\nA - Airway: Open airway with head tilt/chin lift.\nB - Breathing: Look, listen, feel for breathing (10 seconds).\nC - Circulation: Check for pulse, severe bleeding.\n\nSECTION 2: IMMEDIATE ACTIONS\n- Call campus emergency number or 911.\n- Send someone to guide EMS to location.\n- Do NOT move person unless in immediate danger.\n- Stay with person and keep them warm.\n\nSECTION 3: COMMON SCENARIOS\nChoking: 5 back blows, 5 abdominal thrusts (Heimlich). Repeat.\nSevere bleeding: Apply direct pressure with clean cloth. Elevate if possible. Apply tourniquet if trained.\nAllergic reaction: Help administer EpiPen if available. Monitor airway.\nFainting: Elevate legs. Check airway. Monitor consciousness.\nSeizure: Protect head. Do NOT restrain. Clear area. Time the seizure.\n\nSECTION 4: DOCUMENTATION\nRecord: time of incident, actions taken, person's response, EMS arrival time, handoff details.`,
    },
  ],
  logistics: [
    {
      title: 'Field Logistics Disruption Response',
      content: `SECTION 1: ASSESSMENT\n1. Identify nature of disruption (road closure, vehicle failure, weather, security).\n2. Assess impact on supply chain and personnel movement.\n3. Determine timeline for resolution.\n4. Identify alternative routes and resources.\n\nSECTION 2: CONTINGENCY ACTIONS\n- Activate backup supply sources.\n- Reroute personnel via alternate paths.\n- Contact local authorities for situation updates.\n- Implement rationing protocols if supplies are limited.\n- Set up communication relay if primary channels are down.\n\nSECTION 3: COMMUNICATIONS\n- Establish check-in schedule with all teams.\n- Use satellite phone or radio if cellular is down.\n- Send situation reports every 2 hours.\n- Maintain log of all decisions and resource allocations.`,
    },
  ],
};

export async function loadDemoKnowledgePacks(): Promise<KnowledgePack[]> {
  const packs: KnowledgePack[] = [];

  for (const [category, docs] of Object.entries(DEMO_KNOWLEDGE)) {
    const pack = createKnowledgePack(
      `${category.charAt(0).toUpperCase() + category.slice(1)} Response`,
      \`Pre-built knowledge pack for ${category} emergencies\`,
      category
    );

    for (const doc of docs) {
      await addDocumentToPack(pack.id, doc.title, doc.content, {
        title: doc.title,
        category,
        source: 'demo-pack',
      });
    }

    packs.push(pack);
  }

  return packs;
}

// Knowledge Pack Management
import type { KnowledgePack, KnowledgeDocument } from '../schemas';
import { ingestDocument } from './ingest';
import { v4 as uuid } from 'uuid';

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
const FIRE_SOP = [
  'SECTION 1: INITIAL RESPONSE',
  'Upon detecting fire or smoke:',
  '1. Activate nearest fire alarm if available.',
  '2. Evacuate all personnel from immediate area.',
  '3. Call emergency services (911/local equivalent).',
  '4. Close doors behind you to slow fire spread.',
  '5. Do NOT use elevators.',
  '',
  'SECTION 2: ASSESSMENT',
  'Before re-entering:',
  '- Confirm fire department has been notified.',
  '- Assess smoke conditions (light grey = early, black = advanced).',
  '- Check for visible flames, heat sources.',
  '- Identify escape routes and rally points.',
  '- Account for all personnel at designated assembly area.',
  '',
  'SECTION 3: SUPPRESSION (trained personnel only)',
  '- Use PASS technique with fire extinguisher: Pull pin, Aim at base, Squeeze handle, Sweep side to side.',
  '- Only fight fire if: escape route is behind you, fire is smaller than a wastebasket.',
  '- If fire exceeds trash-can size, EVACUATE IMMEDIATELY.',
  '',
  'SECTION 4: SAFETY WARNINGS',
  '- Never re-enter a burning building without authorization.',
  '- Watch for flashover conditions (entire room ignites simultaneously).',
  '- Carbon monoxide is colorless and deadly.',
  '- Structural damage may cause collapse.',
].join('\n');

const SMOKE_INHALATION = [
  'SMOKE INHALATION TREATMENT:',
  '1. Move victim to fresh air immediately.',
  '2. Call emergency services.',
  '3. If not breathing, begin CPR.',
  '4. If breathing, keep victim calm and still.',
  '5. Monitor for: coughing, difficulty breathing, burns around nose/mouth.',
  '6. Give oxygen if available and trained.',
  '7. Do NOT give food or water to conscious victims (may need intubation).',
  '8. Watch for delayed symptoms up to 48 hours.',
].join('\n');

const FLOOD_PROTOCOL = [
  'SECTION 1: DISTRIBUTION POINT SETUP',
  '1. Select high ground, away from water flow.',
  '2. Ensure vehicle access for supply delivery.',
  '3. Set up canopy/tent for weather protection.',
  '4. Establish clear entry/exit flow.',
  '5. Post signage in multiple languages.',
  '6. Set up separate lines for: registration, medical screening, supply distribution.',
  '',
  'SECTION 2: SUPPLY PRIORITIES',
  'Priority 1 (Life-saving): Clean water, purification tablets, emergency blankets, first aid kits.',
  'Priority 2 (Health): Medications, hygiene supplies, baby formula/diapers.',
  'Priority 3 (Sustenance): Non-perishable food, cooking implements, water containers.',
  'Priority 4 (Shelter): Tarps, rope, tools, sleeping bags.',
  '',
  'SECTION 3: SAFETY',
  '- Do not wade through moving water above knee height.',
  '- Watch for displaced wildlife (snakes, insects).',
  '- All water must be tested or purified before distribution.',
  '- Maintain sanitation facilities at distribution point.',
  '- Report any disease outbreaks immediately.',
].join('\n');

const MEDICAL_RESPONSE = [
  'SECTION 1: INITIAL ASSESSMENT (DRABC)',
  'D - Danger: Check scene safety first.',
  'R - Response: Check if person responds to voice/touch.',
  'A - Airway: Open airway with head tilt/chin lift.',
  'B - Breathing: Look, listen, feel for breathing (10 seconds).',
  'C - Circulation: Check for pulse, severe bleeding.',
  '',
  'SECTION 2: IMMEDIATE ACTIONS',
  '- Call campus emergency number or 911.',
  '- Send someone to guide EMS to location.',
  '- Do NOT move person unless in immediate danger.',
  '- Stay with person and keep them warm.',
  '',
  'SECTION 3: COMMON SCENARIOS',
  'Choking: 5 back blows, 5 abdominal thrusts (Heimlich). Repeat.',
  'Severe bleeding: Apply direct pressure with clean cloth. Elevate if possible.',
  'Allergic reaction: Help administer EpiPen if available. Monitor airway.',
  'Fainting: Elevate legs. Check airway. Monitor consciousness.',
  'Seizure: Protect head. Do NOT restrain. Clear area. Time the seizure.',
  '',
  'SECTION 4: DOCUMENTATION',
  'Record: time of incident, actions taken, person response, EMS arrival time, handoff details.',
].join('\n');

const LOGISTICS_RESPONSE = [
  'SECTION 1: ASSESSMENT',
  '1. Identify nature of disruption (road closure, vehicle failure, weather, security).',
  '2. Assess impact on supply chain and personnel movement.',
  '3. Determine timeline for resolution.',
  '4. Identify alternative routes and resources.',
  '',
  'SECTION 2: CONTINGENCY ACTIONS',
  '- Activate backup supply sources.',
  '- Reroute personnel via alternate paths.',
  '- Contact local authorities for situation updates.',
  '- Implement rationing protocols if supplies are limited.',
  '- Set up communication relay if primary channels are down.',
  '',
  'SECTION 3: COMMUNICATIONS',
  '- Establish check-in schedule with all teams.',
  '- Use satellite phone or radio if cellular is down.',
  '- Send situation reports every 2 hours.',
  '- Maintain log of all decisions and resource allocations.',
].join('\n');

export const DEMO_KNOWLEDGE: Record<string, { title: string; content: string }[]> = {
  fire: [
    { title: 'Fire Emergency Response SOP', content: FIRE_SOP },
    { title: 'Smoke Inhalation First Aid', content: SMOKE_INHALATION },
  ],
  flood: [
    { title: 'Flood Relief Distribution Protocol', content: FLOOD_PROTOCOL },
  ],
  medical: [
    { title: 'Campus Medical Emergency Response', content: MEDICAL_RESPONSE },
  ],
  logistics: [
    { title: 'Field Logistics Disruption Response', content: LOGISTICS_RESPONSE },
  ],
};

export async function loadDemoKnowledgePacks(): Promise<KnowledgePack[]> {
  const packs: KnowledgePack[] = [];

  for (const [category, docs] of Object.entries(DEMO_KNOWLEDGE)) {
    const pack = createKnowledgePack(
      category.charAt(0).toUpperCase() + category.slice(1) + ' Response',
      'Pre-built knowledge pack for ' + category + ' emergencies',
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

// P2P Knowledge/Model Pack Sharing via Holepunch
import type { PeerDevice, KnowledgePack } from '../schemas';
import { v4 as uuid } from 'uuid';

let discoveredPeers: PeerDevice[] = [];
let shareHistory: Array<{ packId: string; peerId: string; timestamp: string; status: string }> = [];

// Simulated peer discovery (in production uses Hyperswarm DHT)
const DEMO_PEERS: PeerDevice[] = [
  {
    id: 'peer-alpha',
    name: 'Field Unit Alpha',
    publicKey: 'ed25519:alpha-key-demo-12345678',
    status: 'available',
    capabilities: ['inference', 'storage'],
    lastSeen: new Date().toISOString(),
    deviceType: 'laptop',
  },
  {
    id: 'peer-bravo',
    name: 'Command Post Bravo',
    publicKey: 'ed25519:bravo-key-demo-87654321',
    status: 'available',
    capabilities: ['inference', 'storage', 'indexing'],
    lastSeen: new Date(Date.now() - 300000).toISOString(),
    deviceType: 'desktop',
  },
  {
    id: 'peer-charlie',
    name: 'Mobile Unit Charlie',
    publicKey: 'ed25519:charlie-key-demo-11223344',
    status: 'offline',
    capabilities: ['inference'],
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    deviceType: 'mobile',
  },
];

export async function discoverPeers(): Promise<PeerDevice[]> {
  // In production: startQVACProvider() + Hyperswarm discovery
  // For demo, simulate discovery
  discoveredPeers = DEMO_PEERS;
  return discoveredPeers;
}

export function getDiscoveredPeers(): PeerDevice[] {
  return [...discoveredPeers];
}

export async function shareKnowledgePack(
  pack: KnowledgePack,
  peerId: string
): Promise<{ success: boolean; message: string }> {
  const peer = discoveredPeers.find((p) => p.id === peerId);
  if (!peer) return { success: false, message: 'Peer not found' };
  if (peer.status !== 'available') return { success: false, message: 'Peer is not available' };

  // Simulate P2P transfer via Holepunch
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const record = {
    packId: pack.id,
    peerId,
    timestamp: new Date().toISOString(),
    status: 'completed',
  };
  shareHistory.push(record);

  return {
    success: true,
    message: \`Knowledge pack \"${pack.name}\" shared with ${peer.name} via P2P\`,
  };
}

export function getShareHistory() {
  return [...shareHistory];
}

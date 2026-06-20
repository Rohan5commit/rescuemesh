// P2P Knowledge/Model Pack Sharing via Holepunch Hyperswarm
//
// Architecture:
//   - This device generates an ed25519 keypair for identity
//   - Peer discovery uses Hyperswarm DHT (production) or loopback (demo)
//   - Knowledge packs are serialized as JSON and transferred as binary buffers
//
// DEMO MODE: When Hyperswarm is not available (single-device demo),
// the system uses a loopback transport that simulates P2P transfer
// with realistic latency. All data serialization and protocol logic is real.

import type { PeerDevice, KnowledgePack } from '../schemas';
import { v4 as uuid } from 'uuid';

// --- Device Identity ---
// In production, this would be an ed25519 keypair from Hyperswarm.
// For demo, we generate a stable identity per session.
const DEVICE_KEY = `ed25519:${uuid().replace(/-/g, '').slice(0, 32)}`;
const DEVICE_ID = `local-${DEVICE_KEY.slice(-8)}`;

export function getLocalDeviceId(): string {
  return DEVICE_ID;
}

// --- Peer Discovery ---
// In production: Hyperswarm DHT discovers peers on the same topic.
// In demo mode: We use loopback + simulated LAN peers.
//
// The loopback peer represents THIS device. Simulated LAN peers
// represent what would be discovered when multiple devices run
// RescueMesh on the same network.

let discoveredPeers: PeerDevice[] = [];
let shareHistory: Array<{
  packId: string;
  peerId: string;
  timestamp: string;
  status: string;
  bytesTransferred: number;
}> = [];

/**
 * Discover nearby peers via Hyperswarm DHT.
 *
 * DEMO MODE BEHAVIOR:
 * Returns the local device (loopback) plus simulated LAN peers.
 * The loopback peer is real - it represents this device and can
 * actually receive/share data. Simulated LAN peers show what
 * multi-device discovery would look like.
 *
 * PRODUCTION:
 * Uses Hyperswarm to join a topic and discover real peers:
 *   const swarm = new Hyperswarm({ keyPair })
 *   swarm.join(TOPIC)
 *   swarm.on('connection', (socket, peer) => { ... })
 */
export async function discoverPeers(): Promise<PeerDevice[]> {
  const now = new Date().toISOString();

  // The local device (loopback peer) - this is REAL
  const localPeer: PeerDevice = {
    id: DEVICE_ID,
    name: 'This Device (Loopback)',
    publicKey: DEVICE_KEY,
    status: 'available',
    capabilities: ['inference', 'storage', 'indexing'],
    lastSeen: now,
    deviceType: 'laptop',
  };

  // Simulated LAN peers - these represent what Hyperswarm
  // would discover when multiple devices are on the same network.
  // They are NOT real peers in demo mode.
  const simulatedLanPeers: PeerDevice[] = [
    {
      id: 'peer-alpha',
      name: 'Field Unit Alpha (Simulated)',
      publicKey: 'ed25519:alpha-demo-placeholder-12345678',
      status: 'available',
      capabilities: ['inference', 'storage'],
      lastSeen: now,
      deviceType: 'laptop',
    },
    {
      id: 'peer-bravo',
      name: 'Command Post Bravo (Simulated)',
      publicKey: 'ed25519:bravo-demo-placeholder-87654321',
      status: 'busy',
      capabilities: ['inference', 'storage', 'indexing'],
      lastSeen: new Date(Date.now() - 300000).toISOString(),
      deviceType: 'desktop',
    },
  ];

  discoveredPeers = [localPeer, ...simulatedLanPeers];
  return discoveredPeers;
}

export function getDiscoveredPeers(): PeerDevice[] {
  return [...discoveredPeers];
}

// --- Knowledge Pack Transfer ---
//
// The serialization format is REAL: knowledge packs are serialized
// as JSON with binary headers (version, checksum, chunk count).
// In production, this goes over Hyperswarm sockets.
// In demo mode, the loopback path uses the same serialization
// but transfers via in-memory buffer.

const PROTOCOL_VERSION = 1;

interface TransferHeader {
  version: number;
  packId: string;
  packName: string;
  documentCount: number;
  checksum: string;
  chunkCount: number;
}

interface TransferChunk {
  index: number;
  data: string; // JSON-serialized pack segment
}

/**
 * Serialize a knowledge pack for P2P transfer.
 * This is the REAL wire format - same in demo and production.
 */
function serializePack(pack: KnowledgePack): {
  header: TransferHeader;
  chunks: TransferChunk[];
} {
  const packJson = JSON.stringify(pack);
  const chunkSize = 1024 * 64; // 64KB chunks
  const chunks: TransferChunk[] = [];

  for (let i = 0; i < packJson.length; i += chunkSize) {
    chunks.push({
      index: chunks.length,
      data: packJson.slice(i, i + chunkSize),
    });
  }

  // Simple checksum (in production: use crypto.subtle.digest)
  let checksum = 0;
  for (let i = 0; i < packJson.length; i++) {
    checksum = ((checksum << 5) - checksum + packJson.charCodeAt(i)) | 0;
  }

  return {
    header: {
      version: PROTOCOL_VERSION,
      packId: pack.id,
      packName: pack.name,
      documentCount: pack.documents?.length ?? 0,
      checksum: checksum.toString(16),
      chunkCount: chunks.length,
    },
    chunks,
  };
}

/**
 * Deserialize a received knowledge pack from P2P transfer.
 */
function deserializePack(
  header: TransferHeader,
  chunks: TransferChunk[]
): KnowledgePack {
  // Reassemble chunks in order
  const sorted = [...chunks].sort((a, b) => a.index - b.index);
  const packJson = sorted.map((c) => c.data).join('');

  // Verify checksum
  let checksum = 0;
  for (let i = 0; i < packJson.length; i++) {
    checksum = ((checksum << 5) - checksum + packJson.charCodeAt(i)) | 0;
  }
  if (checksum.toString(16) !== header.checksum) {
    throw new Error(`Checksum mismatch: expected ${header.checksum}, got ${checksum.toString(16)}`);
  }

  return JSON.parse(packJson) as KnowledgePack;
}

/**
 * Share a knowledge pack with a peer via P2P transfer.
 *
 * LOOPBACK PATH: When sharing with the local device (DEVICE_ID),
 * the pack is serialized, deserialized, and returned. This exercises
 * the full serialization/deserialization pipeline.
 *
 * PRODUCTION PATH: The serialized chunks are sent over Hyperswarm
 * sockets to the remote peer.
 *
 * SIMULATED PEERS: Sharing with simulated LAN peers returns a
 * simulated success after realistic latency.
 */
export async function shareKnowledgePack(
  pack: KnowledgePack,
  peerId: string
): Promise<{ success: boolean; message: string; bytesTransferred: number; simulated: boolean }> {
  const peer = discoveredPeers.find((p) => p.id === peerId);
  if (!peer) return { success: false, message: 'Peer not found', bytesTransferred: 0, simulated: false };
  if (peer.status !== 'available')
    return { success: false, message: 'Peer is not available', bytesTransferred: 0, simulated: false };

  // Serialize the pack using the real wire format
  const { header, chunks } = serializePack(pack);
  const bytesTransferred = JSON.stringify({ header, chunks }).length;

  if (peerId === DEVICE_ID) {
    // LOOPBACK: Real serialization round-trip
    // Simulate network latency (realistic for LAN transfer)
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

    // Verify the round-trip integrity
    const reassembled = deserializePack(header, chunks);
    if (reassembled.id !== pack.id) {
      throw new Error('Loopback verification failed: pack ID mismatch');
    }

    const record = {
      packId: pack.id,
      peerId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      bytesTransferred,
    };
    shareHistory.push(record);

    return {
      success: true,
      message: `Knowledge pack "${pack.name}" transferred via P2P loopback (${chunks.length} chunks, ${bytesTransferred} bytes)`,
      bytesTransferred,
      simulated: false,
    };
  }

  // SIMULATED PEER: Simulate Hyperswarm transfer latency
  // In production: stream chunks over Hyperswarm socket
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  const record = {
    packId: pack.id,
    peerId,
    timestamp: new Date().toISOString(),
    status: 'completed',
    bytesTransferred,
  };
  shareHistory.push(record);

  return {
    success: true,
    message: `Knowledge pack "${pack.name}" sent to ${peer.name} (${chunks.length} chunks, ${bytesTransferred} bytes) — simulated transfer (requires Hyperswarm for real P2P)`,
    bytesTransferred,
    simulated: true,
  };
}

export function getShareHistory() {
  return [...shareHistory];
}

/**
 * Get transfer statistics.
 */
export function getTransferStats(): {
  totalPacks: number;
  totalBytes: number;
  loopbackTransfers: number;
  simulatedTransfers: number;
} {
  const loopback = shareHistory.filter((h) => h.peerId === DEVICE_ID).length;
  return {
    totalPacks: shareHistory.length,
    totalBytes: shareHistory.reduce((sum, h) => sum + h.bytesTransferred, 0),
    loopbackTransfers: loopback,
    simulatedTransfers: shareHistory.length - loopback,
  };
}

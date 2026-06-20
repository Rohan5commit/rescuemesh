import { useAppStore } from '../store/useAppStore';
import {
  Wifi, WifiOff, Share2, Laptop, Smartphone, Monitor,
  Loader2, Clock, Cpu, ArrowRightLeft,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

type DeviceType = 'laptop' | 'mobile' | 'desktop';
const DEVICE_ICON: Record<DeviceType, typeof Laptop> = { laptop: Laptop, mobile: Smartphone, desktop: Monitor };

const STATUS_COLOR: Record<string, string> = {
  available: 'text-green-400 bg-green-900/30 border-green-700/50',
  busy: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50',
  offline: 'text-navy-400 bg-navy-800 border-navy-700',
};

export function P2PScreen() {
  const peers = useAppStore((s) => s.peers);
  const scanningPeers = useAppStore((s) => s.scanningPeers);
  const scanPeers = useAppStore((s) => s.scanPeers);
  const knowledgePacks = useAppStore((s) => s.knowledgePacks);
  const sharePack = useAppStore((s) => s.sharePack);
  const shareHistory = useAppStore((s) => s.shareHistory);
  const computeTasks = useAppStore((s) => s.computeTasks);
  const offloading = useAppStore((s) => s.offloading);
  const createAndDelegateTask = useAppStore((s) => s.createAndDelegateTask);

  const [selectedPack, setSelectedPack] = useState('');
  const [selectedPeer, setSelectedPeer] = useState('');
  const [shareResult, setShareResult] = useState<string | null>(null);

  const handleShare = async () => {
    if (!selectedPack || !selectedPeer) return;
    await sharePack(selectedPack, selectedPeer);
    const lastShare = useAppStore.getState().shareHistory.slice(-1)[0];
    setShareResult(lastShare ? 'Shared at ' + new Date(lastShare.timestamp).toLocaleTimeString() : 'Share initiated');
  };

  const handleDelegate = async (type: 'summarization' | 'indexing' | 'analysis') => {
    const peer = peers.find((p) => p.id === selectedPeer && p.status === 'available');
    if (peer) {
      await createAndDelegateTask(type, 'Heavy ' + type + ' task for incident analysis', peer);
    }
  };

  return (
    <div className="max-w-4xl animate-slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">P2P & Delegated Compute</h1>
        <p className="text-sm text-navy-400">Share knowledge packs and offload compute to nearby devices</p>
      </div>

      <div className="card-elevated mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Wifi className="w-4 h-4 text-green-400" /> Nearby Devices
          </h3>
          <button onClick={scanPeers} disabled={scanningPeers} className="btn-secondary text-sm">
            {scanningPeers ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan'}
          </button>
        </div>

        {peers.length === 0 ? (
          <div className="text-center py-6">
            <WifiOff className="w-8 h-8 text-navy-500 mx-auto mb-2" />
            <p className="text-sm text-navy-400">No peers discovered. Click Scan to find nearby devices.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {peers.map((peer) => {
              const Icon = DEVICE_ICON[peer.deviceType] || Laptop;
              return (
                <div key={peer.id} className={clsx('card flex items-center gap-3', STATUS_COLOR[peer.status])}>
                  <Icon className="w-5 h-5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200">{peer.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-800 text-navy-300">{peer.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-navy-400">
                      <span>{peer.capabilities.join(', ')}</span>
                      <span>·</span>
                      <Clock className="w-3 h-3" />
                      <span>{new Date(peer.lastSeen).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="peer-select"
                    checked={selectedPeer === peer.id}
                    onChange={() => setSelectedPeer(peer.id)}
                    className="accent-rescue-500"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card-elevated mb-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-400" /> Knowledge Pack Sharing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <select
            value={selectedPack}
            onChange={(e) => setSelectedPack(e.target.value)}
            className="input-field"
          >
            <option value="">Select pack...</option>
            {knowledgePacks.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={handleShare}
            disabled={!selectedPack || !selectedPeer}
            className="btn-primary"
          >
            Share via P2P
          </button>
          {shareResult && <p className="text-xs text-green-400 self-center">{shareResult}</p>}
        </div>
        {shareHistory.length > 0 && (
          <div className="space-y-1">
            {shareHistory.map((s, i) => (
              <div key={i} className="text-xs text-navy-400 bg-navy-800/50 rounded px-3 py-1.5">
                Shared at {new Date(s.timestamp).toLocaleTimeString()} → {s.peerId}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-elevated mb-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-orange-400" /> Delegated Compute
        </h3>
        <p className="text-xs text-navy-400 mb-4">Offload heavier tasks to a nearby peer with more compute resources.</p>
        <div className="flex gap-2 mb-4">
          {(['summarization', 'indexing', 'analysis'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleDelegate(type)}
              disabled={!selectedPeer || offloading}
              className="btn-secondary text-sm"
            >
              {offloading ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : <ArrowRightLeft className="w-3 h-3 inline mr-1" />}
              Delegate {type}
            </button>
          ))}
        </div>
        {computeTasks.length > 0 && (
          <div className="space-y-2">
            {computeTasks.map((t) => (
              <div key={t.id} className="card flex items-center gap-3">
                <div className={clsx('w-2 h-2 rounded-full', {
                  'bg-yellow-500': t.status === 'pending' || t.status === 'delegated',
                  'bg-blue-500 animate-pulse': t.status === 'running',
                  'bg-green-500': t.status === 'completed',
                  'bg-red-500': t.status === 'failed',
                })} />
                <div className="flex-1">
                  <span className="text-sm text-gray-300">{t.type}</span>
                  <span className="text-xs text-navy-500 ml-2">{t.isLocal ? '(local)' : '(delegated)'}</span>
                </div>
                <span className="text-xs text-navy-400">{t.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

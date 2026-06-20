import { useAppStore } from '../store/useAppStore';
import { Shield, Zap, WifiOff, Brain, FileSearch, Users, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function LandingScreen() {
  const createCase = useAppStore((s) => s.createCase);
  const loadDemoPacks = useAppStore((s) => s.loadDemoPacks);
  const setScreen = useAppStore((s) => s.setScreen);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return;
    setModelLoading(true);
    try {
      await loadDemoPacks();
      setModelReady(true);
    } catch (err) {
      console.error('Failed to load knowledge packs:', err);
    } finally {
      setModelLoading(false);
    }
    createCase(title, desc);
  };

  const features = [
    { icon: WifiOff, title: 'Fully Offline', desc: 'No cloud dependency. Works in any environment.' },
    { icon: Brain, title: 'On-Device AI', desc: 'QVAC SDK powers local inference and RAG.' },
    { icon: FileSearch, title: 'Grounded Answers', desc: 'Every recommendation cites local evidence.' },
    { icon: Users, title: 'P2P Sharing', desc: 'Share knowledge packs peer-to-peer.' },
  ];

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-rescue-600 rounded-xl flex items-center justify-center shadow-lg shadow-rescue-600/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white tracking-tight">RescueMesh</h1>
              <p className="text-sm text-navy-300">Offline Field-Operations AI Copilot</p>
            </div>
          </div>
          <p className="text-lg text-navy-300 max-w-2xl mx-auto leading-relaxed">
            A fully on-device QVAC-powered field copilot that turns voice, text, images, and local
            knowledge packs into actionable emergency response guidance — <span className="text-rescue-400 font-semibold">without the cloud</span>.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {features.map((f) => (
            <div key={f.title} className="card text-center">
              <f.icon className="w-8 h-8 text-rescue-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-navy-400">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* New Case Section */}
        <div className="card-elevated max-w-lg mx-auto">
          {!showNew ? (
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white mb-2">Start New Incident</h2>
              <p className="text-sm text-navy-300 mb-4">Create a new incident case to begin field operations.</p>
              <button onClick={() => setShowNew(true)} className="btn-primary">
                <span className="flex items-center gap-2">
                  New Case <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          ) : (
            <div className="animate-slide-in">
              <h2 className="text-lg font-semibold text-white mb-4">New Incident Case</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Incident title (e.g., 'Fire in Building 3')"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field w-full"
                  autoFocus
                />
                <textarea
                  placeholder="Brief description (optional)"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="input-field w-full h-20 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleCreate} disabled={!title.trim() || modelLoading} className="btn-primary flex-1">
                    {modelLoading ? 'Loading models...' : modelReady ? 'Ready — Create Case' : 'Create Case'}
                  </button>
                  <button onClick={() => setShowNew(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-navy-500 mt-8">
          QVAC Hackathon I — Unleash Edge AI · All processing runs on-device
        </p>
      </div>
    </div>
  );
}

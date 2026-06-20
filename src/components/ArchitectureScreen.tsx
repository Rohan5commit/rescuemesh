import { Shield, Cpu, Database, Wifi, FileSearch, Brain, ArrowRightLeft, Share2 } from 'lucide-react';

export function ArchitectureScreen() {
  return (
    <div className="max-w-4xl animate-slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">System Architecture</h1>
        <p className="text-sm text-navy-400">How RescueMesh demonstrates production-ready local-first AI</p>
      </div>

      {/* Architecture Diagram */}
      <div className="card-elevated mb-6">
        <h3 className="font-semibold text-white mb-4">System Overview</h3>
        <div className="bg-navy-800 rounded-lg p-6 font-mono text-xs text-center">
          <div className="inline-block border border-navy-600 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-rescue-400" />
              <span className="text-white font-bold">RescueMesh Desktop App</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-left">
              <div className="bg-navy-700 rounded p-2 border border-navy-600">
                <div className="flex items-center gap-1 text-blue-400 mb-1">
                  <Brain className="w-3 h-3" /> QVAC SDK
                </div>
                <div className="text-navy-300 text-[10px]">Local LLM + Embeddings</div>
              </div>
              <div className="bg-navy-700 rounded p-2 border border-navy-600">
                <div className="flex items-center gap-1 text-green-400 mb-1">
                  <Database className="w-3 h-3" /> Local RAG
                </div>
                <div className="text-navy-300 text-[10px]">Ingest → Chunk → Embed</div>
              </div>
              <div className="bg-navy-700 rounded p-2 border border-navy-600">
                <div className="flex items-center gap-1 text-orange-400 mb-1">
                  <FileSearch className="w-3 h-3" /> Evidence
                </div>
                <div className="text-navy-300 text-[10px]">Grounded Retrieval</div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-3">
              <div className="bg-navy-700 rounded p-2 border border-navy-600">
                <div className="flex items-center gap-1 text-purple-400">
                  <ArrowRightLeft className="w-3 h-3" /> Delegated Compute
                </div>
              </div>
              <div className="bg-navy-700 rounded p-2 border border-navy-600">
                <div className="flex items-center gap-1 text-cyan-400">
                  <Share2 className="w-3 h-3" /> P2P Sharing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Design Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h4 className="text-sm font-semibold text-white mb-2">Zero Cloud Dependency</h4>
          <p className="text-xs text-navy-300">All inference, RAG, and storage run entirely on the user's device. No data ever leaves the machine unless explicitly shared via P2P.</p>
        </div>
        <div className="card">
          <h4 className="text-sm font-semibold text-white mb-2">Privacy by Design</h4>
          <p className="text-xs text-navy-300">Incident data, voice notes, images, and all AI interactions remain local. No telemetry, no analytics, no cloud storage.</p>
        </div>
        <div className="card">
          <h4 className="text-sm font-semibold text-white mb-2">Offline Resilience</h4>
          <p className="text-xs text-navy-300">The app works in complete network isolation. P2P and delegated compute are optional enhancements, not requirements.</p>
        </div>
        <div className="card">
          <h4 className="text-sm font-semibold text-white mb-2">Grounded Intelligence</h4>
          <p className="text-xs text-navy-300">Every recommendation cites local evidence from knowledge packs or case inputs. No hallucinated protocols or unsupported advice.</p>
        </div>
      </div>

      {/* Data Flow */}
      <div className="card-elevated mb-6">
        <h3 className="font-semibold text-white mb-4">Local Inference Path</h3>
        <div className="space-y-3">
          {[
            { step: '1', label: 'Multimodal Intake', desc: 'Text, voice, image, PDF inputs captured locally', icon: FileSearch },
            { step: '2', label: 'Incident Analysis', desc: 'QVAC LLM classifies severity, category, hazards', icon: Brain },
            { step: '3', label: 'Knowledge Retrieval', desc: 'Local RAG matches query against indexed knowledge packs', icon: Database },
            { step: '4', label: 'Action Generation', desc: 'QVAC generates prioritized response plan with safety warnings', icon: Shield },
            { step: '5', label: 'Grounded Q&A', desc: 'Follow-up questions answered only from local evidence', icon: FileSearch },
            { step: '6', label: 'Export & Handoff', desc: 'Clean incident report generated for offline distribution', icon: Share2 },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rescue-600/20 border border-rescue-700/50 rounded-full flex items-center justify-center text-sm font-bold text-rescue-400 shrink-0">
                {item.step}
              </div>
              <item.icon className="w-4 h-4 text-navy-400 shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-200">{item.label}</span>
                <span className="text-xs text-navy-400 ml-2">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card">
        <h3 className="font-semibold text-white mb-3">Technology Stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {['React + TypeScript', 'Tailwind CSS', 'QVAC SDK', 'Zustand', 'Vite', 'Tauri 2.x', 'Holepunch P2P', 'Local SQLite'].map((t) => (
            <div key={t} className="bg-navy-800 text-gray-300 px-3 py-2 rounded-lg border border-navy-700 text-center">{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

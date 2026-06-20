import { useAppStore } from '../store/useAppStore';
import { FileText, ExternalLink, BarChart3, Database } from 'lucide-react';
import clsx from 'clsx';

export function EvidenceInspector() {
  const activeCase = useAppStore((s) => s.activeCase);
  const assessmentEvidence = useAppStore((s) => s.assessmentEvidence);
  const planEvidence = useAppStore((s) => s.planEvidence);
  const qaHistory = useAppStore((s) => s.qaHistory);

  if (!activeCase) {
    return <div className="text-center py-20"><p className="text-navy-400">No active case.</p></div>;
  }

  // Collect all unique evidence
  const allEvidence = [...assessmentEvidence, ...planEvidence];
  const qaEvidence = qaHistory.flatMap((h) => h.response.evidence);
  const combinedEvidence = [...allEvidence, ...qaEvidence];

  const knowledgeEvidence = combinedEvidence.filter((e) => e.source === 'knowledge_pack');
  const caseEvidence = combinedEvidence.filter((e) => e.source === 'case_input');

  const getSimColor = (sim: number) => {
    if (sim >= 0.7) return 'text-green-400';
    if (sim >= 0.4) return 'text-yellow-400';
    return 'text-navy-400';
  };

  return (
    <div className="max-w-4xl animate-slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Source Evidence Inspector</h1>
        <p className="text-sm text-navy-400">Every recommendation traces back to local evidence</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{combinedEvidence.length}</p>
          <p className="text-xs text-navy-400">Total Evidence Items</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-400">{knowledgeEvidence.length}</p>
          <p className="text-xs text-navy-400">From Knowledge Packs</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-400">{caseEvidence.length}</p>
          <p className="text-xs text-navy-400">From Case Inputs</p>
        </div>
      </div>

      {/* Knowledge Pack Evidence */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" /> Knowledge Pack Evidence
        </h3>
        {knowledgeEvidence.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-sm text-navy-400">Run an assessment or ask questions to retrieve evidence.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {knowledgeEvidence.map((e) => (
              <div key={e.id} className="card animate-slide-in">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-200">
                      {e.documentName || 'Knowledge Document'}
                    </span>
                  </div>
                  <span className={clsx('text-xs font-mono', getSimColor(e.similarity))}>
                    {(e.similarity * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-300 bg-navy-800/50 rounded p-3 font-mono text-xs leading-relaxed">
                  {e.excerpt}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-navy-500 uppercase">knowledge_pack</span>
                  {e.chunkIndex !== undefined && (
                    <span className="text-[10px] text-navy-500">chunk #{e.chunkIndex}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Case Input Evidence */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Case Input Evidence
        </h3>
        {caseEvidence.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-sm text-navy-400">No case input matches found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {caseEvidence.map((e) => (
              <div key={e.id} className="card animate-slide-in">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-gray-200">Case Input</span>
                  </div>
                  <span className={clsx('text-xs font-mono', getSimColor(e.similarity))}>
                    {(e.similarity * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-300 bg-navy-800/50 rounded p-3 font-mono text-xs leading-relaxed">
                  {e.excerpt}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useAppStore } from '../store/useAppStore';
import { Plus, Clock, AlertTriangle, CheckCircle2, Archive } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
  unknown: 'badge-unknown',
};

export function CaseDashboard() {
  const cases = useAppStore((s) => s.cases);
  const selectCase = useAppStore((s) => s.selectCase);
  const createCase = useAppStore((s) => s.createCase);
  const loadDemoPacks = useAppStore((s) => s.loadDemoPacks);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    createCase(title);
    loadDemoPacks();
    setTitle('');
    setShowNew(false);
  };

  const activeCases = cases.filter((c) => c.status === 'active');
  const otherCases = cases.filter((c) => c.status !== 'active');

  return (
    <div className="max-w-4xl animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Incident Dashboard</h1>
          <p className="text-sm text-navy-400">{cases.length} total cases · {activeCases.length} active</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Case
        </button>
      </div>

      {showNew && (
        <div className="card-elevated mb-6 animate-slide-in">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Incident title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field flex-1"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button onClick={handleCreate} disabled={!title.trim()} className="btn-primary">Create</button>
            <button onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {activeCases.length === 0 && otherCases.length === 0 && (
        <div className="card text-center py-12">
          <AlertTriangle className="w-12 h-12 text-navy-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-300 mb-1">No Active Cases</h3>
          <p className="text-sm text-navy-400">Create a new incident case to begin.</p>
        </div>
      )}

      <div className="space-y-3">
        {[...activeCases, ...otherCases].map((c) => (
          <button
            key={c.id}
            onClick={() => selectCase(c.id)}
            className={clsx(
              'card w-full text-left hover:bg-navy-800/80 transition-colors',
              'severity-' + c.severity
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{c.title}</h3>
                  <span className={SEVERITY_COLORS[c.severity]}>{c.severity}</span>
                </div>
                <p className="text-sm text-navy-300 line-clamp-1">
                  {c.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-navy-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(c.reportedAt).toLocaleString()}
                  </span>
                  <span>{c.inputs.length} inputs</span>
                  <span className="flex items-center gap-1">
                    {c.status === 'active' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Archive className="w-3 h-3" />}
                    {c.status}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

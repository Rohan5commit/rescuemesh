import { useAppStore } from '../store/useAppStore';
import { clsx } from 'clsx';
import {
  AlertTriangle, CheckCircle2, Circle, Wrench, ShieldAlert,
  MessageCircleQuestion, Loader2, ClipboardList,
} from 'lucide-react';

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

const WARNING_SEVERITY_ICON: Record<string, typeof AlertTriangle> = {
  critical: AlertTriangle,
  caution: ShieldAlert,
  advisory: AlertTriangle,
};

const WARNING_SEVERITY_COLOR: Record<string, string> = {
  critical: 'text-red-400 bg-red-900/30 border-red-700/50',
  caution: 'text-orange-400 bg-orange-900/30 border-orange-700/50',
  advisory: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50',
};

export function ActionPlanScreen() {
  const activeCase = useAppStore((s) => s.activeCase);
  const generatingPlan = useAppStore((s) => s.generatingPlan);
  const generatePlan = useAppStore((s) => s.generatePlan);
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem);
  const setScreen = useAppStore((s) => s.setScreen);

  if (!activeCase) {
    return <div className="text-center py-20"><p className="text-navy-400">No active case.</p></div>;
  }

  const plan = activeCase.actionPlan;
  const assessment = activeCase.assessment;

  if (!plan && !generatingPlan) {
    return (
      <div className="text-center py-20 animate-slide-in">
        <ClipboardList className="w-12 h-12 text-navy-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-300 mb-2">No Action Plan Yet</h2>
        <p className="text-sm text-navy-400 mb-4">Run an assessment first to generate an action plan.</p>
        <button onClick={() => setScreen('intake')} className="btn-secondary">Go to Intake</button>
      </div>
    );
  }

  if (generatingPlan) {
    return (
      <div className="text-center py-20 animate-slide-in">
        <Loader2 className="w-12 h-12 text-rescue-400 mx-auto mb-3 animate-spin" />
        <h2 className="text-lg font-semibold text-gray-300 mb-2">Generating Action Plan...</h2>
        <p className="text-sm text-navy-400">Running local inference to create response plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Action Plan</h1>
        <p className="text-sm text-navy-400">{activeCase.title}</p>
      </div>

      {/* Assessment Summary */}
      {assessment && (
        <div className={clsx('card-elevated mb-6', 'severity-' + assessment.severity)}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white">Assessment</h3>
            <span className={PRIORITY_BADGE[assessment.severity]}>{assessment.severity}</span>
            <span className="text-xs text-navy-400">{assessment.category}</span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{assessment.summary}</p>
          {assessment.keyHazards.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {assessment.keyHazards.map((h, i) => (
                <span key={i} className="text-xs bg-navy-800 text-navy-300 px-2 py-0.5 rounded">{h}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Safety Warnings */}
      {plan && plan.safetyWarnings.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Safety Warnings
          </h3>
          {plan.safetyWarnings.map((w) => {
            const Icon = WARNING_SEVERITY_ICON[w.severity] || AlertTriangle;
            return (
              <div key={w.id} className={clsx('card flex items-start gap-3', WARNING_SEVERITY_COLOR[w.severity])}>
                <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm">{w.warning}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Immediate Priorities */}
      {plan && plan.immediatePriorities.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wider mb-2">
            Immediate Priorities
          </h3>
          <div className="space-y-1">
            {plan.immediatePriorities.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklistItem(plan.id, 'immediatePriorities', item.id)}
                className="card w-full text-left flex items-center gap-3 hover:bg-navy-800 transition-colors"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-navy-500 shrink-0" />
                )}
                <span className={clsx('text-sm', item.completed && 'line-through text-navy-400')}>{item.text}</span>
                <span className={clsx('ml-auto', PRIORITY_BADGE[item.priority])}>{item.priority}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {plan && plan.nextSteps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wider mb-2">Next Steps</h3>
          <div className="space-y-1">
            {plan.nextSteps.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklistItem(plan.id, 'nextSteps', item.id)}
                className="card w-full text-left flex items-center gap-3 hover:bg-navy-800 transition-colors"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-navy-500 shrink-0" />
                )}
                <span className={clsx('text-sm', item.completed && 'line-through text-navy-400')}>{item.text}</span>
                <span className={clsx('ml-auto', PRIORITY_BADGE[item.priority])}>{item.priority}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Required Equipment */}
      {plan && plan.requiredEquipment.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Required Equipment
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.requiredEquipment.map((eq, i) => (
              <span key={i} className="text-sm bg-navy-800 text-gray-300 px-3 py-1 rounded-lg border border-navy-600">{eq}</span>
            ))}
          </div>
        </div>
      )}

      {/* Escalation & Handoff */}
      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {plan.escalationGuidance && (
            <div className="card">
              <h3 className="text-sm font-semibold text-navy-300 mb-2">Escalation Guidance</h3>
              <p className="text-sm text-gray-300">{plan.escalationGuidance}</p>
            </div>
          )}
          {plan.handoffSummary && (
            <div className="card">
              <h3 className="text-sm font-semibold text-navy-300 mb-2">Handoff Summary</h3>
              <p className="text-sm text-gray-300">{plan.handoffSummary}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2">
        <button onClick={() => setScreen('ask')} className="btn-primary flex items-center gap-2">
          <MessageCircleQuestion className="w-4 h-4" /> Ask Follow-up Questions
        </button>
        <button onClick={() => setScreen('evidence')} className="btn-secondary">View Evidence</button>
      </div>
    </div>
  );
}

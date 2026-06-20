import { useAppStore } from '../store/useAppStore';
import { Download, ClipboardList, FileText, HandMetal, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ExportScreen() {
  const activeCase = useAppStore((s) => s.activeCase);
  const exportReport = useAppStore((s) => s.exportReport);
  const exportChecklist = useAppStore((s) => s.exportChecklist);
  const exportHandoff = useAppStore((s) => s.exportHandoff);
  const [activeTab, setActiveTab] = useState<'report' | 'checklist' | 'handoff'>('report');
  const [copied, setCopied] = useState(false);

  if (!activeCase) {
    return <div className="text-center py-20"><p className="text-navy-400">No active case.</p></div>;
  }

  const content = activeTab === 'report' ? exportReport()
    : activeTab === 'checklist' ? exportChecklist()
    : exportHandoff();

  const tabs = [
    { key: 'report' as const, label: 'Incident Report', icon: FileText },
    { key: 'checklist' as const, label: 'Action Checklist', icon: ClipboardList },
    { key: 'handoff' as const, label: 'Handoff Note', icon: HandMetal },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = 'md';
    const filename = \`rescuemesh-\${activeTab}-\${activeCase.id.slice(0, 8)}.\${ext}\`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl animate-slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Export & Reporting</h1>
        <p className="text-sm text-navy-400">Generate clean incident reports for offline distribution</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors \
              \${activeTab === tab.key
                ? 'bg-rescue-600 text-white'
                : 'bg-navy-800 text-navy-300 hover:bg-navy-700'
              }\`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button onClick={handleCopy} className="btn-secondary text-sm flex items-center gap-2">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button onClick={handleDownload} className="btn-primary text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Download .md
        </button>
      </div>

      {/* Content Preview */}
      <div className="card-elevated">
        <div className="bg-navy-800 rounded-lg p-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {content}
          </pre>
        </div>
      </div>

      {/* Footer badge */}
      <div className="mt-4 text-center">
        <span className="text-[10px] text-navy-500 bg-navy-800 px-3 py-1 rounded-full">
          All exports generated on-device · No cloud services used
        </span>
      </div>
    </div>
  );
}

import { useAppStore } from '../store/useAppStore';
import {
  LayoutDashboard, FileInput, ClipboardList, MessageCircleQuestion,
  Search, Share2, Cpu, BookOpen, Download, Shield, Radio,
} from 'lucide-react';
import clsx from 'clsx';

type Screen = 'dashboard' | 'intake' | 'action-plan' | 'ask' | 'evidence' | 'p2p' | 'architecture' | 'export';

const NAV_ITEMS: Array<{ screen: Screen; label: string; icon: typeof LayoutDashboard; section?: string }> = [
  { screen: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'CASE' },
  { screen: 'intake', label: 'Intake', icon: FileInput },
  { screen: 'action-plan', label: 'Action Plan', icon: ClipboardList },
  { screen: 'ask', label: 'Ask RescueMesh', icon: MessageCircleQuestion, section: 'ANALYSIS' },
  { screen: 'evidence', label: 'Evidence', icon: Search },
  { screen: 'p2p', label: 'P2P & Compute', icon: Share2, section: 'NETWORK' },
  { screen: 'architecture', label: 'Architecture', icon: Cpu, section: 'SYSTEM' },
  { screen: 'export', label: 'Export', icon: Download },
];

export function Sidebar() {
  const currentScreen = useAppStore((s) => s.currentScreen);
  const setScreen = useAppStore((s) => s.setScreen);
  const activeCase = useAppStore((s) => s.activeCase);

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-700 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rescue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">RescueMesh</h1>
            <p className="text-[10px] text-navy-400 uppercase tracking-widest">Edge AI Copilot</p>
          </div>
        </div>
      </div>

      {/* Active Case Indicator */}
      {activeCase && (
        <div className="px-4 py-3 border-b border-navy-700 bg-navy-800/50">
          <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">Active Case</p>
          <div className="flex items-center gap-2">
            <div className={clsx('pulse-dot', {
              'bg-red-500': activeCase.severity === 'critical',
              'bg-orange-500': activeCase.severity === 'high',
              'bg-yellow-500': activeCase.severity === 'medium',
              'bg-green-500': activeCase.severity === 'low',
            })} />
            <span className="text-sm text-gray-200 truncate font-medium">{activeCase.title}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {NAV_ITEMS.map((item) => (
          <div key={item.screen}>
            {item.section && (
              <p className="px-4 pt-4 pb-1 text-[10px] text-navy-400 uppercase tracking-widest font-semibold">
                {item.section}
              </p>
            )}
            <button
              onClick={() => setScreen(item.screen)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150',
                currentScreen === item.screen
                  ? 'bg-navy-700/80 text-white border-r-2 border-rescue-500'
                  : 'text-navy-300 hover:bg-navy-800 hover:text-gray-200'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          </div>
        ))}
      </nav>

      {/* Status Bar */}
      <div className="p-4 border-t border-navy-700 bg-navy-900">
        <div className="flex items-center gap-2 text-[11px] text-navy-400">
          <Radio className="w-3 h-3 text-green-500" />
          <span>Offline Mode Active</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-navy-400 mt-1">
          <Cpu className="w-3 h-3 text-blue-400" />
          <span>QVAC Local Inference</span>
        </div>
      </div>
    </aside>
  );
}

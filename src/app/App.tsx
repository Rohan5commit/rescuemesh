import { useAppStore } from '../store/useAppStore';
import { Sidebar } from '../components/Sidebar';
import { LandingScreen } from '../components/LandingScreen';
import { CaseDashboard } from '../components/CaseDashboard';
import { IntakeScreen } from '../components/IntakeScreen';
import { ActionPlanScreen } from '../components/ActionPlanScreen';
import { AskRescueMesh } from '../components/AskRescueMesh';
import { EvidenceInspector } from '../components/EvidenceInspector';
import { P2PScreen } from '../components/P2PScreen';
import { ArchitectureScreen } from '../components/ArchitectureScreen';
import { ExportScreen } from '../components/ExportScreen';

function ScreenRouter() {
  const screen = useAppStore((s) => s.currentScreen);

  switch (screen) {
    case 'landing': return <LandingScreen />;
    case 'dashboard': return <CaseDashboard />;
    case 'intake': return <IntakeScreen />;
    case 'action-plan': return <ActionPlanScreen />;
    case 'ask': return <AskRescueMesh />;
    case 'evidence': return <EvidenceInspector />;
    case 'p2p': return <P2PScreen />;
    case 'architecture': return <ArchitectureScreen />;
    case 'export': return <ExportScreen />;
    default: return <LandingScreen />;
  }
}

export default function App() {
  const screen = useAppStore((s) => s.currentScreen);
  const isLanding = screen === 'landing';

  if (isLanding) {
    return <LandingScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <ScreenRouter />
      </main>
    </div>
  );
}

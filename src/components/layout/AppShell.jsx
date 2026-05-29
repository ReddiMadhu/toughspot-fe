import { useNavigate, useLocation } from 'react-router-dom';
import {
  Upload, Cpu, CheckSquare, Database, Download,
  ArrowRight, Zap, LayoutDashboard
} from 'lucide-react';
import useMigrationStore from '../../stores/migrationStore.js';

const STEPS = [
  { id: 1, label: 'Upload Files', icon: Upload, path: '/upload' },
  { id: 2, label: 'Processing', icon: Cpu, path: null },
  { id: 3, label: 'Review Conversions', icon: CheckSquare, path: null },
  { id: 4, label: 'Data Model', icon: Database, path: null },
  { id: 5, label: 'Export', icon: Download, path: null },
];

export default function AppShell({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeStep, migrationId, status } = useMigrationStore();

  const isStepAccessible = (stepId) => {
    if (stepId === 1) return true;
    if (stepId === 2) return migrationId !== null;
    if (stepId >= 3) return status === 'completed';
    return false;
  };

  const getStepPath = (step) => {
    if (step.id === 1) return '/upload';
    if (!migrationId) return null;
    const pathMap = {
      2: `/migration/${migrationId}/processing`,
      3: `/migration/${migrationId}/review`,
      4: `/migration/${migrationId}/data-model`,
      5: `/migration/${migrationId}/export`,
    };
    return pathMap[step.id];
  };

  const handleStepClick = (step) => {
    if (!isStepAccessible(step.id)) return;
    const path = getStepPath(step);
    if (path) navigate(path);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 shadow-sm">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ThoughtSpot</p>
            <p className="text-sm font-bold text-gray-900">→ Power BI</p>
          </div>
        </div>

        {/* Navigation Steps */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-2 mb-2">
            Migration Steps
          </p>
          {STEPS.map((step) => {
            const Icon = step.icon;
            const accessible = isStepAccessible(step.id);
            const isActive = activeStep === step.id;
            const isDone = activeStep > step.id && status !== 'idle';

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step)}
                disabled={!accessible}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 text-left
                  ${isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : isDone && accessible
                    ? 'text-gray-600 hover:bg-gray-50 cursor-pointer'
                    : accessible
                    ? 'text-gray-600 hover:bg-gray-50 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
                  }
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${isActive ? 'bg-primary-600 text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}
                `}>
                  {isDone ? '✓' : step.id}
                </div>
                <span className="truncate">{step.label}</span>
                {isActive && <ArrowRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-primary-500" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors w-full"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Back to Home
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-10 shadow-sm">
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

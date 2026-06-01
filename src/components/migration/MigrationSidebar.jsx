/**
 * Migration Sidebar - Agent-aware navigation for 4-step wizard.
 *
 * Each step is linked to an agent. Shows live execution status:
 *   - Idle/Pending: dimmed icon, "Pending" label
 *   - Running: spinning icon with glow, "Running..." label
 *   - Completed: green checkmark, "Complete" label
 *   - Failed: red X, "Failed" label
 */
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Database,
  Grid,
  Code,
  Package,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
} from 'lucide-react';
import useAgentStore from '../../stores/agentStore';

const MIGRATION_STEPS = [
  { id: 1, name: 'Source Dashboard Exploration', agent: 'source_analysis', icon: Database, pathSuffix: 'data-understanding' },
  { id: 2, name: 'Data Model Configuration',     agent: 'data_model',      icon: Grid,     pathSuffix: 'model-intelligence' },
  { id: 3, name: 'DAX Conversion & Validation',  agent: 'dax_conversion',  icon: Code,     pathSuffix: 'dax-conversion' },
  { id: 4, name: 'Export & Package',              agent: 'export',          icon: Package,  pathSuffix: 'export' },
];

export default function MigrationSidebar({ currentStep = 1 }) {
  const navigate = useNavigate();
  const { migrationId } = useParams();
  const agents = useAgentStore((state) => state.agents);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('migration-sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('migration-sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleStepClick = (step) => {
    if (migrationId) {
      navigate(`/migration-wizard/${migrationId}/${step.pathSuffix}`);
    } else {
      navigate('/');
    }
  };

  const getAgentStatus = (agentName) => {
    return agents[agentName]?.status ?? 'idle';
  };

  const getStatusLabel = (agentStatus) => {
    switch (agentStatus) {
      case 'running': return 'Running...';
      case 'completed': return 'Complete';
      case 'failed': return 'Failed';
      default: return 'Pending';
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Logo/Title */}
      <div className={`p-6 border-b border-gray-200 flex items-center justify-between`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center border border-primary-500/30 shadow-md shadow-primary-950/10 flex-shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Enterprise BI</p>
              <p className="text-base font-extrabold text-gray-900 leading-tight">Modernization Suite</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Steps */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {MIGRATION_STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const agentStatus = getAgentStatus(step.agent);
            const isCompleted = agentStatus === 'completed';
            const isRunning = agentStatus === 'running';
            const isFailed = agentStatus === 'failed';
            const statusLabel = getStatusLabel(agentStatus);

            return (
              <div
                key={step.id}
                onClick={() => handleStepClick(step)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary-50 border-l-4 border-primary-600'
                    : 'hover:bg-gray-50'
                }`}
                title={isCollapsed ? `${step.name} — ${statusLabel}` : ''}
              >
                <div className={`flex-shrink-0 ${
                  isRunning
                    ? 'text-primary-600 sidebar-agent-running rounded-full'
                    : isCompleted
                    ? 'text-emerald-600'
                    : isFailed
                    ? 'text-red-500'
                    : isActive
                    ? 'text-primary-600'
                    : 'text-gray-400'
                }`}>
                  {isRunning ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isFailed ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${
                      isActive ? 'text-primary-900 font-bold' : 'text-gray-700'
                    }`}>
                      {step.name}
                    </div>
                    <div className={`text-xs ${
                      isRunning ? 'text-primary-600 font-semibold' :
                      isCompleted ? 'text-emerald-600 font-semibold' :
                      isFailed ? 'text-red-500 font-semibold' :
                      'text-gray-500'
                    }`}>
                      Step {step.id} of 4 · {statusLabel}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Progress: {currentStep}/4
          </div>
        </div>
      )}
    </div>
  );
}

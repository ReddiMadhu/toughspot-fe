/**
 * Migration Sidebar - Shared navigation component for ThoughtSpot migration wizard
 */
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Layout,
  Code,
  Database,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

const MIGRATION_STEPS = [
  { id: 1, name: 'Source Dashboard Exploration', icon: Database, pathSuffix: 'data-understanding' },
  { id: 2, name: 'Data Model Configuration', icon: Grid, pathSuffix: 'model-intelligence' },
  { id: 3, name: 'Calculated Fields Mapping', icon: Layout, pathSuffix: 'field-mapping' },
  { id: 4, name: 'DAX Conversion', icon: Code, pathSuffix: 'formula-conversion' },
  { id: 5, name: 'Review & Export', icon: CheckCircle, pathSuffix: 'review' }
];

export default function MigrationSidebar({ currentStep = 1 }) {
  const navigate = useNavigate();
  const { migrationId } = useParams();

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
            const isCompleted = step.id < currentStep;

            return (
              <div
                key={step.id}
                onClick={() => handleStepClick(step)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary-50 border-l-4 border-primary-600'
                    : 'hover:bg-gray-50'
                }`}
                title={isCollapsed ? step.name : ''}
              >
                <div className={`flex-shrink-0 ${
                  isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
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
                    <div className="text-xs text-gray-500">Step {step.id} of 5</div>
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
            Progress: {currentStep}/5
          </div>
        </div>
      )}
    </div>
  );
}

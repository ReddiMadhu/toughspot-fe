import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Network, LayoutGrid } from 'lucide-react';
import AppShell from '../components/layout/AppShell.jsx';
import RelationshipDiagram from '../components/model/RelationshipDiagram.jsx';
import TableList from '../components/model/TableList.jsx';
import useMigrationStore from '../stores/migrationStore.js';

const VIEWS = [
  { id: 'erd',    label: 'ERD',    icon: Network },
  { id: 'tables', label: 'Tables', icon: LayoutGrid },
];

export default function DataModelPage() {
  const { migrationId } = useParams();
  const navigate = useNavigate();
  const { actions } = useMigrationStore();

  const [view,      setView]      = useState('erd');
  const [loading,   setLoading]   = useState(true);
  const [tables,    setTables]    = useState([]);
  const [joins,     setJoins]     = useState([]);
  const [selected,  setSelected]  = useState(null);

  useEffect(() => {
    actions.setActiveStep(4);
    if (!migrationId) return;

    fetch(`/api/v1/ts-migration/${migrationId}/download?file=json`)
      .then((r) => r.json())
      .catch(() => null)
      .then((data) => {
        if (data?.tables) {
          setTables(data.tables);
          setJoins(data.joins || []);
        }
      })
      .finally(() => setLoading(false));
  }, [migrationId]);

  return (
    <AppShell title="Step 4 — Data Model">
      <div className="max-w-5xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Data Model</h2>
            <p className="text-sm text-gray-500">
              {tables.length} table{tables.length !== 1 ? 's' : ''} · {joins.length} relationship{joins.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  view === id
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ERD view */}
        {view === 'erd' && (
          <>
            <RelationshipDiagram
              tables={tables}
              joins={joins}
              height={520}
              loading={loading}
            />
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 mb-5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Measure column
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                Attribute column
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 border-t-2 border-primary-400" />
                Relationship
              </div>
            </div>
          </>
        )}

        {/* Tables list view */}
        {view === 'tables' && (
          <div className="mb-5">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
                Loading tables…
              </div>
            ) : (
              <TableList
                tables={tables}
                selectedTable={selected}
                onTableClick={setSelected}
              />
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate(`/migration/${migrationId}/review`)}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            ← Review Conversions
          </button>
          <button
            onClick={() => {
              actions.setActiveStep(5);
              navigate(`/migration/${migrationId}/export`);
            }}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm hover:scale-105"
          >
            Download Outputs <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertTriangle, Database, Filter } from 'lucide-react';
import AppShell from '../components/layout/AppShell.jsx';
import FormulaGroup from '../components/review/FormulaGroup.jsx';
import api from '../services/api.js';
import useMigrationStore from '../stores/migrationStore.js';

const FILTERS = ['All', 'High Confidence', 'Needs Review'];

export default function ReviewPage() {
  const { migrationId } = useParams();
  const navigate = useNavigate();
  const { stats, conversions, actions } = useMigrationStore();
  const [loading, setLoading] = useState(conversions.length === 0);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    actions.setActiveStep(3);
    if (conversions.length === 0 && migrationId) {
      api.getConversions(migrationId)
        .then(({ data }) => {
          actions.setConversions(data.conversions || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [migrationId]);

  // Group conversions by source object
  const grouped = {};
  const activeConversions = conversions.filter((c) => {
    if (filter === 'High Confidence') return (c.confidence ?? 0) >= 0.9;
    if (filter === 'Needs Review') return c.requires_review;
    return true;
  });

  for (const c of activeConversions) {
    const key = `${c.source_object_type}::${c.source_object}`;
    if (!grouped[key]) grouped[key] = { name: c.source_object, type: c.source_object_type, items: [] };
    grouped[key].items.push(c);
  }

  const total = conversions.length;
  const highConf = conversions.filter((c) => (c.confidence ?? 0) >= 0.9).length;
  const needsReview = conversions.filter((c) => c.requires_review).length;

  return (
    <AppShell title="Step 3 — Review DAX Conversions">
      <div className="max-w-4xl mx-auto animate-slide-up">
        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Formulas', value: total, icon: CheckCircle2, color: 'text-gray-600', bg: 'bg-gray-50' },
            { label: 'Auto-converted', value: highConf, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Needs Review', value: needsReview, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Tables', value: stats.tables, icon: Database, color: 'text-primary-600', bg: 'bg-primary-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${s.bg} rounded-lg p-4 border border-gray-200 flex items-center justify-between`}>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
                <div className={`p-2 rounded-lg bg-white/85 flex items-center justify-center shadow-sm ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {f}
            </button>
          ))}
          <span className="text-xs text-gray-500 ml-auto">
            {activeConversions.length} of {total} shown
          </span>
        </div>

        {/* Formula groups */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">No formulas match the current filter</p>
          </div>
        ) : (
          <div>
            {Object.entries(grouped).map(([key, group]) => (
              <FormulaGroup
                key={key}
                objectName={group.name}
                objectType={group.type}
                conversions={group.items}
              />
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate(`/migration/${migrationId}/processing`)}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            ← Back to Processing
          </button>
          <button
            onClick={() => { actions.setActiveStep(4); navigate(`/migration/${migrationId}/data-model`); }}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm hover:scale-105"
          >
            Data Model <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

/**
 * AgentProcessingOverlay — Glassmorphism processing overlay with streaming micro-task cards.
 *
 * Visual heart of the multi-agent UX. Shows animated event cards that fade in
 * as the agent works, with a progress bar, status indicators, and error handling.
 *
 * Special rendering for DAX Conversion agent:
 *   - Formula cards with confidence badges
 *   - Self-healing events rendered as nested/indented cards under parent formula
 */
import { useEffect, useRef } from 'react';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Database,
  Code,
  Package,
  GitBranch,
  Shield,
  Wrench,
  FileText,
} from 'lucide-react';

// ── Icon mapper for event types ──────────────────────────────────────────────
const EVENT_ICONS = {
  // Source analysis
  parsing_started: Zap,
  file_parsed: FileText,
  table_extracted: Database,
  worksheet_extracted: FileText,
  formula_found: Code,
  metadata_ready: CheckCircle2,
  // Data model
  graph_building: GitBranch,
  node_added: GitBranch,
  edge_added: GitBranch,
  graph_complete: CheckCircle2,
  enhancement_detecting: Shield,
  enhancement_detected: AlertTriangle,
  enhancement_complete: CheckCircle2,
  // DAX conversion
  conversion_started: Code,
  formula_converting: Loader2,
  formula_converted: CheckCircle2,
  validation_started: Shield,
  validation_passed: CheckCircle2,
  validation_failed: XCircle,
  healing_attempt: Wrench,
  healing_success: CheckCircle2,
  healing_failed: XCircle,
  // Export
  pbip_generating: Package,
  pbip_complete: CheckCircle2,
  excel_generating: FileText,
  excel_complete: CheckCircle2,
  dax_exporting: Code,
  json_exporting: FileText,
  packaging: Package,
  packaging_complete: CheckCircle2,
  // Generic
  stream_connected: Zap,
  agent_complete: CheckCircle2,
  agent_failed: XCircle,
};

// ── Event status color ──────────────────────────────────────────────────────
function getEventColor(event) {
  const ev = event.event || '';
  if (ev.includes('failed') || ev.includes('_failed')) return 'text-red-400';
  if (ev.includes('complete') || ev.includes('passed') || ev.includes('success') || ev.includes('converted') || ev.includes('extracted') || ev.includes('ready'))
    return 'text-emerald-400';
  if (ev.includes('healing') || ev.includes('attempt')) return 'text-amber-400';
  if (ev.includes('detecting') || ev.includes('enhancement_detected')) return 'text-amber-400';
  return 'text-blue-400';
}

// ── Self-healing nesting detection ──────────────────────────────────────────
function isNestedEvent(event) {
  const ev = event.event || '';
  return ev.startsWith('healing_') || ev === 'validation_passed' || ev === 'validation_failed';
}

// ── Confidence badge ────────────────────────────────────────────────────────
function ConfidenceBadge({ confidence }) {
  if (confidence == null) return null;
  const pct = Math.round(confidence * 100);
  let color = 'bg-emerald-500/20 text-emerald-300';
  if (pct < 60) color = 'bg-red-500/20 text-red-300';
  else if (pct < 90) color = 'bg-amber-500/20 text-amber-300';

  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  );
}

// ── Single micro-task card ──────────────────────────────────────────────────
function MicroTaskCard({ event, index, isNested = false }) {
  const ev = event.event || '';
  const IconComponent = EVENT_ICONS[ev] || Zap;
  const colorClass = getEventColor(event);
  const isSpinner = ev === 'formula_converting' || ev === 'stream_connected';
  const confidence = event.data?.confidence;

  return (
    <div
      className={`task-card-enter flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all
        ${isNested ? 'ml-6 border-l-2 border-white/10' : ''}
        bg-white/[0.05] hover:bg-white/[0.08]`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className={`flex-shrink-0 ${colorClass}`}>
        {isSpinner ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <IconComponent className="w-3.5 h-3.5" />
        )}
      </div>
      <span className="flex-1 text-xs text-white/80 truncate">
        {event.message || ev}
      </span>
      {confidence != null && <ConfidenceBadge confidence={confidence} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Overlay Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function AgentProcessingOverlay({
  agentName = '',
  agentDisplayName = 'Agent',
  events = [],
  status = 'idle',
  progress = 0,
  subPhase = '',
  message = '',
  error = null,
  onRetry = null,
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  // Filter out stream_connected from display
  const displayEvents = events.filter((e) => e.event !== 'stream_connected');

  // ── Error State ──
  if (status === 'failed') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="agent-card rounded-2xl p-8 max-w-md w-full text-center border border-red-500/20"
             style={{ background: 'rgba(239, 68, 68, 0.08)', backdropFilter: 'blur(20px)' }}>
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Agent Failed</h3>
          <p className="text-sm text-gray-600 mb-1">{agentDisplayName} encountered an error:</p>
          <div className="bg-red-50 rounded-lg border border-red-200 p-3 mb-6 text-left">
            <p className="text-sm font-mono text-red-700 break-words">{error}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Agent
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Processing State (Running / Idle awaiting) ──
  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in">
      {/* Agent Header Card */}
      <div className="agent-card rounded-2xl p-5 mb-4 border border-white/10"
           style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/30 flex items-center justify-center agent-active-pulse">
              <Zap className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{agentDisplayName}</h3>
              <p className="text-xs text-white/50">
                {subPhase || 'Initializing...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-400/70">
              Live
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-[10px] text-white/40 mb-1">
            <span>{message || 'Processing...'}</span>
            <span>{Math.max(0, progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all duration-700 ease-out progress-shimmer"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Event Stream */}
      <div
        className="flex-1 agent-card rounded-2xl border border-white/10 overflow-hidden flex flex-col"
        style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)' }}
      >
        {/* Stream header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Agent Activity Stream
          </span>
          <span className="text-[10px] text-white/30 font-mono">
            {displayEvents.length} event{displayEvents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Scrollable event list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 space-y-1.5"
          style={{ maxHeight: '400px' }}
        >
          {displayEvents.length === 0 && (
            <div className="flex items-center justify-center h-32 text-white/30 text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Waiting for agent events...
            </div>
          )}
          {displayEvents.map((event, i) => (
            <MicroTaskCard
              key={i}
              event={event}
              index={i}
              isNested={isNestedEvent(event)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

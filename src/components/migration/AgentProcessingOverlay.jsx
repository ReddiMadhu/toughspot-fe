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
import { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
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
  if (ev.includes('failed') || ev.includes('_failed')) return 'text-red-500';
  if (ev.includes('complete') || ev.includes('passed') || ev.includes('success') || ev.includes('converted') || ev.includes('extracted') || ev.includes('ready'))
    return 'text-emerald-600';
  if (ev.includes('healing') || ev.includes('attempt')) return 'text-amber-600';
  if (ev.includes('detecting') || ev.includes('enhancement_detected')) return 'text-amber-600';
  return 'text-primary-600';
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
  let color = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  if (pct < 60) color = 'bg-red-100 text-red-700 border border-red-200';
  else if (pct < 90) color = 'bg-amber-100 text-amber-700 border border-amber-200';

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
      className={`task-card-enter flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all border
        ${isNested 
          ? 'ml-6 border-l-2 border-l-primary-400 border-y-gray-100 border-r-gray-100 bg-gray-50/50' 
          : 'border-gray-100 bg-gray-50 hover:bg-gray-100/70'}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className={`flex-shrink-0 ${colorClass}`}>
        {isSpinner ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <IconComponent className="w-3.5 h-3.5" />
        )}
      </div>
      <span className="flex-1 text-xs text-gray-700 truncate font-medium">
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
  onNext = null,
}) {
  const [visibleEvents, setVisibleEvents] = useState([]);
  const eventQueueRef = useRef([]);
  const queuedCountRef = useRef(0);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  // Dynamic visual progress calculation perfectly aligned with stagger animation
  const totalEvents = events.filter((e) => e.event !== 'stream_connected').length;
  const currentProgress = totalEvents > 0 
    ? Math.round((visibleEvents.length / totalEvents) * 100) 
    : progress;
  const displayedProgress = Math.min(100, Math.max(progress, currentProgress));

  // Auto-scroll to bottom on new visible events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleEvents.length]);

  const startQueueProcessor = () => {
    if (timerRef.current) return;
    
    timerRef.current = setInterval(() => {
      if (eventQueueRef.current.length > 0) {
        const nextEvent = eventQueueRef.current.shift();
        setVisibleEvents((prev) => [...prev, nextEvent]);
      } else {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 250); // 250ms premium stagger interval
  };

  // Event stream watcher & queue bufferer
  useEffect(() => {
    const incoming = events.filter((e) => e.event !== 'stream_connected');
    
    // Reset local queue states if events were cleared (e.g. on agent retry)
    if (incoming.length === 0) {
      setVisibleEvents([]);
      eventQueueRef.current = [];
      queuedCountRef.current = 0;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const newEvents = incoming.slice(queuedCountRef.current);
    if (newEvents.length > 0) {
      eventQueueRef.current.push(...newEvents);
      queuedCountRef.current = incoming.length;
      startQueueProcessor();
    }
  }, [events]);

  // If agent completes or fails, flush any remaining events instantly to avoid delays
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      if (eventQueueRef.current.length > 0) {
        setVisibleEvents((prev) => [...prev, ...eventQueueRef.current]);
        eventQueueRef.current = [];
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [status]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Error State ──
  if (status === 'failed') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-red-600" />
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

  // ── Completed State — Show stream with Next button ──
  const isComplete = status === 'completed';

  // ── Processing / Completed State ──
  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in">
      {/* Agent Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? 'bg-emerald-50' : 'bg-primary-50 agent-active-pulse'}`}>
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Zap className="w-5 h-5 text-primary-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{agentDisplayName}</h3>
              <p className={`text-xs font-medium ${isComplete ? 'text-emerald-600' : 'text-gray-500'}`}>
                {isComplete ? 'Completed successfully' : (subPhase || 'Initializing...')}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${isComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-50 border-emerald-100'}`}>
            {isComplete ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span className={`text-[10px] uppercase tracking-wider font-bold ${isComplete ? 'text-emerald-700' : 'text-emerald-600'}`}>
              {isComplete ? 'Complete' : 'Active Agent'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
            <span>{isComplete ? 'Agent finished' : (message || 'Processing...')}</span>
            <span>{isComplete ? '100' : Math.max(0, displayedProgress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ease-out ${isComplete ? 'bg-emerald-500' : 'progress-shimmer'}`}
              style={{ width: isComplete ? '100%' : `${Math.max(0, Math.min(100, displayedProgress))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Event Stream */}
      <div
        className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
      >
        {/* Stream header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Agent Activity Stream
          </span>
          <span className="text-[10px] text-gray-400 font-bold font-mono">
            {visibleEvents.length} event{visibleEvents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Scrollable event list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-white to-gray-50/30"
          style={{ maxHeight: '420px' }}
        >
          {visibleEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              <span>Initializing agent workspace...</span>
            </div>
          )}
          {visibleEvents.map((event, i) => (
            <MicroTaskCard
              key={i}
              event={event}
              index={i}
              isNested={isNestedEvent(event)}
            />
          ))}
        </div>
      </div>

      {/* Next button when complete */}
      {isComplete && onNext && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm hover:scale-[1.02]"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

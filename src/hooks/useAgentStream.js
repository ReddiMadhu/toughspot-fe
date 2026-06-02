/**
 * useAgentStream — SSE hook for streaming events from a specific agent.
 *
 * Connects to GET /api/v1/ts-migration/{migrationId}/agents/{agentSlug}/stream
 * and dispatches parsed events to the agentStore.
 *
 * IMPORTANT: Uses getState() to access store actions outside React's render
 * cycle, preventing "Maximum update depth exceeded" errors caused by
 * subscribing to the full store and re-rendering on every SSE event.
 * Events are buffered and flushed in batches to avoid rapid state churn.
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { API_BASE } from '../config.js';
import useAgentStore from '../stores/agentStore.js';

// Map internal agent names to URL slugs
const AGENT_SLUG_MAP = {
  source_analysis: 'source-analysis',
  data_model: 'data-model',
  dax_conversion: 'dax-conversion',
  export: 'export',
};

/** Batch flush interval in ms — keeps UI responsive without over-rendering */
const FLUSH_INTERVAL_MS = 150;

export function useAgentStream(migrationId, agentName, enabled = true) {
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const eventBufferRef = useRef([]);
  const flushTimerRef = useRef(null);

  // Flush buffered events into the store in a single batch update
  const flushBuffer = useCallback(() => {
    const buffer = eventBufferRef.current;
    if (buffer.length === 0) return;
    eventBufferRef.current = [];

    const actions = useAgentStore.getState().actions;
    actions.addEvents(agentName, buffer);
  }, [agentName]);

  useEffect(() => {
    if (!migrationId || !agentName || !enabled) {
      setConnected(false);
      return;
    }

    const slug = AGENT_SLUG_MAP[agentName] || agentName;
    const sseUrl = `${API_BASE}/ts-migration/${migrationId}/agents/${slug}/stream`;

    console.log(`[AgentStream] Connecting to ${agentName} stream:`, sseUrl);

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log(`[AgentStream] Connected: ${agentName}`);
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventType = data.type || '';

        // Access actions directly from store state — never via hook subscription
        const actions = useAgentStore.getState().actions;

        if (eventType === 'agent_complete') {
          // Flush any remaining buffered events first
          flushBuffer();
          actions.completeAgent(agentName, data.data || {});
          setConnected(false);
          eventSource.close();
        } else if (eventType === 'agent_failed') {
          flushBuffer();
          actions.failAgent(agentName, data.message || 'Agent failed');
          setConnected(false);
          eventSource.close();
        } else if (eventType === 'agent_event') {
          // Buffer the event and schedule a batch flush
          eventBufferRef.current.push(data);
          if (!flushTimerRef.current) {
            flushTimerRef.current = setTimeout(() => {
              flushTimerRef.current = null;
              flushBuffer();
            }, FLUSH_INTERVAL_MS);
          }
        }
      } catch (err) {
        console.error(`[AgentStream] Parse error for ${agentName}:`, err);
      }
    };

    eventSource.onerror = (error) => {
      console.error(`[AgentStream] Error for ${agentName}:`, error);
      setConnected(false);
    };

    return () => {
      console.log(`[AgentStream] Closing ${agentName} stream`);
      // Clear pending flush timer
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      // Flush any remaining events before closing
      flushBuffer();
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [migrationId, agentName, enabled, flushBuffer]);

  return { connected };
}

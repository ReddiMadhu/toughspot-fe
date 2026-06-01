/**
 * useAgentStream — SSE hook for streaming events from a specific agent.
 *
 * Connects to GET /api/v1/ts-migration/{migrationId}/agents/{agentSlug}/stream
 * and dispatches parsed events to the agentStore.
 */
import { useEffect, useState, useRef } from 'react';
import { API_BASE } from '../config.js';
import useAgentStore from '../stores/agentStore.js';

// Map internal agent names to URL slugs
const AGENT_SLUG_MAP = {
  source_analysis: 'source-analysis',
  data_model: 'data-model',
  dax_conversion: 'dax-conversion',
  export: 'export',
};

export function useAgentStream(migrationId, agentName, enabled = true) {
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const { actions } = useAgentStore();

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

        if (eventType === 'agent_complete') {
          actions.completeAgent(agentName, data.data || {});
          setConnected(false);
          eventSource.close();
        } else if (eventType === 'agent_failed') {
          actions.failAgent(agentName, data.message || 'Agent failed');
          setConnected(false);
          eventSource.close();
        } else if (eventType === 'agent_event') {
          actions.addEvent(agentName, data);
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
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [migrationId, agentName, enabled]);

  return { connected };
}

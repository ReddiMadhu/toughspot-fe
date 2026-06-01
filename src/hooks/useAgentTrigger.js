/**
 * useAgentTrigger — Trigger agent execution and manage full lifecycle.
 *
 * Calls POST /agents/{slug}/start, then auto-connects SSE stream.
 * Returns { trigger, retry, status, progress, events, error, subPhase, message }.
 */
import { useCallback, useMemo } from 'react';
import useAgentStore from '../stores/agentStore.js';
import { useAgentStream } from './useAgentStream.js';
import migrationApi from '../services/migrationApi.js';

// Map internal agent names to URL slugs
const AGENT_SLUG_MAP = {
  source_analysis: 'source-analysis',
  data_model: 'data-model',
  dax_conversion: 'dax-conversion',
  export: 'export',
};

export function useAgentTrigger(migrationId, agentName) {
  const agentState = useAgentStore((state) => state.agents[agentName]);
  const { actions } = useAgentStore();

  const isStreamActive = agentState?.status === 'running';

  // Connect SSE stream when agent is running
  const { connected } = useAgentStream(migrationId, agentName, isStreamActive);

  const trigger = useCallback(async () => {
    if (!migrationId || !agentName) return;

    const slug = AGENT_SLUG_MAP[agentName];
    if (!slug) {
      console.error(`[AgentTrigger] Unknown agent: ${agentName}`);
      return;
    }

    try {
      // Mark as running in store first (to start SSE connection)
      actions.startAgent(agentName);

      // Call backend trigger
      await migrationApi.startAgent(migrationId, slug);
      console.log(`[AgentTrigger] Agent '${agentName}' triggered for migration ${migrationId}`);
    } catch (err) {
      console.error(`[AgentTrigger] Failed to trigger ${agentName}:`, err);
      const errorMsg = err?.response?.data?.detail || err.message || 'Failed to start agent';

      // If it's a 409 (already running), don't fail — just keep streaming
      if (err?.response?.status === 409) {
        console.log(`[AgentTrigger] Agent '${agentName}' already running, connecting to stream...`);
        return;
      }

      actions.failAgent(agentName, errorMsg);
    }
  }, [migrationId, agentName, actions]);

  const retry = useCallback(async () => {
    actions.resetAgent(agentName);
    // Small delay to let state settle before re-triggering
    await new Promise((r) => setTimeout(r, 200));
    await trigger();
  }, [agentName, actions, trigger]);

  return useMemo(() => ({
    trigger,
    retry,
    connected,
    status: agentState?.status ?? 'idle',
    progress: agentState?.progress ?? 0,
    events: agentState?.events ?? [],
    error: agentState?.error ?? null,
    subPhase: agentState?.subPhase ?? '',
    message: agentState?.message ?? '',
    summary: agentState?.summary ?? null,
  }), [trigger, retry, connected, agentState]);
}

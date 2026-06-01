import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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

  // ── Virtual Visual Status to enforce a premium thinking duration ──
  const [visualStatus, setVisualStatus] = useState(agentState?.status ?? 'idle');
  const triggerTime = useRef(0);

  useEffect(() => {
    const realStatus = agentState?.status ?? 'idle';

    if (realStatus === 'running') {
      setVisualStatus('running');
      triggerTime.current = Date.now();
    } else if (realStatus === 'completed') {
      // For DAX conversion, let it finish naturally as it already takes time.
      // For very fast steps, enforce a minimum labor duration of 6.0 seconds.
      const isDax = agentName === 'dax_conversion';
      const minDuration = isDax ? 500 : 6000;
      
      const elapsed = triggerTime.current > 0 ? Date.now() - triggerTime.current : minDuration;
      
      if (elapsed < minDuration) {
        const delay = minDuration - elapsed;
        const t = setTimeout(() => {
          setVisualStatus('completed');
          triggerTime.current = 0;
        }, delay);
        return () => clearTimeout(t);
      } else {
        setVisualStatus('completed');
        triggerTime.current = 0;
      }
    } else {
      setVisualStatus(realStatus);
      triggerTime.current = 0;
    }
  }, [agentState?.status, agentName]);

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
    status: visualStatus,
    progress: agentState?.progress ?? 0,
    events: agentState?.events ?? [],
    error: agentState?.error ?? null,
    subPhase: agentState?.subPhase ?? '',
    message: agentState?.message ?? '',
    summary: agentState?.summary ?? null,
  }), [trigger, retry, connected, visualStatus, agentState]);
}

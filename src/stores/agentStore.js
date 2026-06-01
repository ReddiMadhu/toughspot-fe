/**
 * Agent Store — Zustand store for multi-agent execution state.
 *
 * Tracks per-agent status, progress, events log, and errors.
 * Used by useAgentTrigger/useAgentStream hooks and AgentProcessingOverlay.
 */
import { create } from 'zustand';

const initialAgentState = () => ({
  status: 'idle',    // 'idle' | 'running' | 'completed' | 'failed'
  progress: 0,       // 0-100
  subPhase: '',      // current sub-phase label
  message: '',       // latest human-readable message
  events: [],        // array of all streamed events
  error: null,       // error message if failed
  summary: null,     // completion summary data
});

const useAgentStore = create((set, get) => ({
  agents: {
    source_analysis: initialAgentState(),
    data_model:      initialAgentState(),
    dax_conversion:  initialAgentState(),
    export:          initialAgentState(),
  },

  actions: {
    startAgent: (agentName) =>
      set((state) => ({
        agents: {
          ...state.agents,
          [agentName]: {
            ...initialAgentState(),
            status: 'running',
            events: [],
          },
        },
      })),

    addEvent: (agentName, event) =>
      set((state) => {
        const agent = state.agents[agentName];
        if (!agent) return state;
        return {
          agents: {
            ...state.agents,
            [agentName]: {
              ...agent,
              status: 'running',
              progress: event.progress ?? agent.progress,
              subPhase: event.sub_phase ?? event.subPhase ?? agent.subPhase,
              message: event.message ?? agent.message,
              events: [...agent.events, event],
            },
          },
        };
      }),

    completeAgent: (agentName, summary = {}) =>
      set((state) => ({
        agents: {
          ...state.agents,
          [agentName]: {
            ...state.agents[agentName],
            status: 'completed',
            progress: 100,
            subPhase: 'complete',
            message: summary.message || 'Agent completed',
            summary,
          },
        },
      })),

    failAgent: (agentName, error) =>
      set((state) => ({
        agents: {
          ...state.agents,
          [agentName]: {
            ...state.agents[agentName],
            status: 'failed',
            progress: -1,
            error,
          },
        },
      })),

    resetAgent: (agentName) =>
      set((state) => ({
        agents: {
          ...state.agents,
          [agentName]: initialAgentState(),
        },
      })),

    resetAll: () =>
      set({
        agents: {
          source_analysis: initialAgentState(),
          data_model:      initialAgentState(),
          dax_conversion:  initialAgentState(),
          export:          initialAgentState(),
        },
      }),

    getAgentStatus: (agentName) => get().agents[agentName]?.status ?? 'idle',
  },
}));

export default useAgentStore;

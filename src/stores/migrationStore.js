import { create } from 'zustand';

const useMigrationStore = create((set) => ({
  migrationId: null,
  status: 'idle',       // 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'
  files: [],
  stats: {
    tables: 0,
    formulasConverted: 0,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    requiresReview: 0,
    elapsedSeconds: 0,
  },
  conversions: [],
  progressPercent: 0,
  currentStage: '',
  progressMessage: '',
  error: null,

  actions: {
    setMigrationId: (id) => set({ migrationId: id }),

    setStatus: (status) => set({ status }),

    setFiles: (files) => set({ files }),

    setProgress: (percent, stage, message) =>
      set({
        progressPercent: percent,
        currentStage: stage,
        progressMessage: message,
      }),

    setStats: (stats) =>
      set((state) => ({
        stats: {
          tables: stats.tables ?? state.stats.tables,
          formulasConverted: stats.formulas_converted ?? stats.formulasConverted ?? state.stats.formulasConverted,
          highConfidence: stats.high_confidence ?? stats.highConfidence ?? state.stats.highConfidence,
          mediumConfidence: stats.medium_confidence ?? stats.mediumConfidence ?? state.stats.mediumConfidence,
          lowConfidence: stats.low_confidence ?? stats.lowConfidence ?? state.stats.lowConfidence,
          requiresReview: stats.requires_review ?? stats.requiresReview ?? state.stats.requiresReview,
          elapsedSeconds: stats.elapsed_seconds ?? stats.elapsedSeconds ?? state.stats.elapsedSeconds,
        },
      })),

    setConversions: (conversions) => set({ conversions }),

    setError: (error) => set({ error }),

    startMigration: (migrationId, files) =>
      set({
        migrationId,
        status: 'processing',
        files: files.map((f) => f.name),
        progressPercent: 0,
        currentStage: 'parsing',
        progressMessage: 'Initializing migration...',
        error: null,
      }),

    completeMigration: (stats) =>
      set(() => ({
        status: 'completed',
        progressPercent: 100,
        currentStage: 'completed',
        progressMessage: 'Migration complete!',
        stats: {
          tables: stats.tables ?? 0,
          formulasConverted: stats.formulas_converted ?? 0,
          highConfidence: stats.high_confidence ?? 0,
          mediumConfidence: stats.medium_confidence ?? 0,
          lowConfidence: stats.low_confidence ?? 0,
          requiresReview: stats.requires_review ?? 0,
          elapsedSeconds: stats.elapsed_seconds ?? 0,
        },
      })),

    failMigration: (error) =>
      set({ status: 'failed', error, progressPercent: -1 }),

    reset: () =>
      set({
        migrationId: null,
        status: 'idle',
        files: [],
        stats: { tables: 0, formulasConverted: 0, highConfidence: 0, mediumConfidence: 0, lowConfidence: 0, requiresReview: 0, elapsedSeconds: 0 },
        conversions: [],
        progressPercent: 0,
        currentStage: '',
        progressMessage: '',
        error: null,
      }),
  },

}));

export default useMigrationStore;

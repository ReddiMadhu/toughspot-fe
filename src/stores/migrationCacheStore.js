/**
 * Migration Cache Store for ThoughtSpot - Optimized Caching for Workbook Metadata
 */
import { create } from 'zustand';
import { API_BASE } from '../config';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const useMigrationCacheStore = create((set, get) => ({
  metadataCache: {},
  summaryCache: {},
  tablesDataCache: {},
  classificationsCache: {},
  qualityCache: {},
  modelIntelligenceCache: {},

  loadWorkbookMetadataSummary: async (migrationId) => {
    const cached = get().summaryCache[migrationId];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response = await fetch(`${API_BASE}/ts-migration/${migrationId}/workbook-metadata/summary`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      set({
        summaryCache: {
          ...get().summaryCache,
          [migrationId]: { data, timestamp: Date.now(), ttl: CACHE_TTL }
        }
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      throw error;
    }
  },

  loadWorkbookMetadata: async (migrationId) => {
    const cached = get().metadataCache[migrationId];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response = await fetch(`${API_BASE}/ts-migration/${migrationId}/workbook-metadata`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      set({
        metadataCache: {
          ...get().metadataCache,
          [migrationId]: { data, timestamp: Date.now(), ttl: CACHE_TTL }
        }
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      throw error;
    }
  },

  loadTablesData: async (migrationId) => {
    const cached = get().tablesDataCache[migrationId];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response = await fetch(`${API_BASE}/ts-migration/${migrationId}/workbook-metadata/tables-data`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      set({
        tablesDataCache: {
          ...get().tablesDataCache,
          [migrationId]: { data, timestamp: Date.now(), ttl: CACHE_TTL }
        }
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch tables data:', error);
      throw error;
    }
  },

  loadTableClassifications: async (migrationId) => {
    const cached = get().classificationsCache[migrationId];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response = await fetch(`${API_BASE}/ts-migration/${migrationId}/table-classifications`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      set({
        classificationsCache: {
          ...get().classificationsCache,
          [migrationId]: { data, timestamp: Date.now(), ttl: CACHE_TTL }
        }
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch classifications:', error);
      throw error;
    }
  },

  loadDataQuality: async (migrationId) => {
    const cached = get().qualityCache[migrationId];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response = await fetch(`${API_BASE}/ts-migration/${migrationId}/data-quality`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      set({
        qualityCache: {
          ...get().qualityCache,
          [migrationId]: { data, timestamp: Date.now(), ttl: CACHE_TTL }
        }
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch data quality:', error);
      throw error;
    }
  },

  loadModelIntelligence: async (migrationId) => {
    const cached = get().modelIntelligenceCache[migrationId];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response = await fetch(`${API_BASE}/ts-migration/${migrationId}/workbook-metadata/model-intelligence`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      set({
        modelIntelligenceCache: {
          ...get().modelIntelligenceCache,
          [migrationId]: { data, timestamp: Date.now(), ttl: CACHE_TTL }
        }
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch model intelligence:', error);
      throw error;
    }
  },

  clearMigrationCache: (migrationId) => {
    set({
      metadataCache: { ...get().metadataCache, [migrationId]: undefined },
      summaryCache: { ...get().summaryCache, [migrationId]: undefined },
      tablesDataCache: { ...get().tablesDataCache, [migrationId]: undefined },
      classificationsCache: { ...get().classificationsCache, [migrationId]: undefined },
      qualityCache: { ...get().qualityCache, [migrationId]: undefined },
      modelIntelligenceCache: { ...get().modelIntelligenceCache, [migrationId]: undefined }
    });
  },

  clearAllCaches: () => {
    set({
      metadataCache: {},
      summaryCache: {},
      tablesDataCache: {},
      classificationsCache: {},
      qualityCache: {},
      modelIntelligenceCache: {}
    });
  }
}));

export default useMigrationCacheStore;

/**
 * Migration API Service for ThoughtSpot - API calls for ThoughtSpot-to-Power BI migration wizard
 */
import apiClient from './api';

const migrationApi = {
  // ============================================
  // Migration Workflow
  // ============================================

  createMigration: async (files, onUploadProgress) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post('/ts-migration/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  getMigrationStatus: async (migrationId) => {
    const response = await apiClient.get(`/ts-migration/${migrationId}`);
    return response.data;
  },

  deleteMigration: async (migrationId) => {
    const response = await apiClient.delete(`/ts-migration/${migrationId}`);
    return response.data;
  },

  // ============================================
  // Workbooks & Calculations
  // ============================================

  getWorkbooks: async (migrationId) => {
    const response = await apiClient.get(`/ts-migration/${migrationId}/workbooks`);
    return response.data;
  },

  getCalculations: async (migrationId, workbookId = null) => {
    const params = workbookId ? { workbook_id: workbookId } : {};
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/calculations`,
      { params }
    );
    return response.data;
  },

  // ============================================
  // Logic Graph
  // ============================================

  getLogicGraph: async (migrationId, format = 'reactflow') => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/logic-graph`,
      {
        params: { format },
      }
    );
    return response.data;
  },

  // ============================================
  // DAX Conversions
  // ============================================

  getConversions: async (migrationId, status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/conversions`,
      { params }
    );
    return response.data;
  },

  getConversion: async (migrationId, conversionId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/conversions/${conversionId}`
    );
    return response.data;
  },

  updateConversion: async (
    migrationId,
    conversionId,
    daxFormula,
    reasoning = null
  ) => {
    const response = await apiClient.patch(
      `/ts-migration/${migrationId}/conversions/${conversionId}`,
      {
        dax_formula: daxFormula,
        reasoning,
      }
    );
    return response.data;
  },

  // ============================================
  // Validation
  // ============================================

  triggerValidation: async (migrationId) => {
    const response = await apiClient.post(
      `/ts-migration/${migrationId}/validate`
    );
    return response.data;
  },

  getValidationResults: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/validation-results`
    );
    return response.data;
  },

  // ============================================
  // 100% Fidelity Validation
  // ============================================

  getFidelityValidation: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/fidelity-validation`
    );
    return response.data;
  },

  getCorrectionHistory: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/correction-history`
    );
    return response.data;
  },

  getFidelityStats: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/fidelity-stats`
    );
    return response.data;
  },

  // ============================================
  // Export
  // ============================================

  exportPowerBI: async (migrationId) => {
    const response = await apiClient.post(
      `/ts-migration/${migrationId}/export`
    );
    return response.data;
  },

  downloadArtifacts: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/download`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // ============================================
  // Wizard API Methods
  // ============================================

  getDataQuality: async (migrationId) => {
    const response = await apiClient.get(`/ts-migration/${migrationId}/data-quality`);
    return response.data;
  },

  getDataPreview: async (migrationId) => {
    const response = await apiClient.get(`/ts-migration/${migrationId}/data-preview`);
    return response.data;
  },

  getTableClassifications: async (migrationId) => {
    const response = await apiClient.get(`/ts-migration/${migrationId}/table-classifications`);
    return response.data;
  },

  getSuggestedRelationships: async (migrationId) => {
    const response = await apiClient.get(`/ts-migration/${migrationId}/suggested-relationships`);
    return response.data;
  },

  getFilters: async (migrationId) => {
    const response = await apiClient.get(`/ts-migration/${migrationId}/filters`);
    return response.data;
  },

  triggerConversion: async (migrationId) => {
    const response = await apiClient.post(`/ts-migration/${migrationId}/trigger-conversion`);
    return response.data;
  },

  downloadConversionReport: async (migrationId, conversionIds = null) => {
    let url = `/ts-migration/${migrationId}/conversion-report`;

    if (conversionIds && (conversionIds.length > 0 || conversionIds.size > 0)) {
      const ids = Array.from(conversionIds).join(',');
      url += `?conversion_ids=${encodeURIComponent(ids)}`;
    }

    const response = await apiClient.get(url, { responseType: 'blob' });

    // Trigger browser download
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'dax_conversion_report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response.data;
  },

  getRecommendations: async (migrationId) => {
    const response = await apiClient.get(`/ts-migration/${migrationId}/recommendations`);
    return response.data;
  },

  downloadAllArtifacts: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/download`,
      { responseType: 'blob' }
    );

    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'migration_package.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response.data;
  },

  // ============================================
  // Model Enhancements
  // ============================================

  getModelEnhancements: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/model-enhancements`
    );
    return response.data;
  },

  downloadEnhancementGuide: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/model-enhancements/download`,
      {
        responseType: 'blob',
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MODEL_ENHANCEMENTS_REQUIRED.md');
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response.data;
  },

  downloadAllEnhancements: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/model-enhancements/download-all`,
      {
        responseType: 'blob',
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'model_enhancements.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response.data;
  },

  // ============================================
  // Workbook Metadata Methods
  // ============================================

  getWorkbookMetadataSummary: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/workbook-metadata/summary`
    );
    return response.data;
  },

  getWorkbookMetadata: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/workbook-metadata`
    );
    return response.data;
  },

  getWorkbookWorksheets: async (migrationId, workbookId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/workbook-metadata/${workbookId}/worksheets`
    );
    return response.data;
  },

  getWorkbookCalculatedFields: async (migrationId, workbookId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/workbook-metadata/${workbookId}/calculated-fields`
    );
    return response.data;
  },

  getTableDetails: async (migrationId, workbookId, tableName) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/workbook-metadata/${workbookId}/table/${tableName}`
    );
    return response.data;
  },

  getTablesData: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/workbook-metadata/tables-data`
    );
    return response.data;
  },

  getModelIntelligence: async (migrationId) => {
    const response = await apiClient.get(
      `/ts-migration/${migrationId}/workbook-metadata/model-intelligence`
    );
    return response.data;
  },
};

export default migrationApi;

import axios from 'axios';
import { API_BASE } from '../config';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

const api = {
  // HTTP method pass-throughs for Axios client compatibility
  get: (url, config) => client.get(url, config),
  post: (url, data, config) => client.post(url, data, config),
  put: (url, data, config) => client.put(url, data, config),
  delete: (url, config) => client.delete(url, config),
  patch: (url, data, config) => client.patch(url, data, config),

  /** Upload .tml / .zip files and start migration */
  upload: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return client.post('/ts-migration/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Poll for migration status */
  getStatus: (migrationId) => client.get(`/ts-migration/${migrationId}`),

  /** Get all DAX conversions for review page */
  getConversions: (migrationId) => client.get(`/ts-migration/${migrationId}/conversions`),

  /** Get the formula dependency logic graph */
  getLogicGraph: (migrationId) => client.get(`/ts-migration/${migrationId}/logic-graph`),

  /** Download a specific output file */
  getDownloadUrl: (migrationId, fileType = 'all') =>
    `${API_BASE}/ts-migration/${migrationId}/download?file=${fileType}`,

  getFidelityValidation: (migrationId) => client.get(`/ts-migration/${migrationId}/fidelity-validation`),

  getCorrectionHistory: (migrationId) => client.get(`/ts-migration/${migrationId}/correction-history`),

  getRecommendations: (migrationId) => client.get(`/ts-migration/${migrationId}/recommendations`),

  getModelEnhancements: (migrationId) => client.get(`/ts-migration/${migrationId}/model-enhancements`),

  triggerValidation: (migrationId) => client.post(`/ts-migration/${migrationId}/validate`),

  updateConversion: (migrationId, conversionId, daxFormula, reasoning) =>
    client.patch(`/ts-migration/${migrationId}/conversions/${conversionId}`, {
      dax_formula: daxFormula,
      reasoning,
    }),
};

export default api;

import axios from 'axios';
import { API_BASE } from '../config';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

const api = {
  /** Upload .tml / .zip files and start migration */
  upload: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return client.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Poll for migration status */
  getStatus: (migrationId) => client.get(`/${migrationId}`),

  /** Get all DAX conversions for review page */
  getConversions: (migrationId) => client.get(`/${migrationId}/conversions`),

  /** Download a specific output file */
  getDownloadUrl: (migrationId, fileType = 'all') =>
    `${API_BASE}/${migrationId}/download?file=${fileType}`,
};

export default api;

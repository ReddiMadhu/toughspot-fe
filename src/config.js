/**
 * Frontend Configuration
 *
 * In development (Vite dev server), API_BASE is '/api/v1' and requests are
 * proxied to the backend via vite.config.js.
 *
 * In production (Azure App Service / static build), set VITE_API_BASE to the
 * backend's full URL, e.g. 'https://my-backend.azurewebsites.net/api/v1'.
 * If the frontend is served from the same App Service, leave it as '/api/v1'.
 */
export const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsHost = typeof window !== 'undefined' ? window.location.host : 'localhost:5174';
export const WS_BASE = `${wsProtocol}//${wsHost}/api/v1/ts-migration`;

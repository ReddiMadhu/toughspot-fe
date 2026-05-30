export const API_BASE = '/api/v1';
const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsHost = typeof window !== 'undefined' ? window.location.host : 'localhost:5174';
export const WS_BASE = `${wsProtocol}//${wsHost}/api/v1/ts-migration`;

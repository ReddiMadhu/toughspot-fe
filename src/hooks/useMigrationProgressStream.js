import { useEffect, useState } from 'react';
import { API_BASE } from '../config.js';

/**
 * Custom hook for migration progress streaming via Server-Sent Events (SSE).
 *
 * @param {string} migrationId - The migration ID
 * @param {boolean} enabled - Whether to connect (set to false when migration is completed)
 * @returns {Object} - { lastMessage, connected }
 */
export const useMigrationProgressStream = (migrationId, enabled = true) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!migrationId || !enabled) {
      setConnected(false);
      return;
    }

    // Resolve SSE stream URL relative to the API_BASE
    const sseUrl = `${API_BASE}/ts-migration/${migrationId}/progress-stream`;
    console.log('Connecting to migration progress stream (SSE):', sseUrl);

    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log(`Migration progress stream connected for ${migrationId}`);
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const message = {
          data: event.data,
          timestamp: new Date()
        };
        setLastMessage(message);
      } catch (error) {
        console.error('Failed to process stream message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Migration stream error (retrying...):', error);
      setConnected(false);
    };

    return () => {
      console.log('Closing migration progress stream (SSE)');
      eventSource.close();
    };
  }, [migrationId, enabled]);

  return { lastMessage, connected };
};

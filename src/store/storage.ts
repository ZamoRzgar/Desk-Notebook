import type { PersistedData } from '../types';

const STORAGE_KEY = 'folio-notes:data:v1';

/**
 * Storage backend abstraction. The app talks to this interface only, so a
 * future milestone can swap in an Electron/SQLite-backed implementation
 * without touching the store or UI layers.
 */
export interface StorageBackend {
  read(): PersistedData | null;
  write(data: PersistedData): void;
}

export class LocalStorageBackend implements StorageBackend {
  read(): PersistedData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedData;
      if (parsed.version !== 1 || !Array.isArray(parsed.books)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  write(data: PersistedData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to persist notes:', err);
    }
  }
}

export function createStorage(): StorageBackend {
  return new LocalStorageBackend();
}

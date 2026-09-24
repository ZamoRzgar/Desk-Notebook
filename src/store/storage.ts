import type { PersistedData } from '../types';

const STORAGE_KEY = 'desk-notebook:data:v1';
const LEGACY_STORAGE_KEY = 'folio-notes:data:v1';

declare global {
  interface Window {
    deskNotebook?: {
      platform: string;
      versions: Record<string, string>;
      storage: {
        read(): Promise<string | null>;
        write(json: string): Promise<void>;
      };
    };
  }
}

/**
 * Storage backend abstraction. The app talks to this interface only, so the
 * SQLite/Electron backend and the browser localStorage backend are
 * interchangeable. Async because the Electron backend crosses IPC.
 */
export interface StorageBackend {
  read(): Promise<PersistedData | null>;
  write(data: PersistedData): Promise<void>;
}

function validate(parsed: unknown): PersistedData | null {
  const data = parsed as PersistedData | null;
  if (data && data.version === 1 && Array.isArray(data.books) && data.books.length > 0) {
    return data;
  }
  return null;
}

export class LocalStorageBackend implements StorageBackend {
  async read(): Promise<PersistedData | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return validate(JSON.parse(raw));
      // One-time migration from the pre-rename ("Folio") key.
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const data = validate(JSON.parse(legacy));
        if (data) {
          localStorage.setItem(STORAGE_KEY, legacy);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          return data;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async write(data: PersistedData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to persist notes:', err);
    }
  }
}

/** Talks to the SQLite-backed storage in the Electron main process via IPC. */
export class ElectronBackend implements StorageBackend {
  async read(): Promise<PersistedData | null> {
    try {
      const json = await window.deskNotebook!.storage.read();
      return json ? validate(JSON.parse(json)) : null;
    } catch (err) {
      console.warn('Failed to read from SQLite storage:', err);
      return null;
    }
  }

  async write(data: PersistedData): Promise<void> {
    try {
      await window.deskNotebook!.storage.write(JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to persist notes to SQLite:', err);
    }
  }
}

export function createStorage(): StorageBackend {
  if (typeof window !== 'undefined' && window.deskNotebook?.storage) {
    return new ElectronBackend();
  }
  return new LocalStorageBackend();
}

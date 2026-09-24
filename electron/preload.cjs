const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('deskNotebook', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  },
  // SQLite-backed storage in the main process. Mirrors the renderer's
  // StorageBackend interface (read returns the persisted JSON string).
  storage: {
    read: () => ipcRenderer.invoke('storage:read'),
    write: (json) => ipcRenderer.invoke('storage:write', json),
  },
});

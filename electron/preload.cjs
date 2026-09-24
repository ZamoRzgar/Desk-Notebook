const { contextBridge } = require('electron');

// Reserved for future native capabilities (SQLite persistence, file export).
// The UI milestone deliberately uses no Electron APIs so the browser preview works.
contextBridge.exposeInMainWorld('folio', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  },
});

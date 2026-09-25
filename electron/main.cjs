const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_KEY = 'data:v1';

// Keep the data directory stable (~/.config/desk-notebook) regardless of the
// packaged productName ("Desk Notebook").
app.setName('desk-notebook');

let db = null;

function initDb() {
  const Database = require('better-sqlite3');
  const dir = app.getPath('userData');
  fs.mkdirSync(dir, { recursive: true });
  db = new Database(path.join(dir, 'desk-notebook.db'));
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS kv (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  console.log('[desk-notebook] database ready at', path.join(dir, 'desk-notebook.db'));
}

function registerIpc() {
  // Whole-library read; the renderer seeds sample data when this is null.
  ipcMain.handle('storage:read', () => {
    const row = db.prepare('SELECT value FROM kv WHERE key = ?').get(DATA_KEY);
    return row ? row.value : null;
  });

  ipcMain.handle('storage:write', (_event, json) => {
    if (typeof json !== 'string') throw new Error('storage:write expects a JSON string');
    db.prepare(
      'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    ).run(DATA_KEY, json);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 1024,
    minHeight: 680,
    title: 'Desk Notebook',
    // Dark-safe backdrop so the window never flashes white while loading.
    backgroundColor: '#181410',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  // Dev diagnostics: DN_DEBUG=1 pipes renderer console + storage state to stdout.
  if (process.env.DN_DEBUG) {
    win.webContents.on('console-message', (_e, _level, msg) => console.log('[renderer]', msg));
    win.webContents.on('did-fail-load', (_e, code, desc) =>
      console.log('[main] did-fail-load', code, desc),
    );
    win.webContents.once('did-finish-load', () => {
      setTimeout(async () => {
        try {
          const bridge = await win.webContents.executeJavaScript(
            "typeof window.deskNotebook + '/' + (window.deskNotebook ? typeof window.deskNotebook.storage : '-')",
          );
          console.log('[main] bridge:', bridge);
          const row = db.prepare('SELECT length(value) AS len FROM kv WHERE key = ?').get(DATA_KEY);
          console.log('[main] stored bytes:', row ? row.len : 'none');
        } catch (err) {
          console.log('[main] debug error', err?.message ?? err);
        }
      }, 2000);
    });
  }

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    win.loadURL(devServerUrl);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  try {
    initDb();
  } catch (err) {
    dialog.showErrorBox(
      'Desk Notebook failed to start',
      `Could not open the notes database:\n${err?.message ?? err}`,
    );
    app.quit();
    return;
  }
  registerIpc();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (db) db.close();
});

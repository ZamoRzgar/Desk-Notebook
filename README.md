# Desk Notebook

A note-taking app that looks like a physical book. Notes are organized as
**Book → Sections (colored binder tabs) → Pages**, with rich text, multi-color
highlighting, tags, full-text search, print/PDF export, and a cozy dark mode.

Runs in the browser (localStorage) and as an Electron desktop app (SQLite).

## Quick start (browser preview)

```bash
npm install
npm run dev
```

Open **http://localhost:5173/**. On first run the app seeds a sample book
("Semester 1") with Math, Physics, Literature, and History sections.

## Desktop app (Electron)

```bash
npm install
npm run build
npm run electron:start        # serves the production build in Electron
```

Live-reload development session:

```bash
npm run dev                                            # terminal 1
VITE_DEV_SERVER_URL=http://localhost:5173 npm run electron:start   # terminal 2
```

`npm run electron:dev` is a shortcut for `npm run build && electron .`.

## Install as desktop app (Linux)

```bash
npm run dist:linux     # type-check + vite build + electron-builder (AppImage + unpacked dir)
```

Artifacts land in `release/`:
- `release/Desk Notebook-<version>.AppImage` — portable single-file app
- `release/linux-unpacked/` — unpacked build (`dir` target), fallback if the
  AppImage can't run (e.g. no FUSE)

Install the AppImage and register a launcher:

```bash
mkdir -p ~/Applications ~/.local/share/applications ~/.local/share/icons
cp "release/Desk Notebook-"*.AppImage ~/Applications/desk-notebook.AppImage
chmod +x ~/Applications/desk-notebook.AppImage
cp build/icon.png ~/.local/share/icons/desk-notebook.png

cat > ~/.local/share/applications/desk-notebook.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=Desk Notebook
Comment=A cozy book-style notebook
Exec=/home/zamo/Applications/desk-notebook.AppImage
Icon=/home/zamo/.local/share/icons/desk-notebook.png
Terminal=false
Categories=Office;Utility;
Keywords=notes;notebook;writing;
StartupWMClass=desk-notebook
EOF
update-desktop-database ~/.local/share/applications
```

"Desk Notebook" then appears in the apps menu (log out/in if it doesn't show
up immediately). To update later, rebuild and overwrite
`~/Applications/desk-notebook.AppImage` — user data lives separately in
`~/.config/desk-notebook/` and is untouched.

Notes:
- electron-builder downloads (Electron, appimagetool) honor the
  `ELECTRON_MIRROR` / `ELECTRON_BUILDER_BINARIES_MIRROR` env vars — useful on
  networks where GitHub releases are unreachable (e.g.
  `https://npmmirror.com/mirrors/electron/` and
  `https://npmmirror.com/mirrors/electron-builder-binaries/`).
- `npmRebuild` is disabled in the builder config; better-sqlite3 must already
  be compiled for Electron's ABI (see the rebuild command below) before
  packaging.
- The launcher uses no `--no-sandbox` flag: the packaged app runs its sandbox
  through user namespaces on this machine. If a different machine rejects the
  sandbox, append `--no-sandbox` to the `Exec` line as a last resort.


Data lives in a SQLite database at Electron's `userData` path
(e.g. `~/.config/desk-notebook/desk-notebook.db` on Linux). The renderer uses
the SQLite backend automatically when running inside Electron
(`window.deskNotebook` bridge) and falls back to `localStorage` in the browser.

### Native module note

`better-sqlite3` must be compiled against Electron's headers (not Node's).
If you reinstall dependencies, run:

```bash
cd node_modules/better-sqlite3 && npx node-gyp rebuild --release \
  --dist-url=https://electronjs.org/headers --target=$(node -p "require('electron/package.json').version")
```

(If GitHub is unreachable, any Electron mirror works as `--dist-url`, e.g.
`https://npmmirror.com/mirrors/electron/`.)

For headless/diagnostics runs: `DN_DEBUG=1 npm run electron:start` pipes
renderer console output and storage state to stdout.

## Scripts

| Command                  | What it does                                            |
| ------------------------ | ------------------------------------------------------- |
| `npm run dev`            | Vite dev server — browser preview                       |
| `npm run build`          | Type-check (`tsc`) + production build to `dist/`        |
| `npm run preview`        | Serve the production build in a browser                 |
| `npm run electron:start` | Launch Electron against `dist/` (build first)           |
| `npm run electron:dev`   | Build, then launch Electron                             |
| `npm run dist`           | Build + package with electron-builder (all platforms)   |
| `npm run dist:linux`     | Build + package AppImage and unpacked dir to `release/` |

## Features

- **Book shell UI** — open-book layout, leather cover, ruled paper, colored
  binder tabs on the right edge, dark mode ("book at night", persisted).
- **Management** — create/rename/delete books (header icons next to the book
  selector), create sections (+ tab), rename/recolor sections (double-click a
  tab or the pencil in the page-list header), delete sections and pages with a
  confirm dialog (hover a page in the list). The last remaining book cannot be
  deleted.
- **Editor** — TipTap rich text: bold/italic/strikethrough, H1/H2, bullet and
  ordered lists, multi-color highlight (yellow/green/pink/blue) + clear.
  Autosaves with a 500 ms debounce.
- **Tags** — chips on each page, add/remove inline, header filter dims
  non-matching pages.
- **Search** — header search box, instant full-text search (title + content)
  across the active book; results show section + snippet with the match
  marked; click (or Enter for the top hit) jumps to the page.
- **Export** — printer icon on the page: print the current page or the whole
  section. Uses a print stylesheet + `window.print()`, so "Save as PDF" works
  in both browser and Electron. Chrome is stripped; highlights stay colored.

## Stack

- Electron 38 + React 19 + TypeScript + Vite 7
- Tailwind CSS 4 (`@tailwindcss/vite`, class-based dark mode)
- TipTap 3 (`@tiptap/react`, StarterKit, `@tiptap/extension-highlight`)
- better-sqlite3 (Electron main process only)

## Layout

```
electron/
  main.cjs           BrowserWindow + SQLite (kv table) + IPC handlers
  preload.cjs        window.deskNotebook bridge (typed async storage API)
src/
  types.ts           Book / Section / Page models, color palettes
  lib/
    search.ts        Plain-text extraction + instant full-text search
    renderHtml.ts    TipTap JSON → HTML (for printing)
  store/
    storage.ts       StorageBackend interface; Electron (IPC) + localStorage impls
    seed.ts          First-run sample data
    AppContext.tsx   React context: state, selection, actions, persistence, theme
  components/
    HeaderBar.tsx    Title, search, book selector + book management, tag filter, theme
    BookView.tsx     The open-book shell
    SectionTabs.tsx  Binder tabs (double-click to edit)
    PageList.tsx     Left page: TOC, hover-delete, section edit/delete
    PageEditor.tsx   Right page: TipTap editor, toolbar, tags, export menu
    SearchBox.tsx    Search input + results dropdown
    PrintView.tsx    Print-only document (window.print pipeline)
    SectionModal.tsx Create/edit section (name + color)
    NameModal.tsx    Generic name dialog (books)
    ConfirmModal.tsx Destructive-action confirmation
    ExportMenu.tsx   Print this page / entire section
    TagChip.tsx
```

## Known limitations

- Storage is whole-library JSON in a single SQLite `kv` row (fine at this
  scale; per-page tables are a future optimization). Browser mode is limited
  by the ~5 MB localStorage cap.
- No Electron packaging (electron-builder) yet; the app runs via `electron .`.
- No undo for deletions; no drag-to-reorder for pages/sections.
- Search covers the active book only.

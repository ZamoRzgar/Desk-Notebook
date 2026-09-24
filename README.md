# Desk Notebook

A note-taking app that looks like a physical book. Notes are organized as
**Book → Sections (colored binder tabs) → Pages**, with rich text, multi-color
highlighting, tags, and a cozy dark mode.

**Milestone 1: previewable UI.** The full interface runs in the browser against
`localStorage` — no Electron APIs required.

## Preview it

```bash
npm install
npm run dev
```

Then open **http://localhost:5173/** in a browser. On first run the app seeds
itself with a sample book ("Semester 1") containing Math, Physics, Literature,
and History sections with realistic notes, highlights, and tags.

## Scripts

| Command              | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `npm run dev`        | Vite dev server — the main preview workflow (browser)               |
| `npm run build`      | Type-check (`tsc`) + production build to `dist/`                    |
| `npm run preview`    | Serve the production build                                          |
| `npm run electron:start` | Launch Electron against `dist/` (requires `npm run build` first) |
| `npm run electron:dev`   | Build, then launch Electron (minimal; no live-reload yet)       |

For a dev-server Electron session: `npm run dev` in one terminal, then
`VITE_DEV_SERVER_URL=http://localhost:5173 npm run electron:start` in another.

> Note: if dependencies were installed with `ELECTRON_SKIP_BINARY_DOWNLOAD=1`,
> run `node node_modules/electron/install.js` once before launching Electron.

## Stack

- Electron + React 19 + TypeScript + Vite 7
- Tailwind CSS 4 (via `@tailwindcss/vite`, class-based dark mode)
- TipTap 3 (`@tiptap/react`, StarterKit, `@tiptap/extension-highlight` with
  `multicolor: true`)
- Storage: `localStorage` behind a `StorageBackend` interface
  (`src/store/storage.ts`), ready to be swapped for SQLite/Electron IPC later

## Layout

```
electron/            Electron main + preload (shell only, no packaging)
  main.cjs
  preload.cjs
src/
  types.ts           Book / Section / Page models, color palettes
  store/
    storage.ts       StorageBackend interface + localStorage implementation
    seed.ts          First-run sample data
    AppContext.tsx   React context: state, selection, actions, persistence, theme
  components/
    HeaderBar.tsx    Title, book selector, tag filter, theme toggle
    BookView.tsx     The open-book shell (cover, two pages, spine shadows)
    SectionTabs.tsx  Colored binder tabs on the book's right edge
    PageList.tsx     Left page: table of contents for the active section
    PageEditor.tsx   Right page: TipTap editor, floating toolbar, title, tags
    NewSectionModal.tsx
    TagChip.tsx
```

## Behavior notes

- Editor autosaves to `localStorage` with a 500 ms debounce, flushed on page switch.
- Theme is persisted (`folio-notes:theme`) and applied pre-paint to avoid flashes.
- The tag filter in the header dims non-matching pages in the table of contents.

## Known limitations (future milestones)

- `electron:dev` has no live-reload wiring (no `concurrently`/`wait-on` yet).
- No Electron packaging (electron-builder), no native DB (better-sqlite3) yet.
- No book creation UI (selector only), no page/section deletion or reordering.
- Data lives in `localStorage` (~5 MB cap); the storage interface exists so this
  can be replaced without touching components.

import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { TableKit } from '@tiptap/extension-table';
import type { JSONContent } from '@tiptap/core';
import type { Page } from '../types';
import { HIGHLIGHT_COLORS } from '../types';
import { useApp } from '../store/AppContext';
import { TagChip } from './TagChip';
import { ExportMenu } from './ExportMenu';
import { SymbolMenu } from './SymbolMenu';

const AUTOSAVE_MS = 500;

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault() /* keep editor focus */}
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[13px] transition-colors duration-150 ${
        active
          ? 'bg-stone-800 text-[#fdf8ee] dark:bg-[#e9dfc8] dark:text-stone-900'
          : 'text-stone-600 hover:bg-stone-900/8 dark:text-stone-300 dark:hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  // Subscribe to every transaction so button states update the instant they
  // change, not on the next keystroke.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      strike: e.isActive('strike'),
      h1: e.isActive('heading', { level: 1 }),
      h2: e.isActive('heading', { level: 2 }),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      table: e.isActive('table'),
      highlightColor: (e.getAttributes('highlight').color as string | undefined) ?? null,
    }),
  });
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-stone-900/10 bg-white/80 px-2 py-1 shadow-md backdrop-blur dark:border-white/10 dark:bg-[#1f1b16]/85">
      <ToolbarButton
        title="Bold"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="font-serif italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      <SymbolMenu editor={editor} />

      <div className="mx-1 h-4 w-px bg-stone-300 dark:bg-stone-600" />

      <ToolbarButton
        title="Heading 1"
        active={state.h1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <span className="font-serif font-bold">H1</span>
      </ToolbarButton>
      <ToolbarButton
        title="Heading 2"
        active={state.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="font-serif text-xs font-bold">H2</span>
      </ToolbarButton>

      <div className="mx-1 h-4 w-px bg-stone-300 dark:bg-stone-600" />

      <ToolbarButton
        title="Bullet list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <circle cx="4" cy="6" r="1.6" />
          <circle cx="4" cy="12" r="1.6" />
          <circle cx="4" cy="18" r="1.6" />
          <rect x="8" y="5" width="13" height="2" rx="1" />
          <rect x="8" y="11" width="13" height="2" rx="1" />
          <rect x="8" y="17" width="13" height="2" rx="1" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
          <path d="M9 5h12M9 12h12M9 19h12" />
          <path d="M3.5 4.5 4.5 4v3.5M3 11.2c.3-.6 1-1 1.6-.8.7.2 1 1 .6 1.6-.3.5-1.4 1.4-2 2h2.3M3.4 17.3c.2-.4.8-.7 1.3-.6.8.1 1.2.9.8 1.6-.2.4-.6.6-1 .7.4.1.8.3 1 .7.4.7 0 1.5-.8 1.6-.5.1-1.1-.2-1.3-.6" strokeWidth="1.4" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        title="Insert table"
        active={state.table}
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
          <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
          <path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15M15.5 4.5v15" />
        </svg>
      </ToolbarButton>

      <div className="mx-1 h-4 w-px bg-stone-300 dark:bg-stone-600" />

      {HIGHLIGHT_COLORS.map((c) => {
        const active = state.highlightColor === c.value;
        return (
          <button
            key={c.value}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              // Clicking the active color again turns highlighting off, so
              // you can go back to normal writing without the eraser.
              active
                ? editor.chain().focus().unsetHighlight().run()
                : editor.chain().focus().setHighlight({ color: c.value }).run()
            }
            title={active ? `Stop highlighting ${c.name.toLowerCase()}` : `Highlight ${c.name.toLowerCase()}`}
            aria-label={active ? `Stop highlighting ${c.name.toLowerCase()}` : `Highlight ${c.name.toLowerCase()}`}
            style={{ backgroundColor: c.value }}
            className={`mx-0.5 h-5 w-5 rounded-full shadow-inner transition-transform hover:scale-110 ${
              active ? 'ring-2 ring-stone-700 ring-offset-1 dark:ring-stone-200' : 'ring-1 ring-stone-900/15'
            }`}
          />
        );
      })}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().unsetHighlight().run()}
        title="Clear highlight"
        aria-label="Clear highlight"
        className="ml-0.5 flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-900/8 hover:text-stone-600 dark:hover:bg-white/10 dark:hover:text-stone-200"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
          <path d="M22 21H7" />
          <path d="m5 11 9 9" />
        </svg>
      </button>
    </div>
  );
}

function TagEditor({ page }: { page: Page }) {
  const { addTag, removeTag } = useApp();
  const [draft, setDraft] = useState('');

  const commit = () => {
    if (draft.trim()) {
      addTag(page.id, draft);
      setDraft('');
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {page.tags.map((t) => (
        <TagChip key={t} tag={t} onRemove={() => removeTag(page.id, t)} />
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Backspace' && draft === '' && page.tags.length > 0) {
            removeTag(page.id, page.tags[page.tags.length - 1]);
          }
        }}
        onBlur={commit}
        placeholder="+ tag"
        className="w-16 rounded-full bg-transparent px-2 py-0.5 text-[11px] text-stone-500 placeholder-stone-400 outline-none transition-colors hover:bg-stone-900/5 focus:bg-white/60 focus:ring-1 focus:ring-stone-400/40 dark:text-stone-300 dark:hover:bg-white/5 dark:focus:bg-white/5"
      />
    </div>
  );
}

/**
 * The right page of the book: title, tags, floating toolbar, and the
 * TipTap editor itself. Content autosaves (debounced) to localStorage.
 * Remounts per page via `key={page.id}` from the parent.
 */
export function PageEditor({ page }: { page: Page }) {
  const { updatePageContent, renamePage } = useApp();

  const pageIdRef = useRef(page.id);
  const pendingRef = useRef<JSONContent | null>(null);
  const timerRef = useRef<number | null>(null);
  const updateRef = useRef(updatePageContent);
  updateRef.current = updatePageContent;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      // Fluid tables (no fixed column widths) so they shrink to fit the page.
      TableKit.configure({ table: { resizable: false } }),
    ],
    content: page.content,
    editorProps: {
      attributes: {
        class:
          'tiptap paper-lines min-h-[55vh] font-serif text-[17px] text-[#3d362b] dark:text-[#e3d7bd] focus:outline-none',
      },
    },
    onUpdate: ({ editor: e }) => {
      pendingRef.current = e.getJSON();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        if (pendingRef.current) {
          updateRef.current(pageIdRef.current, pendingRef.current);
          pendingRef.current = null;
        }
      }, AUTOSAVE_MS);
    },
  });

  // Flush any pending autosave when leaving the page / unmounting.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (pendingRef.current) {
        updateRef.current(pageIdRef.current, pendingRef.current);
        pendingRef.current = null;
      }
    };
  }, []);

  return (
    <div className="scroll-slim h-full overflow-y-auto">
      <div className="flex items-start gap-3 px-10 pt-7">
        <div className="min-w-0 flex-1">
          <input
            value={page.title}
            onChange={(e) => renamePage(page.id, e.target.value)}
            placeholder="Untitled page"
            aria-label="Page title"
            className="w-full bg-transparent font-serif text-3xl font-bold text-stone-800 placeholder-stone-400/70 outline-none dark:text-[#e9dfc8] dark:placeholder-stone-500"
          />
          <TagEditor page={page} />
        </div>
        <div className="mt-2 shrink-0">
          <ExportMenu />
        </div>
      </div>

      {editor && (
        <div className="sticky top-3 z-10 mt-2 flex justify-center px-10">
          <Toolbar editor={editor} />
        </div>
      )}

      <EditorContent editor={editor} className="px-10 pb-16 pt-4" />
    </div>
  );
}

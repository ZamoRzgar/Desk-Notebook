import { useMemo, useRef, useState } from 'react';
import { useApp } from '../store/AppContext';
import { searchBook } from '../lib/search';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** Renders a snippet, highlighting the «marked» match. */
function Snippet({ text }: { text: string }) {
  const parts = text.split(/«|»/);
  if (parts.length === 3) {
    return (
      <>
        {parts[0]}
        <mark className="rounded-sm bg-amber-200/70 px-0 text-inherit dark:bg-amber-500/40">
          {parts[1]}
        </mark>
        {parts[2]}
      </>
    );
  }
  return <>{text}</>;
}

/** Header search box with an instant results dropdown. */
export function SearchBox() {
  const { book, openPage } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchBook(book, query), [book, query]);
  const showPanel = open && query.trim().length >= 2;

  const jump = (sectionId: string, pageId: string) => {
    openPage(sectionId, pageId);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-stone-300/80 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur transition-colors focus-within:ring-2 focus-within:ring-amber-500/40 dark:border-stone-700 dark:bg-white/5">
        <span className="text-stone-400 dark:text-stone-500">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so a click on a result lands before the panel closes.
            window.setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setQuery('');
              setOpen(false);
              inputRef.current?.blur();
            }
            if (e.key === 'Enter' && results.length > 0) {
              jump(results[0].sectionId, results[0].pageId);
            }
          }}
          placeholder="Search notes…"
          aria-label="Search notes"
          className="w-40 bg-transparent text-sm text-stone-800 placeholder-stone-400 outline-none dark:text-stone-100"
        />
      </div>

      {showPanel && (
        <div className="page-in absolute right-0 top-full z-40 mt-2 w-96 max-w-[80vw] overflow-hidden rounded-xl bg-[#fdf8ee] shadow-2xl ring-1 ring-stone-900/10 dark:bg-[#2a2620] dark:ring-white/10">
          {results.length === 0 ? (
            <p className="px-4 py-5 text-center text-sm italic text-stone-400 dark:text-stone-500">
              No pages match “{query.trim()}”.
            </p>
          ) : (
            <ul className="scroll-slim max-h-80 overflow-y-auto py-1.5">
              {results.map((r) => (
                <li key={r.pageId}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => jump(r.sectionId, r.pageId)}
                    className="w-full px-4 py-2.5 text-left transition-colors hover:bg-stone-900/5 dark:hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: r.sectionColor }}
                      />
                      <span className="truncate font-serif text-sm font-bold text-stone-800 dark:text-[#e9dfc8]">
                        {r.pageTitle}
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500">
                        {r.sectionName}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate pl-4 text-xs text-stone-500 dark:text-stone-400">
                      <Snippet text={r.snippet} />
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

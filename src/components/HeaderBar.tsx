import { useApp } from '../store/AppContext';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
    </svg>
  );
}

const selectClass =
  'cursor-pointer rounded-lg border border-stone-300/80 bg-white/70 px-3 py-1.5 text-sm shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:border-stone-700 dark:bg-white/5 dark:hover:bg-white/10';

export function HeaderBar() {
  const { books, activeBookId, selectBook, allTags, tagFilter, setTagFilter, theme, toggleTheme } =
    useApp();

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4 sm:px-10">
      <div className="flex items-baseline gap-3">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-[#e9dfc8]">
          Folio
        </h1>
        <span className="hidden text-[11px] font-medium uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400 sm:inline">
          desk notebook
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <select
          className={selectClass}
          value={activeBookId}
          onChange={(e) => selectBook(e.target.value)}
          aria-label="Select book"
        >
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={tagFilter ?? ''}
          onChange={(e) => setTagFilter(e.target.value || null)}
          aria-label="Filter by tag"
        >
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              #{t}
            </option>
          ))}
        </select>

        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300/80 bg-white/70 text-stone-600 shadow-sm backdrop-blur transition-all hover:scale-105 hover:bg-white dark:border-stone-700 dark:bg-white/5 dark:text-amber-200/90 dark:hover:bg-white/10"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}

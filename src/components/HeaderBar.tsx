import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { SearchBox } from './SearchBox';
import { NameModal } from './NameModal';
import { ConfirmModal } from './ConfirmModal';

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

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

const selectClass =
  'cursor-pointer rounded-lg border border-stone-300/80 bg-white/70 px-3 py-1.5 text-sm shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:border-stone-700 dark:bg-white/5 dark:hover:bg-white/10';

const iconButtonClass =
  'flex h-7 w-7 items-center justify-center rounded-lg border border-stone-300/80 bg-white/70 text-stone-500 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-stone-700 dark:border-stone-700 dark:bg-white/5 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-200';

export function HeaderBar() {
  const {
    books,
    book,
    activeBookId,
    selectBook,
    createBook,
    renameBook,
    deleteBook,
    allTags,
    tagFilter,
    setTagFilter,
    theme,
    toggleTheme,
  } = useApp();

  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const bookCount = (b: typeof book) =>
    b.sections.reduce((n, s) => n + s.pages.length, 0);

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4 sm:px-10">
      <div className="flex items-baseline gap-3">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-[#e9dfc8]">
          Desk Notebook
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        <SearchBox />

        <div className="flex items-center gap-1">
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
          <button
            onClick={() => setRenameOpen(true)}
            title="Rename book"
            aria-label="Rename book"
            className={iconButtonClass}
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            title="New book"
            aria-label="New book"
            className={`${iconButtonClass} text-base leading-none`}
          >
            +
          </button>
          <button
            onClick={() => {
              setDeleteError('');
              setConfirmDelete(true);
            }}
            title="Delete book"
            aria-label="Delete book"
            className={`${iconButtonClass} hover:text-rose-600 dark:hover:text-rose-400`}
          >
            <TrashIcon />
          </button>
        </div>

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

      <NameModal
        open={createOpen}
        title="New book"
        placeholder="e.g. Semester 2"
        submitLabel="Create book"
        onSubmit={(name) => createBook(name)}
        onClose={() => setCreateOpen(false)}
      />
      <NameModal
        open={renameOpen}
        title="Rename book"
        initialValue={book.title}
        submitLabel="Save"
        onSubmit={(name) => renameBook(book.id, name)}
        onClose={() => setRenameOpen(false)}
      />
      <ConfirmModal
        open={confirmDelete}
        title={`Delete “${book.title}”?`}
        message={
          deleteError || (
            <>
              This removes the book with {book.sections.length}{' '}
              {book.sections.length === 1 ? 'section' : 'sections'} and {bookCount(book)}{' '}
              {bookCount(book) === 1 ? 'page' : 'pages'}. There is no undo.
            </>
          )
        }
        confirmLabel="Delete book"
        onConfirm={() => {
          if (deleteBook(book.id)) {
            setConfirmDelete(false);
          } else {
            setDeleteError('This is your last book — create another one before deleting it.');
          }
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </header>
  );
}

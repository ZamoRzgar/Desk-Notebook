import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/AppContext';

function PrinterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

/** Export dropdown: print (or Save-as-PDF) the current page or section. */
export function ExportMenu() {
  const { page, section, setPrintTarget } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const itemClass =
    'w-full rounded-lg px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-900/5 dark:text-stone-200 dark:hover:bg-white/8';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Export / print"
        aria-label="Export or print"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300/70 bg-white/70 text-stone-500 shadow-sm transition-all hover:bg-white hover:text-stone-700 dark:border-stone-600 dark:bg-white/5 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-200"
      >
        <PrinterIcon />
      </button>

      {open && (
        <div className="page-in absolute right-0 top-full z-30 mt-2 w-52 rounded-xl bg-[#fdf8ee] p-1.5 shadow-2xl ring-1 ring-stone-900/10 dark:bg-[#2a2620] dark:ring-white/10">
          <button
            className={itemClass}
            disabled={!page}
            onClick={() => {
              setPrintTarget({ kind: 'page' });
              setOpen(false);
            }}
          >
            This page
            <span className="block text-[11px] text-stone-400 dark:text-stone-500">
              Print or save as PDF
            </span>
          </button>
          <button
            className={itemClass}
            disabled={!section || section.pages.length === 0}
            onClick={() => {
              setPrintTarget({ kind: 'section' });
              setOpen(false);
            }}
          >
            Entire section
            <span className="block text-[11px] text-stone-400 dark:text-stone-500">
              {section?.pages.length ?? 0} {section?.pages.length === 1 ? 'page' : 'pages'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

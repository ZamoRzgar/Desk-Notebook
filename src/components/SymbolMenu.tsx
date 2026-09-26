import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';

const CATEGORIES: { label: string; symbols: string[] }[] = [
  {
    label: 'Operators',
    symbols: ['−', '×', '÷', '±', '⋅', '√', '∛', '∝', '∞', '∫', '∬', '∂', '∇', '∑', '∏'],
  },
  {
    label: 'Relations',
    symbols: ['=', '≠', '≈', '≤', '≥', '≡', '∼', '∈', '∉', '⊂', '⊆', '∪', '∩', '∅', '∀', '∃'],
  },
  {
    label: 'Greek α–ω',
    symbols: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'ρ', 'σ', 'τ', 'φ', 'χ', 'ψ', 'ω'],
  },
  {
    label: 'Greek Δ–Ω',
    symbols: ['Δ', 'Σ', 'Ω', 'Φ', 'Λ', 'Π', 'Θ'],
  },
  {
    label: 'Arrows',
    symbols: ['→', '←', '↔', '⇒', '⇐', '⇔', '↑', '↓', '↦'],
  },
  {
    label: 'Misc',
    symbols: ['°', '′', 'ⁿ', '¹', '²', '³', '₀', '₁', '₂', '½', '…'],
  },
];

/**
 * Math symbol inserter. The popover stays open after each insertion so
 * several symbols can be entered in a row; Escape or click-outside closes it.
 */
export function SymbolMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        editor.commands.focus();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, editor]);

  return (
    <div ref={ref} className="relative">
      <button
        onMouseDown={(e) => e.preventDefault() /* keep editor focus */}
        onClick={() => setOpen((o) => !o)}
        title="Insert math symbol"
        aria-label="Insert math symbol"
        aria-expanded={open}
        className={`flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 font-serif text-[15px] italic transition-colors duration-150 ${
          open
            ? 'bg-stone-800 text-[#fdf8ee] dark:bg-[#e9dfc8] dark:text-stone-900'
            : 'text-stone-600 hover:bg-stone-900/8 dark:text-stone-300 dark:hover:bg-white/10'
        }`}
      >
        ∫
      </button>

      {open && (
        <div className="page-in absolute left-0 top-full z-30 mt-2 w-[19rem] rounded-xl border border-stone-900/10 bg-[#fdf8ee]/95 p-2 shadow-xl backdrop-blur dark:border-white/10 dark:bg-[#1f1b16]/95">
          <div className="mb-1.5 flex flex-wrap gap-0.5 border-b border-stone-900/8 pb-1.5 dark:border-white/8">
            {CATEGORIES.map((c, i) => (
              <button
                key={c.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setTab(i)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  tab === i
                    ? 'bg-amber-600/15 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200'
                    : 'text-stone-500 hover:bg-stone-900/6 dark:text-stone-400 dark:hover:bg-white/8'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-8 gap-0.5">
            {CATEGORIES[tab].symbols.map((s) => (
              <button
                key={s}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().insertContent(s).run()}
                title={`Insert ${s}`}
                aria-label={`Insert ${s}`}
                className="flex h-8 items-center justify-center rounded-md font-serif text-[17px] text-stone-700 transition-colors hover:bg-amber-600/15 hover:text-amber-900 dark:text-stone-200 dark:hover:bg-amber-400/15 dark:hover:text-amber-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

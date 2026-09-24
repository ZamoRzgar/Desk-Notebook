import { useState } from 'react';
import { SECTION_COLORS } from '../types';
import { useApp } from '../store/AppContext';

interface NewSectionModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewSectionModal({ open, onClose }: NewSectionModalProps) {
  const { createSection } = useApp();
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(SECTION_COLORS[4]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    createSection(name, color);
    setName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="page-in w-full max-w-sm rounded-2xl bg-[#fdf8ee] p-6 shadow-2xl ring-1 ring-stone-900/10 dark:bg-[#2a2620] dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-xl font-bold text-stone-800 dark:text-[#e9dfc8]">
          New section
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          A class, a project, a chapter — it gets its own tab.
        </p>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="e.g. Chemistry"
          className="mt-4 w-full rounded-lg border border-stone-300 bg-white/80 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:border-stone-600 dark:bg-white/5 dark:text-stone-100"
        />

        <div className="mt-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Tab color
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTION_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Choose color ${c}`}
                style={{ backgroundColor: c }}
                className={`h-8 w-8 rounded-full shadow-sm transition-transform hover:scale-110 ${
                  color === c ? 'ring-2 ring-stone-800 ring-offset-2 ring-offset-[#fdf8ee] dark:ring-stone-100 dark:ring-offset-[#2a2620]' : ''
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-500/10 dark:text-stone-300"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="rounded-lg bg-stone-800 px-3.5 py-2 text-sm font-medium text-[#fdf8ee] shadow-sm transition-colors hover:bg-stone-700 disabled:opacity-40 dark:bg-[#e9dfc8] dark:text-stone-900 dark:hover:bg-white"
          >
            Create section
          </button>
        </div>
      </div>
    </div>
  );
}

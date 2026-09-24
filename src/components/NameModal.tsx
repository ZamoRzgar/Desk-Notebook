import { useEffect, useState } from 'react';

interface NameModalProps {
  open: boolean;
  title: string;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

/** Small single-field dialog used for creating/renaming books. */
export function NameModal({
  open,
  title,
  initialValue = '',
  placeholder = '',
  submitLabel = 'Save',
  onSubmit,
  onClose,
}: NameModalProps) {
  const [name, setName] = useState(initialValue);

  useEffect(() => {
    if (open) setName(initialValue);
  }, [open, initialValue]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
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
        <h2 className="font-serif text-xl font-bold text-stone-800 dark:text-[#e9dfc8]">{title}</h2>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') onClose();
          }}
          placeholder={placeholder}
          className="mt-4 w-full rounded-lg border border-stone-300 bg-white/80 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:border-stone-600 dark:bg-white/5 dark:text-stone-100"
        />

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
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

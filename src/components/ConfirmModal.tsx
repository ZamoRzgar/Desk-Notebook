import type { ReactNode } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="page-in w-full max-w-sm rounded-2xl bg-[#fdf8ee] p-6 shadow-2xl ring-1 ring-stone-900/10 dark:bg-[#2a2620] dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-xl font-bold text-stone-800 dark:text-[#e9dfc8]">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{message}</p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            autoFocus
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-500/10 dark:text-stone-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-rose-700 px-3.5 py-2 text-sm font-medium text-rose-50 shadow-sm transition-colors hover:bg-rose-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

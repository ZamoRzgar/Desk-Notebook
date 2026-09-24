interface TagChipProps {
  tag: string;
  onRemove?: () => void;
  size?: 'sm' | 'xs';
}

export function TagChip({ tag, onRemove, size = 'sm' }: TagChipProps) {
  const sizing = size === 'xs' ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-stone-500/10 font-medium text-stone-600 ring-1 ring-inset ring-stone-400/25 dark:bg-stone-300/10 dark:text-stone-300 dark:ring-stone-500/25 ${sizing}`}
    >
      #{tag}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove tag ${tag}`}
          className="-mr-0.5 rounded-full px-0.5 text-stone-400 transition-colors hover:text-stone-700 dark:hover:text-stone-100"
        >
          ×
        </button>
      )}
    </span>
  );
}

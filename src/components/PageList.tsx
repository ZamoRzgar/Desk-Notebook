import { useApp } from '../store/AppContext';
import { TagChip } from './TagChip';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Left page of the open book: the table of contents for the active section. */
export function PageList() {
  const { section, activePageId, selectPage, createPage, tagFilter } = useApp();

  if (!section) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-stone-500 dark:text-stone-400">
        Pick a section tab to browse its pages.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-stone-900/10 px-5 pb-3 pt-6 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: section.color }}
          />
          <h2 className="font-serif text-lg font-bold italic text-stone-700 dark:text-[#dccfae]">
            {section.name}
          </h2>
        </div>
        <p className="mt-0.5 pl-[18px] text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {section.pages.length} {section.pages.length === 1 ? 'page' : 'pages'}
        </p>
      </div>

      <ul className="scroll-slim flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {section.pages.map((p) => {
          const active = p.id === activePageId;
          const dimmed = tagFilter !== null && !p.tags.includes(tagFilter);
          return (
            <li key={p.id} className={dimmed ? 'opacity-30 transition-opacity duration-200' : 'transition-opacity duration-200'}>
              <button
                onClick={() => selectPage(p.id)}
                className={`w-full rounded-lg px-3 py-2.5 text-left transition-all duration-150 ${
                  active
                    ? 'bg-amber-900/8 shadow-[inset_0_0_0_1px_rgba(120,85,40,0.25)] dark:bg-amber-100/8 dark:shadow-[inset_0_0_0_1px_rgba(233,216,182,0.2)]'
                    : 'hover:bg-stone-900/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`truncate font-serif text-[15px] ${
                      active
                        ? 'font-bold text-stone-800 dark:text-[#e9dfc8]'
                        : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {p.title || 'Untitled page'}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-stone-400 dark:text-stone-500">
                    {formatDate(p.updatedAt)}
                  </span>
                </div>
                {p.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <TagChip key={t} tag={t} size="xs" />
                    ))}
                  </div>
                )}
              </button>
            </li>
          );
        })}

        {section.pages.length === 0 && (
          <li className="px-3 py-6 text-center text-sm italic text-stone-400 dark:text-stone-500">
            This section is blank so far.
          </li>
        )}
      </ul>

      <div className="border-t border-stone-900/10 p-3 dark:border-white/10">
        <button
          onClick={createPage}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-stone-400/60 px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:border-stone-500 hover:bg-stone-900/5 hover:text-stone-700 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
        >
          <span className="text-base leading-none">+</span> New page
        </button>
      </div>
    </div>
  );
}

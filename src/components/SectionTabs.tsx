import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { NewSectionModal } from './NewSectionModal';

/**
 * Binder divider tabs sticking out from the right edge of the book.
 * The active tab is wider and fully saturated so it reads as "connected"
 * to the open page; inactive tabs recede slightly.
 */
export function SectionTabs() {
  const { book, activeSectionId, selectSection } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="absolute -right-2 top-14 z-20 flex translate-x-full flex-col items-end gap-1.5">
        {book.sections.map((s) => {
          const active = s.id === activeSectionId;
          return (
            <button
              key={s.id}
              onClick={() => selectSection(s.id)}
              title={s.name}
              style={{ backgroundColor: s.color }}
              className={`flex h-11 items-center rounded-r-lg pl-3 pr-2 text-left text-[13px] font-semibold tracking-wide text-white shadow-md transition-all duration-200 ease-out dark:brightness-[0.82] ${
                active
                  ? 'w-32 shadow-lg brightness-105'
                  : 'w-[4.5rem] opacity-80 saturate-[0.75] hover:w-28 hover:opacity-100 hover:saturate-100'
              }`}
            >
              <span className="truncate drop-shadow-sm">{s.name}</span>
            </button>
          );
        })}

        <button
          onClick={() => setModalOpen(true)}
          title="New section"
          aria-label="New section"
          className="mt-1 flex h-10 w-14 items-center justify-center rounded-r-lg border-2 border-l-0 border-dashed border-stone-400/70 bg-stone-100/60 text-lg text-stone-500 shadow-sm backdrop-blur transition-all duration-200 hover:w-16 hover:border-stone-500 hover:text-stone-700 dark:border-stone-600 dark:bg-stone-800/60 dark:text-stone-400 dark:hover:text-stone-200"
        >
          +
        </button>
      </div>

      <NewSectionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

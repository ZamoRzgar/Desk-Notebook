import { useApp } from '../store/AppContext';
import { SectionTabs } from './SectionTabs';
import { PageList } from './PageList';
import { PageEditor } from './PageEditor';

/**
 * The open-book shell: a leather-ish cover, a left "table of contents" page,
 * the active page on the right, and section tabs sticking out the right edge.
 */
export function BookView() {
  const { book, section, page, createPage } = useApp();

  return (
    <main className="flex min-h-0 flex-1 items-stretch justify-center px-6 pb-8 pt-1 sm:pl-12 sm:pr-44">
      <div className="relative w-full max-w-6xl">
        <SectionTabs />

        {/* cover — slightly larger than the pages, like a real book cover */}
        <div className="h-full rounded-2xl bg-gradient-to-br from-[#7d573b] via-[#6b4a32] to-[#59391f] p-[10px] shadow-[0_35px_70px_-18px_rgba(43,28,12,0.55)] dark:from-[#2a211a] dark:via-[#221b15] dark:to-[#191310] dark:shadow-[0_35px_70px_-18px_rgba(0,0,0,0.8)]">
          {/* page block */}
          <div
            key={section?.id ?? 'none'}
            className="page-in flex h-full overflow-hidden rounded-xl ring-1 ring-stone-900/10 dark:ring-black/40"
          >
            {/* left page — table of contents */}
            <aside className="paper-left w-72 shrink-0 border-r border-[#e2d5b8] shadow-[inset_-28px_0_28px_-28px_rgba(90,64,30,0.45)] dark:border-[#3b332a] dark:shadow-[inset_-28px_0_28px_-28px_rgba(0,0,0,0.7)]">
              <PageList />
            </aside>

            {/* right page — active note */}
            <section className="paper relative flex-1 shadow-[inset_28px_0_28px_-28px_rgba(90,64,30,0.45),inset_-22px_0_26px_-24px_rgba(90,64,30,0.35)] dark:shadow-[inset_28px_0_28px_-28px_rgba(0,0,0,0.7),inset_-22px_0_26px_-24px_rgba(0,0,0,0.5)]">
              {page ? (
                <PageEditor key={page.id} page={page} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
                  <p className="font-serif text-xl italic text-stone-400 dark:text-stone-500">
                    A fresh page is waiting for ink.
                  </p>
                  <button
                    onClick={createPage}
                    className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-[#fdf8ee] shadow-sm transition-colors hover:bg-stone-700 dark:bg-[#e9dfc8] dark:text-stone-900 dark:hover:bg-white"
                  >
                    Write the first page of {section?.name ?? book.title}
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

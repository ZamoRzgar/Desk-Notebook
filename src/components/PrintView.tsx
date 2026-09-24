import { useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { renderContentToHtml } from '../lib/renderHtml';

/**
 * Print-only document. Hidden on screen; when a print target is set, it
 * renders the page/section as a clean document, invokes window.print()
 * (which offers Save-as-PDF in both browser and Electron), then clears itself.
 */
export function PrintView() {
  const { printTarget, setPrintTarget, book, section, page } = useApp();

  useEffect(() => {
    if (!printTarget) return;
    const frame = requestAnimationFrame(() => {
      window.print();
      setPrintTarget(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [printTarget, setPrintTarget]);

  if (!printTarget) return null;

  const pages =
    printTarget.kind === 'section' ? (section?.pages ?? []) : page ? [page] : [];

  if (pages.length === 0) return null;

  return (
    <div className="print-root">
      <header className="print-doc-header">
        <p className="print-eyebrow">
          {book.title}
          {section ? ` · ${section.name}` : ''}
        </p>
        {printTarget.kind === 'section' && section ? (
          <h1 className="print-doc-title">{section.name}</h1>
        ) : null}
      </header>

      {pages.map((p) => (
        <article key={p.id} className="print-page">
          <h1 className={printTarget.kind === 'section' ? 'print-page-title' : 'print-doc-title'}>
            {p.title || 'Untitled page'}
          </h1>
          {p.tags.length > 0 && (
            <p className="print-tags">{p.tags.map((t) => `#${t}`).join('  ')}</p>
          )}
          <div
            className="print-content tiptap"
            dangerouslySetInnerHTML={{ __html: renderContentToHtml(p.content) }}
          />
        </article>
      ))}
    </div>
  );
}

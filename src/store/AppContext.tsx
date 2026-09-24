import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { JSONContent } from '@tiptap/core';
import type { Book, Page, PersistedData, Section } from '../types';
import { createStorage, type StorageBackend } from './storage';
import { buildSeedData } from './seed';

type Theme = 'light' | 'dark';

export type PrintTarget = { kind: 'page' } | { kind: 'section' };

interface AppContextValue {
  ready: boolean;
  books: Book[];
  book: Book;
  section: Section | null;
  page: Page | null;
  activeBookId: string;
  activeSectionId: string | null;
  activePageId: string | null;
  tagFilter: string | null;
  allTags: string[];
  theme: Theme;
  printTarget: PrintTarget | null;
  selectBook(id: string): void;
  selectSection(id: string): void;
  selectPage(id: string): void;
  /** Jump straight to a section + page (used by search results). */
  openPage(sectionId: string, pageId: string): void;
  createSection(name: string, color: string): void;
  renameSection(sectionId: string, name: string, color: string): void;
  deleteSection(sectionId: string): void;
  createPage(): void;
  deletePage(pageId: string): void;
  updatePageContent(pageId: string, content: JSONContent): void;
  renamePage(pageId: string, title: string): void;
  addTag(pageId: string, tag: string): void;
  removeTag(pageId: string, tag: string): void;
  createBook(title: string): void;
  renameBook(bookId: string, title: string): void;
  /** Returns false when the book cannot be deleted (last remaining book). */
  deleteBook(bookId: string): boolean;
  setTagFilter(tag: string | null): void;
  setPrintTarget(target: PrintTarget | null): void;
  toggleTheme(): void;
}

const AppContext = createContext<AppContextValue | null>(null);

const storage: StorageBackend = createStorage();

const THEME_KEY = 'desk-notebook:theme';
const LEGACY_THEME_KEY = 'folio-notes:theme';

function mapBook(data: PersistedData, bookId: string, fn: (b: Book) => Book): PersistedData {
  return { ...data, books: data.books.map((b) => (b.id === bookId ? fn(b) : b)) };
}

function mapSection(book: Book, sectionId: string, fn: (s: Section) => Section): Book {
  return { ...book, sections: book.sections.map((s) => (s.id === sectionId ? fn(s) : s)) };
}

function mapPage(section: Section, pageId: string, fn: (p: Page) => Page): Section {
  return { ...section, pages: section.pages.map((p) => (p.id === pageId ? fn(p) : p)) };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PersistedData | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [printTarget, setPrintTarget] = useState<PrintTarget | null>(null);
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

  // Load persisted data (SQLite via IPC in Electron, localStorage in the
  // browser); seed sample content on first run.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let loaded = await storage.read();
      if (!loaded) {
        loaded = buildSeedData();
        void storage.write(loaded);
      }
      if (cancelled) return;
      setData(loaded);
      const firstBook = loaded.books[0];
      setActiveBookId(firstBook.id);
      setActiveSectionId(firstBook.sections[0]?.id ?? null);
      setActivePageId(firstBook.sections[0]?.pages[0]?.id ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced write-through persistence.
  useEffect(() => {
    if (!data) return;
    const t = window.setTimeout(() => void storage.write(data), 250);
    return () => window.clearTimeout(t);
  }, [data]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
      localStorage.removeItem(LEGACY_THEME_KEY);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const book =
    data?.books.find((b) => b.id === activeBookId) ?? data?.books[0] ?? null;
  const section = book?.sections.find((s) => s.id === activeSectionId) ?? book?.sections[0] ?? null;
  const page = section?.pages.find((p) => p.id === activePageId) ?? section?.pages[0] ?? null;

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const b of data?.books ?? [])
      for (const s of b.sections) for (const p of s.pages) for (const t of p.tags) tags.add(t);
    return [...tags].sort((a, b) => a.localeCompare(b));
  }, [data]);

  const selectBook = useCallback(
    (id: string) => {
      const target = data?.books.find((b) => b.id === id);
      if (!target) return;
      setActiveBookId(id);
      setActiveSectionId(target.sections[0]?.id ?? null);
      setActivePageId(target.sections[0]?.pages[0]?.id ?? null);
    },
    [data],
  );

  const selectSection = useCallback(
    (id: string) => {
      setActiveSectionId(id);
      const target = book?.sections.find((s) => s.id === id);
      setActivePageId(target?.pages[0]?.id ?? null);
    },
    [book],
  );

  const selectPage = useCallback((id: string) => setActivePageId(id), []);

  const openPage = useCallback((sectionId: string, pageId: string) => {
    setActiveSectionId(sectionId);
    setActivePageId(pageId);
  }, []);

  const createSection = useCallback(
    (name: string, color: string) => {
      const trimmed = name.trim();
      if (!trimmed || !book) return;
      const id = crypto.randomUUID();
      setData((prev) =>
        prev
          ? mapBook(prev, book.id, (b) => ({
              ...b,
              sections: [...b.sections, { id, name: trimmed, color, pages: [] }],
            }))
          : prev,
      );
      setActiveSectionId(id);
      setActivePageId(null);
    },
    [book],
  );

  const renameSection = useCallback(
    (sectionId: string, name: string, color: string) => {
      const trimmed = name.trim();
      if (!trimmed || !book) return;
      setData((prev) =>
        prev
          ? mapBook(prev, book.id, (b) =>
              mapSection(b, sectionId, (s) => ({ ...s, name: trimmed, color })),
            )
          : prev,
      );
    },
    [book],
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      if (!book) return;
      setData((prev) =>
        prev
          ? mapBook(prev, book.id, (b) => ({
              ...b,
              sections: b.sections.filter((s) => s.id !== sectionId),
            }))
          : prev,
      );
      if (sectionId === section?.id) {
        const remaining = book.sections.filter((s) => s.id !== sectionId);
        setActiveSectionId(remaining[0]?.id ?? null);
        setActivePageId(remaining[0]?.pages[0]?.id ?? null);
      }
    },
    [book, section],
  );

  const createPage = useCallback(() => {
    if (!book || !section) return;
    const id = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const newPage: Page = {
      id,
      title: 'Untitled page',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      tags: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setData((prev) =>
      prev
        ? mapBook(prev, book.id, (b) =>
            mapSection(b, section.id, (s) => ({ ...s, pages: [...s.pages, newPage] })),
          )
        : prev,
    );
    setActivePageId(id);
  }, [book, section]);

  const deletePage = useCallback(
    (pageId: string) => {
      if (!book) return;
      setData((prev) =>
        prev
          ? mapBook(prev, book.id, (b) => ({
              ...b,
              sections: b.sections.map((s) =>
                s.pages.some((p) => p.id === pageId)
                  ? { ...s, pages: s.pages.filter((p) => p.id !== pageId) }
                  : s,
              ),
            }))
          : prev,
      );
      if (pageId === page?.id && section) {
        const remaining = section.pages.filter((p) => p.id !== pageId);
        setActivePageId(remaining[0]?.id ?? null);
      }
    },
    [book, section, page],
  );

  const updatePageInActiveBook = useCallback(
    (pageId: string, fn: (p: Page) => Page) => {
      if (!book) return;
      setData((prev) =>
        prev
          ? mapBook(prev, book.id, (b) => ({
              ...b,
              sections: b.sections.map((s) =>
                s.pages.some((p) => p.id === pageId) ? mapPage(s, pageId, fn) : s,
              ),
            }))
          : prev,
      );
    },
    [book],
  );

  const updatePageContent = useCallback(
    (pageId: string, content: JSONContent) => {
      updatePageInActiveBook(pageId, (p) => ({
        ...p,
        content,
        updatedAt: new Date().toISOString(),
      }));
    },
    [updatePageInActiveBook],
  );

  const renamePage = useCallback(
    (pageId: string, title: string) => {
      updatePageInActiveBook(pageId, (p) => ({ ...p, title }));
    },
    [updatePageInActiveBook],
  );

  const addTag = useCallback(
    (pageId: string, tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (!trimmed) return;
      updatePageInActiveBook(pageId, (p) =>
        p.tags.includes(trimmed) ? p : { ...p, tags: [...p.tags, trimmed] },
      );
    },
    [updatePageInActiveBook],
  );

  const removeTag = useCallback(
    (pageId: string, tag: string) => {
      updatePageInActiveBook(pageId, (p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
    },
    [updatePageInActiveBook],
  );

  const createBook = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    const newBook: Book = { id, title: trimmed, sections: [] };
    setData((prev) => (prev ? { ...prev, books: [...prev.books, newBook] } : prev));
    setActiveBookId(id);
    setActiveSectionId(null);
    setActivePageId(null);
  }, []);

  const renameBook = useCallback((bookId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setData((prev) =>
      prev ? mapBook(prev, bookId, (b) => ({ ...b, title: trimmed })) : prev,
    );
  }, []);

  const deleteBook = useCallback(
    (bookId: string): boolean => {
      if (!data || data.books.length <= 1) return false;
      const remaining = data.books.filter((b) => b.id !== bookId);
      setData({ ...data, books: remaining });
      if (bookId === book?.id) {
        const next = remaining[0];
        setActiveBookId(next.id);
        setActiveSectionId(next.sections[0]?.id ?? null);
        setActivePageId(next.sections[0]?.pages[0]?.id ?? null);
      }
      return true;
    },
    [data, book],
  );

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  );

  if (!data || !book) {
    return (
      <div className="desk-bg flex h-screen items-center justify-center">
        <p className="font-serif text-xl italic text-stone-500 dark:text-stone-400">
          Opening your notebook…
        </p>
      </div>
    );
  }

  const value: AppContextValue = {
    ready: true,
    books: data.books,
    book,
    section,
    page,
    activeBookId: book.id,
    activeSectionId: section?.id ?? null,
    activePageId: page?.id ?? null,
    tagFilter,
    allTags,
    theme,
    printTarget,
    selectBook,
    selectSection,
    selectPage,
    openPage,
    createSection,
    renameSection,
    deleteSection,
    createPage,
    deletePage,
    updatePageContent,
    renamePage,
    addTag,
    removeTag,
    createBook,
    renameBook,
    deleteBook,
    setTagFilter,
    setPrintTarget,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

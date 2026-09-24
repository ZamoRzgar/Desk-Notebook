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

interface AppContextValue {
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
  selectBook(id: string): void;
  selectSection(id: string): void;
  selectPage(id: string): void;
  createSection(name: string, color: string): void;
  createPage(): void;
  updatePageContent(pageId: string, content: JSONContent): void;
  renamePage(pageId: string, title: string): void;
  addTag(pageId: string, tag: string): void;
  removeTag(pageId: string, tag: string): void;
  setTagFilter(tag: string | null): void;
  toggleTheme(): void;
}

const AppContext = createContext<AppContextValue | null>(null);

const storage: StorageBackend = createStorage();

function loadInitialData(): PersistedData {
  const existing = storage.read();
  if (existing && existing.books.length > 0) return existing;
  const seeded = buildSeedData();
  storage.write(seeded);
  return seeded;
}

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
  const [data, setData] = useState<PersistedData>(loadInitialData);
  const [activeBookId, setActiveBookId] = useState(() => data.books[0].id);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    () => data.books[0].sections[0]?.id ?? null,
  );
  const [activePageId, setActivePageId] = useState<string | null>(
    () => data.books[0].sections[0]?.pages[0]?.id ?? null,
  );
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

  // Debounced write-through persistence.
  useEffect(() => {
    const t = window.setTimeout(() => storage.write(data), 250);
    return () => window.clearTimeout(t);
  }, [data]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('folio-notes:theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const book = data.books.find((b) => b.id === activeBookId) ?? data.books[0];
  const section = book.sections.find((s) => s.id === activeSectionId) ?? book.sections[0] ?? null;
  const page =
    section?.pages.find((p) => p.id === activePageId) ?? section?.pages[0] ?? null;

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const b of data.books)
      for (const s of b.sections) for (const p of s.pages) for (const t of p.tags) tags.add(t);
    return [...tags].sort((a, b) => a.localeCompare(b));
  }, [data]);

  const selectBook = useCallback(
    (id: string) => {
      const target = data.books.find((b) => b.id === id);
      if (!target) return;
      setActiveBookId(id);
      setActiveSectionId(target.sections[0]?.id ?? null);
      setActivePageId(target.sections[0]?.pages[0]?.id ?? null);
    },
    [data.books],
  );

  const selectSection = useCallback(
    (id: string) => {
      setActiveSectionId(id);
      const target = book.sections.find((s) => s.id === id);
      setActivePageId(target?.pages[0]?.id ?? null);
    },
    [book.sections],
  );

  const selectPage = useCallback((id: string) => setActivePageId(id), []);

  const createSection = useCallback(
    (name: string, color: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const id = crypto.randomUUID();
      setData((prev) =>
        mapBook(prev, activeBookId, (b) => ({
          ...b,
          sections: [...b.sections, { id, name: trimmed, color, pages: [] }],
        })),
      );
      setActiveSectionId(id);
      setActivePageId(null);
    },
    [activeBookId],
  );

  const createPage = useCallback(() => {
    if (!section) return;
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
      mapBook(prev, activeBookId, (b) =>
        mapSection(b, section.id, (s) => ({ ...s, pages: [...s.pages, newPage] })),
      ),
    );
    setActivePageId(id);
  }, [activeBookId, section]);

  const updatePageInActiveBook = useCallback(
    (pageId: string, fn: (p: Page) => Page) => {
      setData((prev) =>
        mapBook(prev, activeBookId, (b) => ({
          ...b,
          sections: b.sections.map((s) =>
            s.pages.some((p) => p.id === pageId) ? mapPage(s, pageId, fn) : s,
          ),
        })),
      );
    },
    [activeBookId],
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

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  );

  const value: AppContextValue = {
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
    selectBook,
    selectSection,
    selectPage,
    createSection,
    createPage,
    updatePageContent,
    renamePage,
    addTag,
    removeTag,
    setTagFilter,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

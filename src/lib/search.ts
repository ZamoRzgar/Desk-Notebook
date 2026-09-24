import type { JSONContent } from '@tiptap/core';
import type { Book } from '../types';

/** Flatten TipTap JSON content to plain text for searching/printing. */
export function extractText(content: JSONContent): string {
  let out = '';
  const walk = (node: JSONContent) => {
    if (node.type === 'text' && node.text) out += node.text + ' ';
    if (node.type === 'hardBreak') out += ' ';
    for (const child of node.content ?? []) walk(child);
  };
  walk(content);
  return out.replace(/\s+/g, ' ').trim();
}

export interface SearchResult {
  sectionId: string;
  sectionName: string;
  sectionColor: string;
  pageId: string;
  pageTitle: string;
  /** ~90 chars of context around the first match, with «guillemets» marking it. */
  snippet: string;
}

function makeSnippet(haystack: string, query: string): string {
  const lower = haystack.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return haystack.slice(0, 90).trim();
  const start = Math.max(0, idx - 35);
  const end = Math.min(haystack.length, idx + query.length + 55);
  const prefix = (start > 0 ? '…' : '') + haystack.slice(start, idx);
  const match = haystack.slice(idx, idx + query.length);
  const suffix = haystack.slice(idx + query.length, end) + (end < haystack.length ? '…' : '');
  return `${prefix}«${match}»${suffix}`;
}

/** Instant in-memory full-text search across all pages of a book. */
export function searchBook(book: Book, query: string, limit = 8): SearchResult[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const results: SearchResult[] = [];

  for (const section of book.sections) {
    for (const page of section.pages) {
      const haystack = `${page.title}\n${extractText(page.content)}`;
      if (haystack.toLowerCase().includes(q.toLowerCase())) {
        results.push({
          sectionId: section.id,
          sectionName: section.name,
          sectionColor: section.color,
          pageId: page.id,
          pageTitle: page.title || 'Untitled page',
          snippet: makeSnippet(haystack.replace(/\n/g, ' — '), q),
        });
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}

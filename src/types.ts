import type { JSONContent } from '@tiptap/core';

export interface Page {
  id: string;
  title: string;
  content: JSONContent;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  name: string;
  /** Hex color used for the binder tab and accents. */
  color: string;
  pages: Page[];
}

export interface Book {
  id: string;
  title: string;
  sections: Section[];
}

export interface PersistedData {
  version: 1;
  books: Book[];
}

export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fde68a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Blue', value: '#bfdbfe' },
] as const;

export const SECTION_COLORS = [
  '#f59e0b', // amber
  '#0ea5e9', // sky
  '#f43f5e', // rose
  '#22c55e', // green
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
] as const;

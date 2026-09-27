import type { JSONContent } from '@tiptap/core';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMark(text: string, mark: NonNullable<JSONContent['marks']>[number]): string {
  switch (mark.type) {
    case 'bold':
      return `<strong>${text}</strong>`;
    case 'italic':
      return `<em>${text}</em>`;
    case 'strike':
      return `<s>${text}</s>`;
    case 'code':
      return `<code>${text}</code>`;
    case 'highlight': {
      const color = (mark.attrs?.color as string | undefined) ?? '#fde68a';
      return `<mark style="background-color: ${escapeHtml(color)}">${text}</mark>`;
    }
    default:
      return text;
  }
}

function renderNode(node: JSONContent): string {
  const children = (node.content ?? []).map(renderNode).join('');

  switch (node.type) {
    case 'text': {
      let out = escapeHtml(node.text ?? '');
      for (const mark of node.marks ?? []) out = renderMark(out, mark);
      return out;
    }
    case 'paragraph':
      return `<p>${children || '<br>'}</p>`;
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 2), 1), 4);
      return `<h${level}>${children}</h${level}>`;
    }
    case 'bulletList':
      return `<ul>${children}</ul>`;
    case 'orderedList':
      return `<ol>${children}</ol>`;
    case 'listItem':
      return `<li>${children}</li>`;
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`;
    case 'horizontalRule':
      return '<hr>';
    case 'hardBreak':
      return '<br>';
    case 'codeBlock':
      return `<pre><code>${children}</code></pre>`;
    case 'table':
      return `<table><tbody>${children}</tbody></table>`;
    case 'tableRow':
      return `<tr>${children}</tr>`;
    case 'tableHeader':
      return `<th>${children}</th>`;
    case 'tableCell':
      return `<td>${children}</td>`;
    default:
      return children;
  }
}

/** Render TipTap JSON to a small, self-contained HTML fragment (for printing). */
export function renderContentToHtml(doc: JSONContent): string {
  return (doc.content ?? []).map(renderNode).join('\n');
}

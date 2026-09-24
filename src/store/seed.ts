import type { JSONContent } from '@tiptap/core';
import type { Book, Page, PersistedData, Section } from '../types';

type Inline = JSONContent;

const text = (t: string): Inline => ({ type: 'text', text: t });

const hl = (t: string, color: string): Inline => ({
  type: 'text',
  text: t,
  marks: [{ type: 'highlight', attrs: { color } }],
});

const bold = (t: string): Inline => ({ type: 'text', text: t, marks: [{ type: 'bold' }] });
const italic = (t: string): Inline => ({ type: 'text', text: t, marks: [{ type: 'italic' }] });

const p = (...inlines: Inline[]): JSONContent => ({ type: 'paragraph', content: inlines });
const h2 = (t: string): JSONContent => ({
  type: 'heading',
  attrs: { level: 2 },
  content: [text(t)],
});
const bullet = (items: Inline[][]): JSONContent => ({
  type: 'bulletList',
  content: items.map((inlines) => ({
    type: 'listItem',
    content: [p(...inlines)],
  })),
});
const numbered = (items: Inline[][]): JSONContent => ({
  type: 'orderedList',
  attrs: { start: 1 },
  content: items.map((inlines) => ({
    type: 'listItem',
    content: [p(...inlines)],
  })),
});

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function page(title: string, tags: string[], content: JSONContent[]): Page {
  return {
    id: uid(),
    title,
    tags,
    content: { type: 'doc', content },
    createdAt: now(),
    updatedAt: now(),
  };
}

function section(name: string, color: string, pages: Page[]): Section {
  return { id: uid(), name, color, pages };
}

const YELLOW = '#fde68a';
const GREEN = '#bbf7d0';
const PINK = '#fbcfe8';
const BLUE = '#bfdbfe';

export function buildSeedData(): PersistedData {
  const math = section('Math', '#f59e0b', [
    page('The Chain Rule', ['calculus', 'exam-prep'], [
      h2('Definition'),
      p(
        text('If a function is composed as '),
        italic('y = f(g(x))'),
        text(', then its derivative is '),
        hl('y′ = f′(g(x)) · g′(x)', YELLOW),
        text(' — differentiate the outer function, keep the inner one, then multiply by the derivative of the inside.'),
      ),
      h2('Worked examples'),
      bullet([
        [bold('y = (3x² + 1)⁵'), text(' → y′ = 5(3x² + 1)⁴ · 6x = '), hl('30x(3x² + 1)⁴', YELLOW)],
        [bold('y = sin(x²)'), text(' → y′ = cos(x²) · 2x')],
        [bold('y = e^(4x)'), text(' → y′ = 4e^(4x)')],
      ]),
      p(
        text('Exam tip: most mistakes come from forgetting the inner derivative. '),
        hl('Always ask: “what is the inside function?”', GREEN),
      ),
    ]),
    page('Integration by Parts', ['calculus', 'exam-prep'], [
      h2('The formula'),
      p(text('From the product rule for derivatives: '), hl('∫ u dv = u·v − ∫ v du', GREEN), text('.')),
      h2('Choosing u (LIATE)'),
      numbered([
        [bold('L'), text('ogarithmic — ln x')],
        [bold('I'), text('nverse trig — arctan x')],
        [bold('A'), text('lgebraic — x, x²')],
        [bold('T'), text('rigonometric — sin x, cos x')],
        [bold('E'), text('xponential — eˣ')],
      ]),
      p(
        text('Pick '),
        italic('u'),
        text(' from whichever appears highest on the list. '),
        hl('∫ x·eˣ dx = x·eˣ − eˣ + C', YELLOW),
        text(' is the classic warm-up.'),
      ),
    ]),
  ]);

  const physics = section('Physics', '#0ea5e9', [
    page("Newton's Laws of Motion", ['mechanics', 'fundamentals'], [
      h2('The three laws'),
      numbered([
        [text('A body at rest stays at rest, and a body in motion stays in motion at constant velocity, unless acted on by a net external force ('), italic('inertia'), text(').')],
        [hl('F = m·a', BLUE), text(' — net force equals mass times acceleration. The big one.')],
        [text('For every action there is an equal and opposite reaction. Forces always come in pairs acting on '), italic('different'), text(' bodies.')],
      ]),
      h2('Notes for the problem set'),
      bullet([
        [text('Draw a free-body diagram '), bold('before'), text(' writing any equations.')],
        [text('Action–reaction pairs never cancel: they act on different objects.')],
        [hl('Weight is a force (N), mass is not (kg).', BLUE)],
      ]),
    ]),
  ]);

  const literature = section('Literature', '#f43f5e', [
    page('Hamlet — Act III Soliloquy', ['shakespeare', 'essay-draft'], [
      h2('“To be, or not to be” (III.i)'),
      p(
        text('The soliloquy is not simply about suicide — it weighs '),
        hl('action against passive endurance', PINK),
        text('. Hamlet frames death as “sleep”, then complicates it with the “dreams” that may come.'),
      ),
      h2('Essay angles'),
      bullet([
        [text('The shift from personal “I” to universal “we” — the speech becomes about the human condition.')],
        [hl('“Conscience does make cowards of us all”', PINK), text(' — thought itself paralyses action.')],
        [text('Contrast with the Fortinbras foil in IV.iv for the paragraph on decisive action.')],
      ]),
      p(text('Remember to quote with act.scene.line numbers and to address the meter: the first line has eleven syllables — a weak ending that mirrors hesitation.')),
    ]),
  ]);

  const history = section('History', '#22c55e', [
    page('French Revolution — Key Dates', ['europe', 'timeline'], [
      h2('Timeline'),
      bullet([
        [bold('May 1789'), text(' — Estates-General convenes at Versailles; Third Estate forms the National Assembly.')],
        [bold('14 July 1789'), text(' — '), hl('storming of the Bastille', GREEN), text(', the symbolic start of the revolution.')],
        [bold('Aug 1789'), text(' — Declaration of the Rights of Man and of the Citizen.')],
        [bold('Jan 1793'), text(' — Louis XVI executed; France at war with most of Europe.')],
        [bold('1793–94'), text(' — the Terror under Robespierre and the Committee of Public Safety.')],
        [bold('Nov 1799'), text(' — Napoleon’s coup of 18 Brumaire ends the Directory.')],
      ]),
      p(
        text('Essay framing: '),
        hl('financial crisis → political crisis → radicalisation', GREEN),
        text('. Keep the causes (debt from the American war, bread prices, tax exemptions) separate from the triggers.'),
      ),
    ]),
  ]);

  const book: Book = {
    id: uid(),
    title: 'Semester 1',
    sections: [math, physics, literature, history],
  };

  return { version: 1, books: [book] };
}

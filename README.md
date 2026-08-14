# Bookworm

An AI reading companion. Bookworm reads a book before you do, then tells you the
truth about it: a spoiler-safe summary, the category it really belongs to, an
honest time estimate, and a straight verdict — **read, skim, or skip** — scored
against your own reading history rather than a crowd average.

This repository is the front-end prototype: the marketing site plus a working
demo of the app itself. Authentication and a real model backend come next.

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Landing page with a live analysis demo — type a title and watch the verdict build |
| `library.html` | Your shelf: read / reading / want to read, with search, category and sort filters |
| `book.html?id=…` | Full breakdown: match score, summary, reading signals, "why this, for you", similar books |
| `discover.html` | Recommendations with the reason attached, re-rankable by mood (shorter, lighter, challenge me) |

## Running it

Any static server works — there is no build step:

```bash
python -m http.server 4173
```

Then open <http://localhost:4173>.

## How it's put together

```
assets/css/style.css   Design tokens and every component
assets/js/data.js      Book dataset and site copy
assets/js/art.js       Generated SVG — covers, avatars, brand mark, gauges, icons
assets/js/app.js       Shelf state, page controllers, the analysis demo
```

**No image files.** Every cover, avatar and icon is drawn as SVG at runtime from
ten geometric pattern generators and the shared palette, so the whole library
reads as one designed set and the repository stays text-only.

**Shelf state** persists in `localStorage` under `bookworm:shelf:v1`, so moving a
book between shelves updates the library counts, the taste profile and the
recommendation ranking live. Clear that key to reset to the seeded demo shelf.

## Design system

Built on **Portrait**: near-white canvas, deep-navy ink (`#08304c`) carrying
almost all text and structure, warm pastel washes for surfaces, and a single
rainbow gradient reserved for button borders, italicised headline words and the
brand mark. Shadows never exceed 8% black. Radii: 16px inputs, 24px cards, 28px
buttons, pill chips. Typeset in Switzer with General Sans for display.

## Theming

Dark mode follows the device by default and needs no interaction. There are
three states, resolved in CSS:

| State | Root attribute | Behaviour |
| --- | --- | --- |
| Auto *(default)* | none | Follows `prefers-color-scheme`, live — no reload needed |
| Light | `data-theme="light"` | Pinned light, even on a dark device |
| Dark | `data-theme="dark"` | Pinned dark, even on a light device |

The switch in the nav cycles auto → light → dark and stores the choice under
`bookworm:theme`; a rainbow pip on the button marks auto. A small inline script
in each page's `<head>` applies a pinned choice before first paint, so there is
no flash of the wrong theme.

Dark inverts the system's own logic rather than inverting its colours: the navy
ink becomes the canvas, the canvas becomes the ink, and each pastel wash sinks
to a deep tint of the same hue with a light tint of that hue carrying its text.
The rainbow is untouched.

**Covers stay bright in the dark.** Book covers, avatars and the status tags
that sit on them keep the light pastel palette in both themes — a cover is an
object, not a surface, and it holds its colour in a dim room the way a real one
does. Only page surfaces flip.

Every text/background pair on all four pages was measured against WCAG AA in
both themes and passes. Two colours were adjusted away from the source system
to get there, both noted in comments in `style.css`.

## Status

Prototype. The analysis text is pre-written sample content, not live model
output, and "Sign in" is not wired up yet.

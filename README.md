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
| `auth.html?mode=…` | Passwordless sign up and sign in — one-time email code or passkey |

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
assets/js/app.js       Shelf + account state, theme, page controllers, analysis demo
assets/js/auth.js      The passwordless sign-up / sign-in state machine
```

**No image files.** Every cover, avatar and icon is drawn as SVG at runtime from
ten geometric pattern generators and the shared palette, so the whole library
reads as one designed set and the repository stays text-only.

**Client state** persists in `localStorage`: `bookworm:shelf:v1` (shelf),
`bookworm:account:v1` (profile), `bookworm:theme` (theme override). Moving a
book between shelves updates the library counts, the taste profile and the
recommendation ranking live. Clear those keys to reset to the seeded demo state.

## Design system

Built on **Portrait**: near-white canvas, deep-navy ink (`#08304c`) carrying
almost all text and structure, warm pastel washes for surfaces, and a single
rainbow gradient reserved for button borders, italicised headline words and the
brand mark. Shadows never exceed 8% black. Radii: 16px inputs, 24px cards, 28px
buttons, pill chips. Typeset in Switzer with General Sans for display.

## Authentication

Passwordless throughout — there is no password field anywhere in the app, so
there is nothing to hash, store, reset or leak. Identity is proved one of two
ways:

- **One-time email code.** Six digits, single-use, ten-minute expiry. The input
  is six linked boxes with auto-advance, paste-the-whole-code, backspace and
  arrow-key navigation, and auto-submit on the sixth digit.
- **Passkey.** Offered first on the sign-in screen for returning readers.

**Sign up** is three steps: email → code → profile. The profile step collects a
display name, a unique `@handle` (auto-suggested from the name, sanitised as you
type, checked against taken handles), an avatar colour, at least three
categories, and a books-per-year goal, behind an explicit Terms checkbox with a
separate, unchecked opt-in for the monthly recap.

**Sign in** is two steps: email → code, with an optional *trust this device for
30 days*. Verifying an address with no shelf behind it rolls forward into
sign-up rather than dead-ending; signing up with a known address rolls into
sign-in.

The categories picked at sign-up seed the Discover ranking until reading history
outweighs them, so the sign-up has a visible consequence. Signed-in state drives
the nav account menu and the banner on the library and discover pages; signing
out re-ranks Discover on the spot.

> **Prototype scope.** No server, so no mail is sent — the code is shown on
> screen with a *Fill it for me* shortcut, and the passkey path is simulated
> rather than a real WebAuthn ceremony. The two stand-ins are marked `SIMULATED`
> in `auth.js`; replacing them with `POST /auth/code` and
> `navigator.credentials.create/get` is the whole backend integration. The state
> machine, validation, and error paths are real.

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

Prototype. The analysis text is pre-written sample content rather than live
model output, and auth runs against `localStorage` rather than a server — see
the scope note under Authentication.

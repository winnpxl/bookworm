/* Bookworm — generated artwork.
   Every cover, avatar and mark on this site is drawn here as SVG, from the
   Portrait palette, so the whole library reads as one designed set. */

let UID = 0;
const uid = p => `${p}${++UID}`;

/* ---------------------------------------------------------------- patterns */
/* Each returns the art layer for a 300x450 cover, occupying roughly y 0-310. */
const PATTERNS = {
  orbit: (a, ink) => `
    <g fill="none" stroke="${a}" stroke-width="1.5">
      <circle cx="150" cy="168" r="128" opacity=".22"/>
      <circle cx="150" cy="168" r="102" opacity=".32"/>
      <circle cx="150" cy="168" r="76"  opacity=".45"/>
      <circle cx="150" cy="168" r="50"  opacity=".6"/>
    </g>
    <circle cx="150" cy="168" r="26" fill="${a}"/>
    <circle cx="252" cy="168" r="7" fill="${a}"/>
    <circle cx="150" cy="66"  r="4.5" fill="${ink}" opacity=".5"/>`,

  horizon: a => `
    <circle cx="150" cy="150" r="66" fill="${a}"/>
    <g stroke="${a}" stroke-width="7" stroke-linecap="round">
      <line x1="46" y1="236" x2="254" y2="236" opacity=".9"/>
      <line x1="62" y1="258" x2="238" y2="258" opacity=".7"/>
      <line x1="80" y1="278" x2="220" y2="278" opacity=".5"/>
      <line x1="102" y1="296" x2="198" y2="296" opacity=".32"/>
    </g>`,

  prism: (a, ink) => `
    <g opacity=".85">
      <path d="M150 44 L262 250 L38 250 Z" fill="${a}" opacity=".55"/>
      <path d="M96 96 L208 302 L-16 302 Z" fill="${a}" opacity=".3"/>
      <path d="M204 96 L316 302 L92 302 Z" fill="${ink}" opacity=".12"/>
    </g>`,

  arcs: (a, ink) => `
    <g fill="none" stroke-width="12" stroke-linecap="round">
      <path d="M28 300 A 130 130 0 0 1 158 170" stroke="${a}" opacity=".95"/>
      <path d="M28 254 A 84 84 0 0 1 112 170" stroke="${ink}" opacity=".2"/>
      <path d="M28 208 A 38 38 0 0 1 66 170" stroke="${a}" opacity=".5"/>
    </g>
    <circle cx="222" cy="94" r="34" fill="${a}" opacity=".28"/>`,

  strata: (a, ink) => `
    <g>
      <rect x="34" y="62"  width="232" height="22" rx="11" fill="${a}" opacity=".9"/>
      <rect x="34" y="98"  width="168" height="22" rx="11" fill="${ink}" opacity=".16"/>
      <rect x="34" y="134" width="212" height="22" rx="11" fill="${a}" opacity=".55"/>
      <rect x="34" y="170" width="124" height="22" rx="11" fill="${ink}" opacity=".2"/>
      <rect x="34" y="206" width="196" height="22" rx="11" fill="${a}" opacity=".35"/>
      <rect x="34" y="242" width="88"  height="22" rx="11" fill="${a}" opacity=".85"/>
    </g>`,

  eclipse: (a, ink) => `
    <circle cx="118" cy="164" r="86" fill="${a}" opacity=".85"/>
    <circle cx="188" cy="164" r="86" fill="none" stroke="${ink}" stroke-width="1.6" opacity=".55"/>
    <circle cx="188" cy="164" r="52" fill="none" stroke="${ink}" stroke-width="1.6" opacity=".35"/>`,

  columns: (a, ink) => `
    <g>
      <rect x="40"  y="128" width="26" height="172" rx="13" fill="${a}" opacity=".9"/>
      <rect x="80"  y="76"  width="26" height="224" rx="13" fill="${ink}" opacity=".18"/>
      <rect x="120" y="152" width="26" height="148" rx="13" fill="${a}" opacity=".55"/>
      <rect x="160" y="52"  width="26" height="248" rx="13" fill="${a}" opacity=".95"/>
      <rect x="200" y="118" width="26" height="182" rx="13" fill="${ink}" opacity=".18"/>
      <rect x="240" y="182" width="26" height="118" rx="13" fill="${a}" opacity=".45"/>
    </g>`,

  stripes: (a, ink) => `
    <g stroke-width="16" stroke-linecap="round">
      <line x1="-10" y1="180" x2="150" y2="20"  stroke="${a}" opacity=".9"/>
      <line x1="-10" y1="240" x2="210" y2="20"  stroke="${ink}" opacity=".22"/>
      <line x1="-10" y1="300" x2="270" y2="20"  stroke="${a}" opacity=".5"/>
      <line x1="50"  y1="300" x2="310" y2="40"  stroke="${a}" opacity=".8"/>
      <line x1="140" y1="300" x2="310" y2="130" stroke="${ink}" opacity=".22"/>
    </g>`,

  grid: (a, ink) => {
    let dots = '';
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 6; c++) {
        const x = 46 + c * 42, y = 60 + r * 38;
        const hot = (r * 6 + c) % 7 === 3;
        dots += `<circle cx="${x}" cy="${y}" r="${hot ? 9 : 5}" fill="${hot ? a : ink}" opacity="${hot ? .95 : .22}"/>`;
      }
    }
    return `<g>${dots}</g>`;
  },

  wave: (a, ink) => `
    <g fill="none" stroke-width="9" stroke-linecap="round">
      <path d="M18 116 C 68 62, 122 62, 172 116 S 262 170, 292 116" stroke="${a}" opacity=".9"/>
      <path d="M18 176 C 68 122, 122 122, 172 176 S 262 230, 292 176" stroke="${ink}" opacity=".2"/>
      <path d="M18 236 C 68 182, 122 182, 172 236 S 262 290, 292 236" stroke="${a}" opacity=".55"/>
    </g>`
};

/* ------------------------------------------------------------ text helpers */
function wrapText(text, max) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  words.forEach(w => {
    if ((line + ' ' + w).trim().length > max && line) { lines.push(line); line = w; }
    else line = (line + ' ' + w).trim();
  });
  if (line) lines.push(line);
  return lines;
}

/* -------------------------------------------------------------- book cover */
function coverSVG(book) {
  const { pattern, bg, accent, ink } = book.art;
  const clip = uid('clip');
  const art = (PATTERNS[pattern] || PATTERNS.orbit)(accent, ink);
  const lines = wrapText(book.title, 15).slice(0, 3);
  const size = lines.length > 2 ? 26 : 30;
  const startY = 372 - (lines.length - 1) * (size + 2);
  const title = lines
    .map((l, i) => `<tspan x="26" y="${startY + i * (size + 2)}">${esc(l)}</tspan>`)
    .join('');

  return `<svg viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg" role="img"
       aria-label="Cover of ${esc(book.title)} by ${esc(book.author)}">
    <defs><clipPath id="${clip}"><rect width="300" height="450" rx="0"/></clipPath></defs>
    <g clip-path="url(#${clip})">
      <rect width="300" height="450" fill="${bg}"/>
      ${art}
      <line x1="26" y1="${startY - size - 4}" x2="60" y2="${startY - size - 4}"
            stroke="${ink}" stroke-width="2" stroke-linecap="round" opacity=".45"/>
      <text font-family="General Sans, Switzer, sans-serif" font-weight="600"
            font-size="${size}" letter-spacing="-1" fill="${ink}">${title}</text>
      <text x="26" y="${startY + lines.length * (size + 2) + 6}"
            font-family="Switzer, sans-serif" font-size="14" fill="${ink}" opacity=".62">${esc(book.author)}</text>
    </g>
  </svg>`;
}

/* ------------------------------------------------------------------ avatar */
function avatarSVG(person) {
  const { bg, accent } = person.art;
  const initials = person.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const c = uid('av');
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(person.name)}">
    <defs><clipPath id="${c}"><circle cx="48" cy="48" r="48"/></clipPath></defs>
    <g clip-path="url(#${c})">
      <rect width="96" height="96" fill="${bg}"/>
      <circle cx="70" cy="26" r="34" fill="${accent}" opacity=".28"/>
      <path d="M0 96 A 48 48 0 0 1 96 96 Z" fill="${accent}" opacity=".18"/>
      <text x="48" y="60" text-anchor="middle" font-family="General Sans, sans-serif"
            font-weight="600" font-size="30" letter-spacing="-1" fill="#08304c">${esc(initials)}</text>
    </g>
  </svg>`;
}

/* -------------------------------------------------------------- brand mark */
function logoSVG(size = 30) {
  const g = uid('lg');
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#26c0ff"/><stop offset=".2" stop-color="#e600c2"/>
        <stop offset=".4"  stop-color="#ff494e"/><stop offset=".6" stop-color="#ffa13e"/>
        <stop offset=".8"  stop-color="#ffc837"/><stop offset="1"  stop-color="#00cc3d"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="9" style="fill:var(--ink)"/>
    <path d="M7 9.5c3.4-1.3 5.9-1.3 8.6.6v13c-2.7-1.9-5.2-1.9-8.6-.6z" style="fill:var(--surface)" opacity=".95"/>
    <path d="M25 9.5c-3.4-1.3-5.9-1.3-8.6.6v13c2.7-1.9 5.2-1.9 8.6-.6z" fill="url(#${g})"/>
  </svg>`;
}

/* ------------------------------------------------------------- gauge ring  */
function gaugeSVG(score) {
  const r = 40, c = 2 * Math.PI * r;
  const g = uid('gg');
  const col = score >= 80 ? '#00cc3d' : score >= 65 ? '#ffa130' : '#ff4940';
  return `<svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="#26c0ff"/>
    </linearGradient></defs>
    <circle cx="46" cy="46" r="${r}" fill="none" style="stroke:var(--track)" stroke-width="7"/>
    <circle cx="46" cy="46" r="${r}" fill="none" stroke="url(#${g})" stroke-width="7"
            stroke-linecap="round" stroke-dasharray="${c}"
            stroke-dashoffset="${c - (score / 100) * c}"/>
  </svg>`;
}

/* --------------------------------------------------------------- utilities */
function esc(s) {
  return String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}

function icon(name, size = 18) {
  const p = {
    arrow: '<path d="M4 10h12M11 5l5 5-5 5"/>',
    check: '<path d="M4 10.5l4 4 8-9"/>',
    plus: '<path d="M10 4v12M4 10h12"/>',
    search: '<circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4"/>',
    spark: '<path d="M10 3l1.9 4.6L16.5 9.5 11.9 11.4 10 16l-1.9-4.6L3.5 9.5l4.6-1.9z"/>',
    book: '<path d="M4 4.5h4.5A2.5 2.5 0 0 1 11 7v9a2 2 0 0 0-2-2H4z"/><path d="M17 4.5h-4.5A2.5 2.5 0 0 0 10 7"/>',
    menu: '<path d="M3 6h14M3 10h14M3 14h14"/>',
    star: '<path fill="currentColor" d="M10 2.8l2.2 4.7 5 .7-3.6 3.5.9 5-4.5-2.4L5.5 16.7l.9-5L2.8 8.2l5-.7z"/>',
    clock: '<circle cx="10" cy="10" r="7"/><path d="M10 6v4.2l2.6 1.6"/>',
    chevron: '<path d="M6 8l4 4 4-4"/>',
    sun: '<circle cx="10" cy="10" r="3.6"/><path d="M10 2.4v1.8M10 15.8v1.8M17.6 10h-1.8M4.2 10H2.4M15.4 4.6l-1.3 1.3M5.9 14.1l-1.3 1.3M15.4 15.4l-1.3-1.3M5.9 5.9L4.6 4.6"/>',
    moon: '<path d="M16 11.7A6.6 6.6 0 0 1 8.3 4a6.9 6.9 0 1 0 7.7 7.7z"/>',
    auto: '<circle cx="10" cy="10" r="6.8"/><path d="M10 3.2a6.8 6.8 0 0 1 0 13.6z" fill="currentColor" stroke="none"/>',
    key: '<circle cx="7" cy="10" r="3.4"/><path d="M10.4 10H17l1.4 1.6-1.4 1.6M14 10v2.4"/>',
    globe: '<circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3a12 12 0 0 1 0 14 12 12 0 0 1 0-14z"/>',
    apple: '<path d="M13.2 10.6c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.5 2 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6 1.8-1 2.4-2c.8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.1z"/><path d="M11.6 4.6c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.6-.8 2.5.9.1 1.8-.5 2.4-1.2z"/>',
    logout: '<path d="M8 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H8M13 13.5l3.5-3.5L13 6.5M16 10H7.5"/>',
    user: '<circle cx="10" cy="7" r="3.2"/><path d="M4 16.5a6 6 0 0 1 12 0"/>'
  }[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor"
    stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

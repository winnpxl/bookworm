/* Bookworm — app shell, shelf state and page controllers. */

/* ============================================================ theme        */
/* Three states, not two. "system" is the default and the one most people stay
   on: no data-theme attribute, so the CSS follows prefers-color-scheme and the
   page changes with the device — including live, at sunset, without a reload.
   Choosing light or dark pins an override that outlives the session.
   The pre-paint half of this lives inline in each page's <head>. */
const THEME_KEY = 'bookworm:theme';
const MEDIA_DARK = window.matchMedia('(prefers-color-scheme: dark)');

const Theme = {
  order: ['system', 'light', 'dark'],
  get() { try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; } },
  resolve(mode = this.get()) { return mode === 'system' ? (MEDIA_DARK.matches ? 'dark' : 'light') : mode; },
  apply(mode = this.get()) {
    const root = document.documentElement;
    if (mode === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    document.querySelectorAll('[data-theme-btn]').forEach(btn => this.paint(btn, mode));
  },
  set(mode) {
    try { localStorage.setItem(THEME_KEY, mode); } catch {}
    this.apply(mode);
  },
  cycle() {
    const next = this.order[(this.order.indexOf(this.get()) + 1) % this.order.length];
    this.set(next);
    return next;
  },
  paint(btn, mode = this.get()) {
    const shown = this.resolve(mode);
    btn.dataset.mode = mode;
    btn.innerHTML = icon(shown === 'dark' ? 'moon' : 'sun', 18) + '<span class="theme-dot"></span>';
    const label = mode === 'system' ? `Auto — following your device (${shown})`
      : mode === 'dark' ? 'Dark mode' : 'Light mode';
    btn.title = label + ' · click to change';
    btn.setAttribute('aria-label', `Theme: ${label}. Click to change.`);
  }
};

/* Follow the device live while on "system" — repaints the icon; CSS handles
   the colours on its own. */
MEDIA_DARK.addEventListener('change', () => {
  if (Theme.get() === 'system') Theme.apply('system');
});

/* ============================================================ shelf state  */
const KEY = 'bookworm:shelf:v1';
const CYCLE = ['none', 'want', 'reading', 'read'];

const Shelf = {
  data: {},
  load() {
    try { this.data = JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { this.data = {}; }
    return this;
  },
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch {} },
  status(book) { return this.data[book.id] ?? book.status ?? 'none'; },
  set(book, status) { this.data[book.id] = status; this.save(); },
  cycle(book) {
    const next = CYCLE[(CYCLE.indexOf(this.status(book)) + 1) % CYCLE.length];
    this.set(book, next);
    return next;
  },
  progress(book) {
    const s = this.status(book);
    if (s === 'read') return 100;
    if (s === 'none' || s === 'want') return 0;
    return book.progress || 12;
  },
  counts() {
    const c = { all: BOOKS.length, read: 0, reading: 0, want: 0 };
    BOOKS.forEach(b => { const s = this.status(b); if (c[s] !== undefined) c[s]++; });
    return c;
  }
};
Shelf.load();

const byId = id => BOOKS.find(b => b.id === id);

/* ============================================================ account      */
/* Passwordless only — there is no password field anywhere in this app, so
   there is nothing here to hash, store or leak. The signed-in record holds a
   profile and the method used, never a secret. The flow that fills it in lives
   in auth.js. */
const ACCOUNT_KEY = 'bookworm:account:v1';

const ACCENTS = [
  { bg: '#e8f1ff', accent: '#3b82f6', name: 'Sky' },
  { bg: '#d7ffe2', accent: '#00cc3d', name: 'Mint' },
  { bg: '#ffebd6', accent: '#ffa130', name: 'Peach' },
  { bg: '#f0e9ff', accent: '#8e51ff', name: 'Lilac' }
];

const Account = {
  get() { try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY)); } catch { return null; } },
  signedIn() { return !!this.get(); },
  save(profile) {
    const next = { ...(this.get() || {}), ...profile };
    try { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next)); } catch {}
    return next;
  },
  signOut() { try { localStorage.removeItem(ACCOUNT_KEY); } catch {} },
  firstName() { const p = this.get(); return p && p.name ? p.name.split(' ')[0] : ''; },
  /* Shaped the way avatarSVG() expects, so account art comes out of the same
     generator as every other avatar on the site. */
  person(p = this.get()) {
    return p ? { name: p.name || p.handle || p.email, art: p.accent || ACCENTS[0] } : null;
  }
};

/* ================================================================ shell    */
const NAV = [
  ['index.html', 'Home'],
  ['library.html', 'My library'],
  ['discover.html', 'Discover'],
  ['index.html#how', 'How it works'],
  ['index.html#faq', 'FAQ']
];

function mountShell() {
  const page = document.body.dataset.page;

  const nav = document.querySelector('[data-nav]');
  if (nav) {
    nav.innerHTML = `
      <div class="wrap">
        <div class="nav">
          <a class="brand" href="index.html">${logoSVG(30)}<span class="brand-name">Bookworm</span></a>
          <nav class="nav-links" data-links>
            ${NAV.map(([h, l]) => {
              const active = (h === 'index.html' && page === 'home') ||
                             (h.startsWith(page || '~') && !h.includes('#'));
              return `<a href="${h}" ${active ? 'class="active"' : ''}>${l}</a>`;
            }).join('')}
          </nav>
          <div class="nav-actions">
            <button class="theme-btn" data-theme-btn type="button"></button>
            <span data-account-slot></span>
            <button class="nav-toggle" data-toggle aria-label="Menu" aria-expanded="false">${icon('menu', 20)}</button>
          </div>
        </div>
      </div>`;
    const links = nav.querySelector('[data-links]');
    nav.querySelector('[data-toggle]').addEventListener('click', e => {
      const open = links.classList.toggle('open');
      e.currentTarget.setAttribute('aria-expanded', String(open));
    });

    const themeBtn = nav.querySelector('[data-theme-btn]');
    Theme.paint(themeBtn);
    themeBtn.addEventListener('click', () => {
      const mode = Theme.cycle();
      toast(mode === 'system'
        ? `Following your device — currently ${Theme.resolve()}`
        : `${mode[0].toUpperCase() + mode.slice(1)} mode`);
    });

    mountAccount(nav.querySelector('[data-account-slot]'));
    document.addEventListener('account:change', () => mountAccount(nav.querySelector('[data-account-slot]')));
  }

  const foot = document.querySelector('[data-footer]');
  if (foot) {
    foot.innerHTML = `
      <div class="wrap">
        <div class="grid footer-grid">
          <div>
            <a class="brand" href="index.html">${logoSVG(30)}<span class="brand-name">Bookworm</span></a>
            <p class="small" style="margin-top:var(--s4);max-width:34ch">
              The reading companion that tells you the truth about a book before you give it a week of your life.</p>
            <div class="row" style="margin-top:var(--s5)">
              <span class="chip wash">${icon('spark', 14)} Built with AI</span>
            </div>
          </div>
          <div>
            <h5>Product</h5>
            <ul class="stack">
              <li><a href="library.html">My library</a></li>
              <li><a href="discover.html">Discover</a></li>
              <li><a href="index.html#how">How it works</a></li>
              <li><a href="index.html#features">Features</a></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul class="stack">
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Reading blog</a></li>
              <li><a href="index.html#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h5>Legal</h5>
            <ul class="stack">
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Data export</a></li>
            </ul>
          </div>
        </div>
        <hr class="divider" style="margin:var(--s12) 0 var(--s6)">
        <div class="row spread row-wrap">
          <p class="meta">© ${new Date().getFullYear()} Bookworm. A design prototype — no sign-in yet.</p>
          <p class="meta">Made for readers who finish things.</p>
        </div>
      </div>`;
  }

  revealInit();
}

/* Signed out: sign in + start free. Signed in: the account chip and its menu. */
function mountAccount(slot) {
  if (!slot) return;
  const p = Account.get();

  if (!p) {
    slot.className = 'row';
    slot.style.gap = 'var(--s2)';
    slot.innerHTML = `
      <a class="btn btn-ghost" href="auth.html?mode=signin">Sign in</a>
      <a class="btn btn-rainbow btn-sm" href="auth.html?mode=signup">Start free ${icon('arrow', 16)}</a>`;
    return;
  }

  slot.className = 'account';
  slot.removeAttribute('style');
  slot.innerHTML = `
    <button class="account-btn" data-account-btn aria-haspopup="true" aria-expanded="false">
      <span class="avatar">${avatarSVG(Account.person(p))}</span>
      <b>${esc(Account.firstName())}</b>
      ${icon('chevron', 15)}
    </button>
    <div class="menu" data-menu role="menu">
      <div class="menu-head">
        <b>${esc(p.name || '')}</b>
        <span>@${esc(p.handle || '')} · ${esc(p.email || '')}</span>
      </div>
      <hr class="divider" style="margin:0 0 6px">
      <a href="library.html" role="menuitem">${icon('book', 16)} My library</a>
      <a href="discover.html" role="menuitem">${icon('spark', 16)} Recommendations</a>
      <a href="auth.html?mode=signup" role="menuitem">${icon('user', 16)} Profile</a>
      <hr class="divider" style="margin:6px 0">
      <button data-signout role="menuitem">${icon('logout', 16)} Sign out</button>
    </div>`;

  const btn = slot.querySelector('[data-account-btn]');
  const menu = slot.querySelector('[data-menu]');
  const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  /* Replace rather than stack these — mountAccount runs again on every
     account:change. */
  document.removeEventListener('click', mountAccount._close);
  document.removeEventListener('keydown', mountAccount._esc);
  mountAccount._close = close;
  mountAccount._esc = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('click', mountAccount._close);
  document.addEventListener('keydown', mountAccount._esc);

  slot.querySelector('[data-signout]').addEventListener('click', () => {
    const name = Account.firstName();
    Account.signOut();
    close();
    document.dispatchEvent(new CustomEvent('account:change'));
    toast(`Signed out${name ? `, see you soon ${name}` : ''}`);
  });
}

function revealInit() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  items.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`; io.observe(el); });
}

/* ================================================================= toast   */
let toastTimer;
function toast(msg) {
  let el = document.querySelector('[data-toast]');
  if (!el) {
    el = document.createElement('div');
    el.setAttribute('data-toast', '');
    el.style.cssText = `position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);z-index:200;
      padding:12px 20px;border-radius:9999px;background:var(--solid-bg);color:var(--solid-fg);
      font-size:14px;font-weight:500;box-shadow:var(--shadow-lift);
      opacity:0;transition:opacity .25s,transform .25s;pointer-events:none`;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translate(-50%,0)'; });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = '0'; el.style.transform = 'translate(-50%,20px)';
  }, 2200);
}

/* ============================================================ components   */
function verdictPill(book) {
  const label = { read: 'Read it', skim: 'Skim it', skip: 'Skip it' }[book.verdict];
  const mark = { read: icon('check', 11), skim: '~', skip: '!' }[book.verdict];
  return `<span class="verdict" data-v="${book.verdict}"><i class="bead">${mark}</i>${label} · ${book.score}</span>`;
}

function bookCard(book, opts = {}) {
  const s = Shelf.status(book);
  const p = Shelf.progress(book);
  const tag = s === 'none' ? '' : `<span class="status-tag" data-s="${s}">${STATUS_LABEL[s]}</span>`;
  return `
    <article class="book-card reveal" data-book="${book.id}">
      <a href="book.html?id=${book.id}" aria-label="${book.title}">
        <div class="cover">${tag}${coverSVG(book)}</div>
      </a>
      <a href="book.html?id=${book.id}"><h4>${book.title}</h4></a>
      <p class="meta">${book.author} · ${book.category}</p>
      ${opts.verdict !== false ? `<div style="margin-top:var(--s3)">${verdictPill(book)}</div>` : ''}
      ${s === 'reading' ? `<div class="progress"><i style="width:${p}%"></i></div>
        <p class="meta" style="margin-top:6px">${p}% · ${Math.round(book.hours * (1 - p / 100))} hrs left</p>` : ''}
      ${opts.action ? `<button class="btn btn-quiet btn-sm btn-block" data-cycle="${book.id}"
          style="margin-top:var(--s3)">${s === 'none' ? '＋ Add to shelf' : `Mark: ${STATUS_LABEL[s]}`}</button>` : ''}
    </article>`;
}

function wireCycles(root = document) {
  root.querySelectorAll('[data-cycle]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const book = byId(btn.dataset.cycle);
      const next = Shelf.cycle(book);
      toast(next === 'none' ? `Removed “${book.title}” from your shelf` : `“${book.title}” → ${STATUS_LABEL[next]}`);
      document.dispatchEvent(new CustomEvent('shelf:change'));
    });
  });
}

/* ================================================================= HOME    */
function pageHome() {
  /* Hero analysis card ------------------------------------------------- */
  const card = document.querySelector('[data-hero-card]');
  const field = document.querySelector('[data-hero-search]');
  const chips = document.querySelector('[data-hero-chips]');
  const rotation = ['project-hail-mary', 'babel', 'psychology-money', 'piranesi'];
  let idx = 0, timer;

  function renderAnalysis(book, instant) {
    card.innerHTML = `
      <div class="row spread" style="align-items:flex-start">
        <div>
          <span class="caption">Bookworm analysis</span>
          <h3 class="h4" style="margin-top:6px">${book.title}</h3>
          <p class="meta">${book.author} · ${book.pages} pages · ${book.category}</p>
        </div>
        ${verdictPill(book)}
      </div>
      <hr class="divider" style="margin:var(--s5) 0">
      <div class="gauge">
        <div class="gauge-ring">${gaugeSVG(book.score)}<b>${book.score}</b></div>
        <div>
          <p class="h4" style="font-size:17px;line-height:1.35">${book.verdictLine}</p>
          <p class="meta" style="margin-top:8px">${icon('clock', 12)} ${book.hours} hrs to finish · matched to your history</p>
        </div>
      </div>
      <div style="margin-top:var(--s5);display:grid;gap:10px">
        ${Object.entries(book.signals).map(([k, v]) => `
          <div class="bar-row">
            <span>${k[0].toUpperCase() + k.slice(1)}</span>
            <div class="bar"><i style="width:0%" data-w="${v}"></i></div>
            <span>${v}</span>
          </div>`).join('')}
      </div>
      <div class="row row-wrap" style="margin-top:var(--s5);gap:8px">
        ${book.tags.map(t => `<span class="chip">${t}</span>`).join('')}
      </div>
      <a class="btn btn-solid btn-block" style="margin-top:var(--s5)" href="book.html?id=${book.id}">
        Read the full breakdown ${icon('arrow', 16)}</a>`;
    requestAnimationFrame(() => {
      card.querySelectorAll('.bar i').forEach(b => { b.style.width = b.dataset.w + '%'; });
    });
    if (!instant) {
      card.animate([{ opacity: .4, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 420, easing: 'cubic-bezier(.22,.61,.36,1)' });
    }
  }

  function analyse(book) {
    clearInterval(timer);
    card.innerHTML = `<div style="display:grid;place-items:center;gap:14px;min-height:380px;align-content:center">
        <div class="row" style="gap:10px;color:var(--teal)">${icon('spark', 18)}
          <span class="caption" style="color:var(--teal)">Reading ${book.pages} pages…</span></div>
        <div class="bar" style="width:190px"><i style="width:8%;transition:width 1s linear" data-load></i></div>
      </div>`;
    requestAnimationFrame(() => { const b = card.querySelector('[data-load]'); if (b) b.style.width = '100%'; });
    setTimeout(() => { renderAnalysis(book); autoRotate(); }, 1000);
  }

  function autoRotate() {
    clearInterval(timer);
    timer = setInterval(() => {
      idx = (idx + 1) % rotation.length;
      renderAnalysis(byId(rotation[idx]));
    }, 6000);
  }

  if (card) {
    renderAnalysis(byId(rotation[0]), true);
    autoRotate();

    if (chips) {
      chips.innerHTML = ['Babel', 'Piranesi', 'Sapiens', 'Deep Work']
        .map(t => `<button class="chip" data-try="${t}">${t}</button>`).join('');
      chips.querySelectorAll('[data-try]').forEach(b =>
        b.addEventListener('click', () => {
          field.value = b.dataset.try;
          const found = BOOKS.find(x => x.title.toLowerCase().includes(b.dataset.try.toLowerCase()));
          if (found) analyse(found);
        }));
    }

    if (field) {
      field.closest('form').addEventListener('submit', e => {
        e.preventDefault();
        const q = field.value.trim().toLowerCase();
        const found = BOOKS.find(x => x.title.toLowerCase().includes(q) || x.author.toLowerCase().includes(q));
        if (!q) { toast('Type a book title to analyse'); return; }
        if (found) analyse(found);
        else { toast(`No match for “${field.value}” in this demo — try Babel`); }
      });
    }
  }

  /* Steps -------------------------------------------------------------- */
  const steps = document.querySelector('[data-steps]');
  if (steps) steps.innerHTML = STEPS.map(s => `
    <div class="card card-pad card-hover reveal" style="padding:var(--s7)">
      <div class="row spread">
        <span class="numeral">${s.n}</span>
        <span class="${s.wash}" style="width:34px;height:34px;border-radius:50%"></span>
      </div>
      <h3 class="h4" style="margin-top:var(--s6)">${s.title}</h3>
      <p class="body" style="margin-top:10px">${s.body}</p>
    </div>`).join('');

  /* Features ----------------------------------------------------------- */
  const feats = document.querySelector('[data-features]');
  if (feats) feats.innerHTML = FEATURES.map((f, i) => {
    const demo = [featSummary(), featVerdict(), featRecs()][i];
    return `
    <div class="grid g2 feature-row reveal" style="align-items:center;gap:var(--s16);${i ? 'margin-top:var(--s20)' : ''}">
      <div style="${i % 2 ? 'order:2' : ''}">
        <span class="eyebrow ${['', 'peach', 'mint'][i]}">${f.eyebrow}</span>
        <h3 class="h2" style="margin-top:var(--s5)">${f.title}</h3>
        <p class="lede" style="margin-top:var(--s5)">${f.body}</p>
        <ul class="stack" style="margin-top:var(--s6)">
          ${f.points.map(p => `<li class="row" style="align-items:flex-start;gap:10px">
            <span style="color:var(--leaf);margin-top:2px">${icon('check', 16)}</span>
            <span class="body" style="color:var(--text)">${p}</span></li>`).join('')}
        </ul>
      </div>
      <div class="${f.wash}" style="border-radius:var(--r-card);padding:var(--s8);${i % 2 ? 'order:1' : ''}">
        ${demo}
      </div>
    </div>`;
  }).join('');

  /* Shelf rail --------------------------------------------------------- */
  const rail = document.querySelector('[data-rail]');
  if (rail) {
    const render = () => {
      rail.innerHTML = BOOKS.slice(0, 10).map(b => bookCard(b, { verdict: false })).join('');
      revealInit();
    };
    render();
    document.addEventListener('shelf:change', render);
  }

  /* Stats -------------------------------------------------------------- */
  const stats = document.querySelector('[data-stats]');
  if (stats) stats.innerHTML = STATS.map(s => `
    <div class="reveal">
      <p class="h1" style="font-size:clamp(34px,4vw,49px)">${s.n}</p>
      <p class="small" style="margin-top:6px">${s.l}</p>
    </div>`).join('');

  /* Testimonials ------------------------------------------------------- */
  const tes = document.querySelector('[data-testimonials]');
  if (tes) tes.innerHTML = TESTIMONIALS.map((t, i) => `
    <figure class="card card-pad card-hover reveal ${i === 1 ? 'tilt-r' : i === 0 ? 'tilt-l' : ''}" style="padding:var(--s7)">
      <div style="color:var(--sunflower)" class="row">${Array(5).fill(icon('star', 15)).join('')}</div>
      <blockquote class="h4" style="margin-top:var(--s5);font-size:18px;line-height:1.45;font-weight:500">“${t.quote}”</blockquote>
      <figcaption class="row" style="margin-top:var(--s6);gap:12px">
        <span class="avatar">${avatarSVG(t)}</span>
        <span><span class="small ink" style="display:block;font-weight:500">${t.name}</span>
        <span class="meta">${t.role}</span></span>
      </figcaption>
    </figure>`).join('');

  /* Marquee ------------------------------------------------------------ */
  const mq = document.querySelector('[data-marquee]');
  if (mq) {
    const words = ['Literary Fiction', 'Hard SF', 'Memoir', 'Behavioural Economics', 'Mythology',
      'Dark Academia', 'History', 'Productivity', 'Fantasy', 'Negotiation'];
    const set = words.map(w => `<span class="h4 muted" style="white-space:nowrap;font-weight:500">${w}</span>`).join('');
    mq.innerHTML = `<div class="marquee-track">${set}${set}</div>`;
  }

  /* FAQ ---------------------------------------------------------------- */
  const faq = document.querySelector('[data-faq]');
  if (faq) {
    faq.innerHTML = FAQS.map((f, i) => `
      <div class="faq-item ${i === 0 ? 'open' : ''}">
        <button class="faq-q" aria-expanded="${i === 0}">${f.q}<i>${icon('plus', 14)}</i></button>
        <div class="faq-a"><div><p class="body">${f.a}</p></div></div>
      </div>`).join('');
    faq.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => {
      const item = q.parentElement;
      const open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', String(open));
    }));
  }

  wireCycles();
  revealInit();
}

/* Small in-page product mocks used by the feature section */
function featSummary() {
  const b = byId('sapiens');
  return `<div class="card card-pad" style="padding:var(--s6)">
    <div class="row" style="gap:14px">
      <div class="cover" style="width:64px;flex:none">${coverSVG(b)}</div>
      <div><p class="h4" style="font-size:17px">${b.title}</p><p class="meta">${b.author}</p>
      <div style="margin-top:8px">${verdictPill(b)}</div></div>
    </div>
    <hr class="divider" style="margin:var(--s5) 0">
    <span class="caption">Pre-read summary</span>
    <p class="small" style="margin-top:8px;color:var(--text);line-height:1.55">${b.summary}</p>
    <div class="row row-wrap" style="margin-top:var(--s5);gap:8px">
      <span class="chip">${icon('clock', 13)} ${b.hours} hrs</span>
      <span class="chip">${b.pages} pages</span>
      <span class="chip">Spoiler-safe</span>
    </div>
  </div>`;
}

function featVerdict() {
  const pick = ['piranesi', 'babel', 'midnight-library'].map(byId);
  return `<div class="card card-pad" style="padding:var(--s6)">
    <span class="caption">Scored against your history</span>
    <div class="stack" style="margin-top:var(--s5)">
      ${pick.map(b => `
        <div class="row spread" style="gap:12px;padding:12px;border-radius:var(--r-input);background:var(--surface-2)">
          <div class="row" style="gap:12px;min-width:0">
            <div class="cover" style="width:38px;flex:none;border-radius:8px">${coverSVG(b)}</div>
            <div style="min-width:0">
              <p class="small ink" style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.title}</p>
              <p class="meta">${b.pages} pages</p>
            </div>
          </div>
          ${verdictPill(b)}
        </div>`).join('')}
    </div>
    <p class="meta" style="margin-top:var(--s5)">Same three books, a different reader, three different answers.</p>
  </div>`;
}

function featRecs() {
  const b = byId('circe');
  return `<div class="card card-pad" style="padding:var(--s6)">
    <div class="row" style="gap:14px;align-items:flex-start">
      <div class="cover" style="width:78px;flex:none">${coverSVG(b)}</div>
      <div>
        <span class="eyebrow mint">Because you finished</span>
        <p class="h4" style="font-size:17px;margin-top:8px">${b.title}</p>
        <p class="meta">${b.author} · ${b.category}</p>
      </div>
    </div>
    <p class="small" style="margin-top:var(--s5);color:var(--text);line-height:1.55">${b.whyForYou}</p>
    <div class="row" style="margin-top:var(--s5);gap:8px">
      <button class="btn btn-quiet btn-sm" data-cycle="${b.id}">＋ Add to shelf</button>
      <button class="btn btn-ghost btn-sm">Not for me</button>
    </div>
  </div>`;
}

/* A shelf held only in this browser is worth a gentle nudge; a signed-in one
   is worth a greeting. Rendered on both the library and discover pages. */
function mountAccountBanner() {
  const el = document.querySelector('[data-account-banner]');
  if (!el) return;
  const p = Account.get();

  el.innerHTML = p
    ? `<div class="row" style="gap:14px">
         <span class="avatar">${avatarSVG(Account.person(p))}</span>
         <div>
           <p class="h4" style="font-size:17px">Welcome back, ${esc(Account.firstName())}.</p>
           <p class="meta">@${esc(p.handle)} · signed in with a one-time code · shelf synced</p>
         </div>
       </div>
       <a class="btn btn-quiet btn-sm" href="discover.html">Today's picks ${icon('arrow', 15)}</a>`
    : `<div>
         <p class="h4" style="font-size:17px">You're browsing as a guest.</p>
         <p class="small" style="margin-top:4px;color:var(--ink)">
           This shelf lives in this browser only. Create an account — no password, just an email code — to keep it.</p>
       </div>
       <div class="row" style="gap:10px">
         <a class="btn btn-solid btn-sm" href="auth.html?mode=signup">Create my shelf</a>
         <a class="btn btn-ghost btn-sm" href="auth.html?mode=signin">Sign in</a>
       </div>`;

  el.className = 'banner ' + (p ? 'wash-mint' : 'wash-sky');
}

/* ============================================================== LIBRARY    */
function pageLibrary() {
  mountAccountBanner();
  document.addEventListener('account:change', mountAccountBanner);

  const grid = document.querySelector('[data-grid]');
  if (!grid) return;
  const state = { q: '', status: 'all', cat: 'All', sort: 'recent' };

  const segs = document.querySelector('[data-segs]');
  const cats = document.querySelector('[data-cats]');
  const search = document.querySelector('[data-search]');
  const sort = document.querySelector('[data-sort]');
  const summary = document.querySelector('[data-summary]');
  const statsEl = document.querySelector('[data-shelf-stats]');

  cats.innerHTML = CATEGORIES.map(c =>
    `<button class="chip ${c === 'All' ? 'wash' : ''}" data-cat="${c}">${c}</button>`).join('');

  function render() {
    const c = Shelf.counts();
    segs.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', b.dataset.status === state.status);
      const k = b.dataset.status;
      const n = k === 'all' ? BOOKS.length : c[k];
      b.querySelector('em').textContent = n;
    });
    cats.querySelectorAll('[data-cat]').forEach(b =>
      b.classList.toggle('wash', b.dataset.cat === state.cat));

    let list = BOOKS.filter(b => {
      const s = Shelf.status(b);
      if (state.status !== 'all' && s !== state.status) return false;
      if (state.cat !== 'All' && b.category !== state.cat) return false;
      if (state.q && !(`${b.title} ${b.author} ${b.category} ${b.tags.join(' ')}`)
        .toLowerCase().includes(state.q)) return false;
      return true;
    });

    const sorters = {
      recent: () => 0,
      score: (a, b) => b.score - a.score,
      title: (a, b) => a.title.localeCompare(b.title),
      pages: (a, b) => a.pages - b.pages
    };
    list = list.slice().sort(sorters[state.sort]);

    summary.textContent = `${list.length} ${list.length === 1 ? 'book' : 'books'}`;

    grid.innerHTML = list.length
      ? list.map(b => bookCard(b, { action: true })).join('')
      : `<div class="card card-pad center" style="grid-column:1/-1;padding:var(--s16)">
           <p class="h4">Nothing here yet</p>
           <p class="body" style="margin-top:8px">Try another filter, or
             <a href="discover.html" style="color:var(--teal);text-decoration:underline">let Bookworm suggest something</a>.</p>
         </div>`;

    /* shelf stats */
    const read = BOOKS.filter(b => Shelf.status(b) === 'read');
    const pages = read.reduce((n, b) => n + b.pages, 0);
    const hours = Math.round(read.reduce((n, b) => n + b.hours, 0));
    const top = Object.entries(read.reduce((m, b) => (m[b.category] = (m[b.category] || 0) + 1, m), {}))
      .sort((a, b) => b[1] - a[1])[0];
    statsEl.innerHTML = [
      ['Finished', read.length],
      ['Pages read', pages.toLocaleString()],
      ['Hours read', hours],
      ['Top category', top ? top[0] : '—']
    ].map(([l, v]) => `<div>
        <p class="h4" style="font-size:24px;font-family:var(--font-display)">${v}</p>
        <p class="meta" style="margin-top:2px">${l}</p></div>`).join('');

    wireCycles(grid);
    revealInit();
  }

  segs.addEventListener('click', e => {
    const b = e.target.closest('[data-status]'); if (!b) return;
    state.status = b.dataset.status; render();
  });
  cats.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    state.cat = b.dataset.cat; render();
  });
  search.addEventListener('input', e => { state.q = e.target.value.trim().toLowerCase(); render(); });
  sort.addEventListener('change', e => { state.sort = e.target.value; render(); });
  document.addEventListener('shelf:change', render);
  render();
}

/* ================================================================= BOOK    */
function pageBook() {
  const root = document.querySelector('[data-book]');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id') || 'project-hail-mary';
  const b = byId(id) || BOOKS[0];
  document.title = `${b.title} — Bookworm`;

  const s = () => Shelf.status(b);

  function shelfControls() {
    return `<div class="seg" data-shelf>
      ${['want', 'reading', 'read'].map(k =>
        `<button data-set="${k}" class="${s() === k ? 'on' : ''}">${STATUS_LABEL[k]}</button>`).join('')}
    </div>`;
  }

  root.innerHTML = `
    <div class="wrap">
      <a class="btn btn-ghost" href="library.html" style="margin-left:-12px">← Back to library</a>

      <div class="grid" style="grid-template-columns:300px 1fr;gap:var(--s16);margin-top:var(--s6);align-items:start">
        <div>
          <div class="cover">${coverSVG(b)}</div>
          <div style="margin-top:var(--s5)">${shelfControls()}</div>
          <div class="card card-pad" style="margin-top:var(--s5);padding:var(--s5)">
            ${[['Pages', b.pages], ['Published', b.year], ['Time to finish', b.hours + ' hrs'],
               ['Category', b.category]].map(([k, v]) => `
              <div class="row spread" style="padding:7px 0">
                <span class="meta">${k}</span><span class="small ink" style="font-weight:500">${v}</span></div>`).join('')}
          </div>
        </div>

        <div>
          <div class="row row-wrap" style="gap:8px">
            <span class="eyebrow">${b.category}</span>
            ${b.tags.map(t => `<span class="chip">${t}</span>`).join('')}
          </div>
          <h1 class="h1" style="margin-top:var(--s5)">${b.title}</h1>
          <p class="lede" style="margin-top:10px">by ${b.author} · ${b.year}</p>

          <div class="card card-pad reveal in" style="margin-top:var(--s8);padding:var(--s8)" data-analysis></div>

          <div class="grid g2" style="margin-top:var(--s6)">
            <div class="card card-pad wash-mint" style="border:0">
              <span class="caption" style="color:var(--wash-mint-fg)">Best for</span>
              <p class="body" style="margin-top:8px;color:var(--ink)">${b.bestFor}</p>
            </div>
            <div class="card card-pad wash-peach" style="border:0">
              <span class="caption" style="color:var(--wash-peach-fg)">Skip if</span>
              <p class="body" style="margin-top:8px;color:var(--ink)">${b.skipIf}</p>
            </div>
          </div>

          <blockquote class="card card-pad" style="margin-top:var(--s6);padding:var(--s8);border-left:3px solid transparent;
            background:linear-gradient(var(--surface),var(--surface)) padding-box, var(--rainbow) border-box">
            <p class="h3" style="font-weight:500;font-size:clamp(20px,2.4vw,26px);line-height:1.3">“${b.quote}”</p>
            <p class="meta" style="margin-top:var(--s4)">Line most highlighted by readers like you</p>
          </blockquote>
        </div>
      </div>

      <section class="section">
        <div class="row spread">
          <h2 class="h3">If you read this, read these next</h2>
          <a class="btn btn-ghost" href="discover.html">All recommendations ${icon('arrow', 16)}</a>
        </div>
        <div class="grid g3" style="margin-top:var(--s6)" data-similar></div>
      </section>
    </div>`;

  /* analysis panel, revealed after a short "reading" beat */
  const panel = root.querySelector('[data-analysis]');
  panel.innerHTML = `<div class="row" style="gap:10px;color:var(--teal);min-height:220px;align-items:center">
      ${icon('spark', 18)}<span class="caption" style="color:var(--teal)">Bookworm is reading ${b.pages} pages…</span></div>`;

  setTimeout(() => {
    panel.innerHTML = `
      <div class="row spread row-wrap" style="gap:var(--s4)">
        <span class="eyebrow lilac">${icon('spark', 12)} AI analysis</span>
        ${verdictPill(b)}
      </div>
      <div class="gauge" style="margin-top:var(--s6)">
        <div class="gauge-ring">${gaugeSVG(b.score)}<b>${b.score}</b></div>
        <div>
          <p class="h3" style="font-size:22px;font-weight:500;line-height:1.3">${b.verdictLine}</p>
          <p class="meta" style="margin-top:8px">Match score is personal — it compares this book to what you actually finish.</p>
        </div>
      </div>

      <hr class="divider" style="margin:var(--s7) 0">
      <span class="caption">Spoiler-safe summary</span>
      <p class="body" style="margin-top:10px;color:var(--text);font-size:17px;line-height:1.6">${b.summary}</p>

      <div class="grid g2" style="margin-top:var(--s7);gap:var(--s8)">
        <div>
          <span class="caption">What you'll take away</span>
          <ul class="stack" style="margin-top:12px">
            ${b.takeaways.map(t => `<li class="row" style="align-items:flex-start;gap:10px">
              <span style="color:var(--cobalt);margin-top:2px">${icon('check', 15)}</span>
              <span class="small" style="color:var(--text)">${t}</span></li>`).join('')}
          </ul>
        </div>
        <div>
          <span class="caption">Reading signals</span>
          <div style="margin-top:12px;display:grid;gap:10px">
            ${Object.entries(b.signals).map(([k, v]) => `
              <div class="bar-row"><span>${k[0].toUpperCase() + k.slice(1)}</span>
                <div class="bar"><i style="width:0" data-w="${v}"></i></div><span>${v}</span></div>`).join('')}
          </div>
        </div>
      </div>

      <div class="wash-sky" style="margin-top:var(--s7);padding:var(--s6);border-radius:var(--r-input)">
        <span class="caption" style="color:var(--teal)">Why this, for you</span>
        <p class="body" style="margin-top:8px;color:var(--ink)">${b.whyForYou}</p>
      </div>

      <div class="row spread row-wrap" style="margin-top:var(--s6);gap:var(--s4)">
        <p class="meta">Was this verdict right?</p>
        <div class="row" style="gap:8px">
          <button class="btn btn-quiet btn-sm" data-vote="up">Yes, useful</button>
          <button class="btn btn-quiet btn-sm" data-vote="down">No, retrain</button>
        </div>
      </div>`;
    requestAnimationFrame(() => panel.querySelectorAll('.bar i')
      .forEach(i => { i.style.width = i.dataset.w + '%'; }));
    panel.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
      { duration: 450, easing: 'cubic-bezier(.22,.61,.36,1)' });
    panel.querySelectorAll('[data-vote]').forEach(btn => btn.addEventListener('click', () => {
      toast(btn.dataset.vote === 'up' ? 'Noted — more books like this' : 'Thanks, your profile has been updated');
    }));
  }, 1100);

  /* shelf segment */
  function wireShelf() {
    root.querySelectorAll('[data-shelf] button').forEach(btn =>
      btn.addEventListener('click', () => {
        const next = s() === btn.dataset.set ? 'none' : btn.dataset.set;
        Shelf.set(b, next);
        root.querySelectorAll('[data-shelf] button').forEach(x =>
          x.classList.toggle('on', x.dataset.set === next));
        toast(next === 'none' ? 'Removed from your shelf' : `Marked as ${STATUS_LABEL[next]}`);
      }));
  }
  wireShelf();

  root.querySelector('[data-similar]').innerHTML =
    b.similar.map(byId).filter(Boolean).map(x => bookCard(x)).join('');
  wireCycles(root);
  revealInit();
}

/* ============================================================== DISCOVER   */
function pageDiscover() {
  mountAccountBanner();
  document.addEventListener('account:change', mountAccountBanner);

  const feed = document.querySelector('[data-feed]');
  if (!feed) return;
  const profile = document.querySelector('[data-profile]');
  const tune = document.querySelector('[data-tune]');
  let mode = 'balanced';

  /* Categories picked at sign-up seed the ranking until there is enough
     reading history to outweigh them. Rebuilt on every render, because signing
     in or out changes the answer. */
  function buildModes() {
    const interests = (Account.get() || {}).interests || [];
    const seed = b => (interests.includes(b.category) ? 12 : 0);
    return {
      balanced: {
        label: 'Balanced',
        note: interests.length
          ? `Ranked on your history, seeded with the ${interests.length} categories you picked at sign-up.`
          : 'Ranked purely on how well each book matches your history.',
        fn: (a, b) => (b.score + seed(b)) - (a.score + seed(a))
      },
      short: { label: 'Something shorter', note: 'Weighted towards books you can finish this week.', fn: (a, b) => (b.score - b.pages / 8) - (a.score - a.pages / 8) },
      light: { label: 'Something lighter', note: 'Favouring pace and warmth over density.', fn: (a, b) => (b.signals.pace - b.signals.depth / 2) - (a.signals.pace - a.signals.depth / 2) },
      hard: { label: 'Challenge me', note: 'Deliberately denser than your usual shelf.', fn: (a, b) => b.signals.depth - a.signals.depth }
    };
  }

  let MODES = buildModes();
  tune.innerHTML = Object.entries(MODES).map(([k, m]) =>
    `<button data-mode="${k}" class="${k === mode ? 'on' : ''}">${m.label}</button>`).join('');

  function render() {
    MODES = buildModes();
    tune.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
    document.querySelector('[data-mode-note]').textContent = MODES[mode].note;

    const list = BOOKS.filter(b => Shelf.status(b) !== 'read').slice().sort(MODES[mode].fn);
    const [hero, ...rest] = list;

    feed.innerHTML = `
      <article class="card reveal" style="overflow:hidden;grid-column:1/-1">
        <div class="grid" style="grid-template-columns:1fr 1.2fr;gap:0">
          <div class="wash-sky" style="padding:var(--s10);display:grid;place-items:center">
            <div class="cover tilt-l" style="width:200px">${coverSVG(hero)}</div>
          </div>
          <div style="padding:var(--s10)">
            <div class="row row-wrap" style="gap:8px">
              <span class="eyebrow lilac">${icon('spark', 12)} Top pick this week</span>
              ${verdictPill(hero)}
            </div>
            <h3 class="h2" style="margin-top:var(--s5);font-size:clamp(26px,3.2vw,36px)">${hero.title}</h3>
            <p class="meta" style="margin-top:6px">${hero.author} · ${hero.pages} pages · ${hero.hours} hrs</p>
            <p class="body" style="margin-top:var(--s5)">${hero.summary}</p>
            <div class="wash-mint" style="margin-top:var(--s5);padding:var(--s5);border-radius:var(--r-input)">
              <span class="caption" style="color:var(--wash-mint-fg)">Why you</span>
              <p class="small" style="margin-top:6px;color:var(--ink)">${hero.whyForYou}</p>
            </div>
            <div class="row" style="margin-top:var(--s6);gap:10px">
              <a class="btn btn-solid btn-sm" href="book.html?id=${hero.id}">Full breakdown ${icon('arrow', 15)}</a>
              <button class="btn btn-quiet btn-sm" data-cycle="${hero.id}">＋ Add to shelf</button>
            </div>
          </div>
        </div>
      </article>
      ${rest.map(b => `
        <article class="card card-pad card-hover reveal" style="padding:var(--s6)">
          <div class="row" style="gap:14px;align-items:flex-start">
            <a href="book.html?id=${b.id}" class="cover" style="width:76px;flex:none">${coverSVG(b)}</a>
            <div style="min-width:0">
              <a href="book.html?id=${b.id}"><p class="h4" style="font-size:17px">${b.title}</p></a>
              <p class="meta">${b.author} · ${b.pages} pages</p>
              <div style="margin-top:8px">${verdictPill(b)}</div>
            </div>
          </div>
          <p class="small" style="margin-top:var(--s5);line-height:1.55">${b.whyForYou}</p>
          <div class="row" style="margin-top:var(--s5);gap:8px">
            <button class="btn btn-quiet btn-sm" data-cycle="${b.id}">＋ Shelf</button>
            <a class="btn btn-ghost btn-sm" href="book.html?id=${b.id}">Details</a>
          </div>
        </article>`).join('')}`;

    /* taste profile */
    const read = BOOKS.filter(b => Shelf.status(b) === 'read');
    const cats = Object.entries(read.reduce((m, b) => (m[b.category] = (m[b.category] || 0) + 1, m), {}))
      .sort((a, b) => b[1] - a[1]).slice(0, 4);
    const maxC = cats.length ? cats[0][1] : 1;
    const avgPages = read.length ? Math.round(read.reduce((n, b) => n + b.pages, 0) / read.length) : 0;

    profile.innerHTML = `
      <span class="caption">Your taste profile</span>
      <p class="h3" style="margin-top:10px">Built from ${read.length} finished ${read.length === 1 ? 'book' : 'books'}</p>
      <div style="margin-top:var(--s6);display:grid;gap:10px">
        ${cats.length ? cats.map(([c, n]) => `
          <div class="bar-row"><span>${c}</span>
            <div class="bar"><i style="width:${(n / maxC) * 100}%"></i></div><span>${n}</span></div>`).join('')
          : '<p class="small">Mark a few books as read and this fills in.</p>'}
      </div>
      <hr class="divider" style="margin:var(--s6) 0">
      <div class="grid g2" style="gap:var(--s4)">
        <div><p class="h4" style="font-family:var(--font-display)">${avgPages || '—'}</p><p class="meta">Average pages you finish</p></div>
        <div><p class="h4" style="font-family:var(--font-display)">${read.length ? Math.round(read.reduce((n,b)=>n+b.rating,0)/read.length*10)/10 : '—'}</p><p class="meta">Average rating you give</p></div>
      </div>`;

    wireCycles(feed);
    revealInit();
  }

  tune.addEventListener('click', e => {
    const b = e.target.closest('[data-mode]'); if (!b) return;
    mode = b.dataset.mode; render();
  });
  document.addEventListener('shelf:change', render);
  document.addEventListener('account:change', render);
  render();
}

/* ================================================================= boot    */
document.addEventListener('DOMContentLoaded', () => {
  mountShell();
  ({
    home: pageHome,
    library: pageLibrary,
    book: pageBook,
    discover: pageDiscover,
    auth: typeof pageAuth === 'function' ? pageAuth : null
  }[document.body.dataset.page] || (() => {}))();
});

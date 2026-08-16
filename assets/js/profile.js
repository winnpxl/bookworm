/* Bookworm — the profile page.

   Everything editable here is held in a draft object first. Nothing touches
   the stored account until Save is pressed, so Discard is a real option and
   the save bar can honestly say whether there is anything to save. */

function pageProfile() {
  const root = document.querySelector('[data-profile-page]');
  if (!root) return;

  /* `saved` is the stored account, `draft` the working copy. Nothing is
     written until Save, so clean() can answer honestly and Discard is real. */
  let saved = Account.get() || {};
  const baseline = () => ({
    name: saved.name || '',
    handle: saved.handle || '',
    accent: Math.max(0, ACCENTS.findIndex(a => a.accent === (saved.accent || {}).accent)),
    interests: [...(saved.interests || [])],
    goal: saved.goal || 24,
    updates: !!saved.updates
  });
  let draft = baseline();
  const clean = () => JSON.stringify(draft) === JSON.stringify(baseline());

  function signedOutMarkup() {
    return `
      <div class="wrap">
        <div class="card card-pad center" style="max-width:560px;margin-inline:auto;padding:var(--s16) var(--s10)">
          <span class="eyebrow"><span class="dot"></span> Profile</span>
          <h1 class="h2" style="margin-top:var(--s5)">There is no profile yet.</h1>
          <p class="lede" style="margin-top:var(--s5)">
            Your shelf works fine without an account, but it lives in this browser only.
            Create one — an email and a six-digit code — and this page fills itself in.
          </p>
          <div class="row" style="justify-content:center;margin-top:var(--s8);gap:10px;flex-wrap:wrap">
            <a class="btn btn-solid" href="auth.html?mode=signup">Create an account</a>
            <a class="btn btn-quiet" href="auth.html?mode=signin">Sign in</a>
          </div>
        </div>
      </div>`;
  }

  /* --------------------------------------------------------------- reading */
  function stats() {
    const read = BOOKS.filter(b => Shelf.status(b) === 'read');
    const reading = BOOKS.filter(b => Shelf.status(b) === 'reading');
    const want = BOOKS.filter(b => Shelf.status(b) === 'want');
    const rated = read.filter(b => b.rating > 0);
    const pages = read.reduce((n, b) => n + b.pages, 0);
    const hours = Math.round(read.reduce((n, b) => n + b.hours, 0));
    const cats = Object.entries(read.reduce((m, b) => (m[b.category] = (m[b.category] || 0) + 1, m), {}))
      .sort((a, b) => b[1] - a[1]);
    const authors = Object.entries(read.reduce((m, b) => (m[b.author] = (m[b.author] || 0) + 1, m), {}))
      .sort((a, b) => b[1] - a[1]);
    return {
      read, reading, want, pages, hours, cats, authors,
      avgRating: rated.length ? Math.round(read.reduce((n, b) => n + b.rating, 0) / rated.length * 10) / 10 : 0,
      avgPages: read.length ? Math.round(pages / read.length) : 0,
      agreed: read.filter(b => b.verdict === 'read').length,
      goalPct: Math.min(100, Math.round((read.length / draft.goal) * 100))
    };
  }

  /* -------------------------------------------------------------- rendering */
  function render() {
    if (!Account.signedIn()) { root.innerHTML = signedOutMarkup(); return; }

    const s = stats();
    const person = { name: draft.name || saved.email, art: ACCENTS[draft.accent] };
    const joined = saved.joined
      ? new Date(saved.joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : 'today';

    root.innerHTML = `
      <div class="wrap">

        <!-- header ------------------------------------------------------- -->
        <div class="card card-pad" style="padding:var(--s8)">
          <div class="row spread row-wrap" style="gap:var(--s6)">
            <div class="profile-head">
              <span class="avatar" data-avatar>${avatarSVG(person)}</span>
              <div>
                <span class="eyebrow mint">${icon('check', 12)} Signed in</span>
                <h1 class="h2" style="margin-top:10px;font-size:clamp(26px,3.4vw,38px)" data-name-out>${esc(draft.name)}</h1>
                <p class="meta" style="margin-top:6px">
                  @<span data-handle-out>${esc(draft.handle)}</span> · ${esc(saved.email)} · Reading here since ${joined}
                </p>
              </div>
            </div>
            <div class="gauge">
              <div class="gauge-ring">${gaugeSVG(s.goalPct)}<b>${s.read.length}</b></div>
              <div>
                <p class="small ink" style="font-weight:500">of ${draft.goal} books this year</p>
                <p class="meta" style="margin-top:2px">${s.goalPct}% of your goal</p>
              </div>
            </div>
          </div>

          <hr class="divider" style="margin:var(--s7) 0">
          <div class="grid g4" style="gap:var(--s5)">
            ${[[s.pages.toLocaleString(), 'Pages read'], [s.hours, 'Hours read'],
               [s.avgRating || '—', 'Average rating'], [s.avgPages || '—', 'Average length']]
              .map(([v, l]) => `<div>
                <p class="h4" style="font-family:var(--font-display);font-size:26px">${v}</p>
                <p class="meta" style="margin-top:2px">${l}</p></div>`).join('')}
          </div>
        </div>

        <div class="grid profile-grid" style="margin-top:var(--s8)">
          <div class="grid" style="gap:var(--s6)">

            <!-- identity -------------------------------------------------- -->
            <section class="card card-pad" style="padding:var(--s8)">
              <span class="caption">Your details</span>
              <h2 class="h3" style="margin-top:8px;font-size:24px">How your shelf is labelled</h2>

              <div class="row" style="gap:var(--s5);margin-top:var(--s7);flex-wrap:wrap">
                <div>
                  <span class="label">Avatar</span>
                  <div class="avatar-pick" role="group" aria-label="Avatar colour">
                    ${ACCENTS.map((a, i) => `
                      <button type="button" class="${i === draft.accent ? 'on' : ''}" data-accent="${i}"
                              aria-label="${a.name}" aria-pressed="${i === draft.accent}">
                        ${avatarSVG({ name: draft.name || 'You', art: a })}
                      </button>`).join('')}
                  </div>
                </div>
              </div>

              <div style="margin-top:var(--s7)">
                <label class="label" for="p-name">Display name</label>
                <input class="input" id="p-name" type="text" maxlength="40" value="${esc(draft.name)}">
                <p class="hint" data-hint="name">Shown on your shelf and on anything you share.</p>
              </div>

              <div style="margin-top:var(--s6)">
                <label class="label" for="p-handle">Handle</label>
                <div class="input-prefix">
                  <span>@</span>
                  <input class="input" id="p-handle" type="text" maxlength="20" value="${esc(draft.handle)}">
                </div>
                <p class="hint" data-hint="handle">bookworm.app/@${esc(draft.handle)}</p>
              </div>
            </section>

            <!-- taste ---------------------------------------------------- -->
            <section class="card card-pad" style="padding:var(--s8)">
              <span class="caption">What you read</span>
              <h2 class="h3" style="margin-top:8px;font-size:24px">Taste and targets</h2>
              <p class="body" style="margin-top:10px">
                These seed your recommendations. Your actual reading history outweighs them as it builds.
              </p>

              <div style="margin-top:var(--s7)">
                <span class="label">Categories <span class="opt">— at least 3</span></span>
                <div class="chip-select" data-interests>
                  ${CATEGORIES.filter(c => c !== 'All').map(c =>
                    `<button type="button" class="chip ${draft.interests.includes(c) ? 'on' : ''}"
                             data-interest="${c}" aria-pressed="${draft.interests.includes(c)}">${c}</button>`).join('')}
                </div>
                <p class="hint" data-hint="interests">${draft.interests.length} selected.</p>
              </div>

              <div style="margin-top:var(--s7)">
                <span class="label">Books a year</span>
                <div class="seg" data-goal>
                  ${[12, 24, 52, 100].map(g =>
                    `<button type="button" data-g="${g}" class="${draft.goal === g ? 'on' : ''}">${g}</button>`).join('')}
                </div>
              </div>

              ${s.cats.length ? `
              <hr class="divider" style="margin:var(--s7) 0">
              <span class="caption">Where your finished books actually sit</span>
              <div style="margin-top:var(--s5);display:grid;gap:10px">
                ${s.cats.slice(0, 5).map(([c, n]) => `
                  <div class="bar-row"><span>${c}</span>
                    <div class="bar"><i style="width:${(n / s.cats[0][1]) * 100}%"></i></div>
                    <span>${n}</span></div>`).join('')}
              </div>` : ''}
            </section>

            <!-- account -------------------------------------------------- -->
            <section class="card card-pad" style="padding:var(--s8)">
              <span class="caption">Account</span>
              <h2 class="h3" style="margin-top:8px;font-size:24px">Sign-in and data</h2>

              <div style="margin-top:var(--s6)">
                <div class="rowline">
                  <div>
                    <b>Email address</b>
                    <span data-email-out>${esc(saved.email)}</span>
                  </div>
                  <button class="btn btn-quiet btn-sm" data-change-email type="button">Change</button>
                </div>
                <div data-email-flow hidden style="padding-bottom:var(--s5)"></div>

                <div class="rowline">
                  <div><b>Sign-in method</b><span>One-time email code — no password stored</span></div>
                  <span class="chip">${icon('check', 13)} Passwordless</span>
                </div>

                <div class="rowline">
                  <div><b>Monthly reading recap</b><span>A summary of what you finished, once a month</span></div>
                  <label class="check"><input type="checkbox" data-updates ${draft.updates ? 'checked' : ''}>
                    <span class="meta">Send it</span></label>
                </div>

                <div class="rowline">
                  <div><b>Appearance</b><span>Dark mode follows your device unless you pin it</span></div>
                  <div class="seg" data-theme-seg>
                    ${[['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) =>
                      `<button type="button" data-t="${k}" class="${Theme.get() === k ? 'on' : ''}">${l}</button>`).join('')}
                  </div>
                </div>

                <div class="rowline">
                  <div><b>Your data</b><span>Profile, shelf, ratings and verdicts as JSON</span></div>
                  <button class="btn btn-quiet btn-sm" data-export type="button">Export</button>
                </div>
              </div>

              <div class="tile" style="margin-top:var(--s7);background:var(--wash-rose)">
                <div class="row spread row-wrap" style="gap:var(--s4)">
                  <div>
                    <b style="font-size:14px;color:var(--ink)">Delete this account</b>
                    <p class="meta" style="margin-top:4px;color:var(--text)">Removes your profile and your shelf from this browser. Not reversible.</p>
                  </div>
                  <button class="btn btn-sm danger-btn" data-delete type="button">Delete account</button>
                </div>
              </div>
            </section>
          </div>

          <!-- aside ------------------------------------------------------ -->
          <aside class="grid" style="gap:var(--s6);position:sticky;top:96px">
            <div class="card card-pad" style="padding:var(--s7)">
              <span class="caption">Shelf</span>
              <div style="margin-top:var(--s5)">
                ${[['Finished', s.read.length], ['Reading now', s.reading.length], ['Want to read', s.want.length]]
                  .map(([l, n]) => `<div class="rowline" style="padding:10px 0">
                    <span class="small">${l}</span>
                    <b style="font-family:var(--font-display);font-size:18px">${n}</b></div>`).join('')}
              </div>
              <a class="btn btn-quiet btn-sm btn-block" href="library.html" style="margin-top:var(--s5)">Open my library</a>
            </div>

            ${s.reading.length ? `
            <div class="card card-pad" style="padding:var(--s7)">
              <span class="caption">Currently reading</span>
              <div class="grid" style="gap:var(--s5);margin-top:var(--s5)">
                ${s.reading.map(b => `
                  <a href="book.html?id=${b.id}" class="row" style="gap:12px;align-items:flex-start">
                    <span class="cover" style="width:44px;flex:none">${coverSVG(b)}</span>
                    <span style="min-width:0">
                      <b class="small ink" style="font-weight:500;display:block">${b.title}</b>
                      <span class="meta">${Shelf.progress(b)}% · ${Math.round(b.hours * (1 - Shelf.progress(b) / 100))} hrs left</span>
                      <span class="progress" style="display:block"><i style="width:${Shelf.progress(b)}%"></i></span>
                    </span>
                  </a>`).join('')}
              </div>
            </div>` : ''}

            <div class="card card-pad wash-sky" style="border:0;padding:var(--s7)">
              <span class="caption" style="color:var(--wash-sky-fg)">Verdict record</span>
              <p class="body" style="margin-top:10px;color:var(--ink)">
                Bookworm said <strong>read it</strong> on ${s.agreed} of the ${s.read.length}
                ${s.read.length === 1 ? 'book' : 'books'} you finished.
              </p>
              ${s.authors.length ? `<p class="meta" style="margin-top:var(--s4)">
                Most finished author: ${esc(s.authors[0][0])}${s.authors[0][1] > 1 ? ` (${s.authors[0][1]})` : ''}</p>` : ''}
            </div>

            <button class="btn btn-quiet btn-block" data-signout-page type="button">
              ${icon('logout', 16)} Sign out
            </button>
          </aside>
        </div>

        <!-- save bar ----------------------------------------------------- -->
        <div class="savebar" data-savebar>
          <p class="small ink" style="font-weight:500">You have unsaved changes.</p>
          <div class="row" style="gap:8px">
            <button class="btn btn-ghost btn-sm" data-discard type="button">Discard</button>
            <button class="btn btn-solid btn-sm" data-save type="button">Save changes</button>
          </div>
        </div>
      </div>`;

    wire();
    revealInit();
  }

  /* ---------------------------------------------------------------- wiring */
  function setHint(name, msg, kind) {
    const el = root.querySelector(`[data-hint="${name}"]`);
    if (!el) return;
    el.textContent = msg;
    el.className = 'hint' + (kind ? ' ' + kind : '');
  }

  function refreshSaveBar() {
    root.querySelector('[data-savebar]').classList.toggle('on', !clean());
  }

  function wire() {
    const nameEl = root.querySelector('#p-name');
    const handleEl = root.querySelector('#p-handle');
    const avatarEl = root.querySelector('[data-avatar]');

    const repaintAvatars = () => {
      avatarEl.innerHTML = avatarSVG({ name: draft.name || saved.email, art: ACCENTS[draft.accent] });
      root.querySelectorAll('[data-accent]').forEach(b => {
        b.innerHTML = avatarSVG({ name: draft.name || 'You', art: ACCENTS[+b.dataset.accent] });
      });
    };

    nameEl.addEventListener('input', () => {
      draft.name = nameEl.value;
      root.querySelector('[data-name-out]').textContent = draft.name || '—';
      repaintAvatars();
      refreshSaveBar();
    });

    handleEl.addEventListener('input', () => {
      handleEl.value = handleEl.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      draft.handle = handleEl.value;
      root.querySelector('[data-handle-out]').textContent = draft.handle;
      /* Your own handle is not "taken" by someone else. */
      const err = draft.handle === saved.handle ? null : handleError(draft.handle);
      if (err) { handleEl.setAttribute('aria-invalid', 'true'); setHint('handle', err, 'err'); }
      else {
        handleEl.removeAttribute('aria-invalid');
        setHint('handle', `bookworm.app/@${draft.handle}`, draft.handle === saved.handle ? '' : 'ok');
      }
      refreshSaveBar();
    });

    root.querySelectorAll('[data-accent]').forEach(b => b.addEventListener('click', () => {
      draft.accent = +b.dataset.accent;
      root.querySelectorAll('[data-accent]').forEach(x => {
        x.classList.toggle('on', x === b);
        x.setAttribute('aria-pressed', String(x === b));
      });
      repaintAvatars();
      refreshSaveBar();
    }));

    root.querySelectorAll('[data-interest]').forEach(b => b.addEventListener('click', () => {
      const c = b.dataset.interest;
      const i = draft.interests.indexOf(c);
      if (i > -1) draft.interests.splice(i, 1); else draft.interests.push(c);
      b.classList.toggle('on', draft.interests.includes(c));
      b.setAttribute('aria-pressed', String(draft.interests.includes(c)));
      setHint('interests', `${draft.interests.length} selected.`,
        draft.interests.length < 3 ? 'err' : '');
      refreshSaveBar();
    }));

    root.querySelectorAll('[data-goal] button').forEach(b => b.addEventListener('click', () => {
      draft.goal = +b.dataset.g;
      root.querySelectorAll('[data-goal] button').forEach(x => x.classList.toggle('on', x === b));
      refreshSaveBar();
    }));

    const updatesEl = root.querySelector('[data-updates]');
    updatesEl.addEventListener('change', () => { draft.updates = updatesEl.checked; refreshSaveBar(); });

    /* Theme is not part of the draft — it applies the moment you pick it. */
    root.querySelectorAll('[data-theme-seg] button').forEach(b => b.addEventListener('click', () => {
      Theme.set(b.dataset.t);
      root.querySelectorAll('[data-theme-seg] button').forEach(x => x.classList.toggle('on', x === b));
      toast(b.dataset.t === 'system' ? `Following your device — currently ${Theme.resolve()}` : `${b.textContent} mode`);
    }));

    /* save / discard */
    root.querySelector('[data-save]').addEventListener('click', () => {
      if (draft.name.trim().length < 2) {
        setHint('name', 'Tell us what to call you.', 'err');
        nameEl.focus();
        return;
      }
      const hErr = draft.handle === saved.handle ? null : handleError(draft.handle);
      if (hErr) { setHint('handle', hErr, 'err'); handleEl.focus(); return; }
      if (draft.interests.length < 3) {
        setHint('interests', `Pick ${3 - draft.interests.length} more — recommendations need somewhere to start.`, 'err');
        root.querySelector('[data-interests]').scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }

      Account.save({
        name: draft.name.trim(),
        handle: draft.handle,
        accent: ACCENTS[draft.accent],
        interests: draft.interests,
        goal: draft.goal,
        updates: draft.updates
      });
      saved = Account.get();
      document.dispatchEvent(new CustomEvent('account:change'));
      render();
      toast('Profile saved');
    });

    root.querySelector('[data-discard]').addEventListener('click', () => {
      draft = baseline();
      render();
      toast('Changes discarded');
    });

    /* change of email — same one-time code, in miniature */
    const flow = root.querySelector('[data-email-flow]');
    root.querySelector('[data-change-email]').addEventListener('click', () => {
      flow.hidden = false;
      flow.innerHTML = `
        <div class="tile">
          <label class="label" for="new-email">New email address</label>
          <input class="input" id="new-email" type="email" inputmode="email" placeholder="you@example.com">
          <p class="hint" data-hint="newemail">We will send a code there to confirm it before anything changes.</p>
          <div class="row" style="margin-top:var(--s4);gap:8px">
            <button class="btn btn-solid btn-sm" data-send-new type="button">Send code</button>
            <button class="btn btn-ghost btn-sm" data-cancel-email type="button">Cancel</button>
          </div>
        </div>`;
      flow.querySelector('#new-email').focus();
      flow.querySelector('[data-cancel-email]').addEventListener('click', () => {
        flow.hidden = true; flow.innerHTML = '';
      });
      flow.querySelector('[data-send-new]').addEventListener('click', () => {
        const v = flow.querySelector('#new-email').value.trim();
        if (!validEmail(v)) {
          flow.querySelector('#new-email').setAttribute('aria-invalid', 'true');
          setHint('newemail', 'That does not look like an email address.', 'err');
          return;
        }
        if (v === saved.email) { setHint('newemail', 'That is already your address.', 'err'); return; }
        const code = String(Math.floor(100000 + Math.random() * 900000));
        flow.innerHTML = `
          <div class="tile">
            <span class="caption">Confirm ${esc(v)}</span>
            <p class="meta" style="margin-top:6px">Prototype — your code is
              <strong style="font-family:var(--font-display);letter-spacing:.08em">${code}</strong></p>
            <div style="margin-top:var(--s4)">${otpMarkup('new')}</div>
            <p class="hint" data-hint="newcode">Enter the six digits to move your account to this address.</p>
            <button class="btn btn-ghost btn-sm" data-cancel-email type="button" style="margin-top:var(--s3)">Cancel</button>
          </div>`;
        const otp = wireOtpBoxes(flow.querySelector('[data-otp]'), entered => {
          if (entered !== code) {
            setHint('newcode', 'That code is not right. Try again.', 'err');
            otp.reject();
            return;
          }
          Account.save({ email: v });
          saved = Account.get();
          document.dispatchEvent(new CustomEvent('account:change'));
          render();
          toast('Email address updated');
        });
        otp.focus();
        flow.querySelector('[data-cancel-email]').addEventListener('click', () => {
          flow.hidden = true; flow.innerHTML = '';
        });
      });
    });

    /* export */
    root.querySelector('[data-export]').addEventListener('click', () => {
      const payload = {
        exported: new Date().toISOString(),
        profile: Account.get(),
        shelf: BOOKS.map(b => ({
          id: b.id, title: b.title, author: b.author, category: b.category,
          status: Shelf.status(b), progress: Shelf.progress(b),
          rating: b.rating || null, verdict: b.verdict, score: b.score
        }))
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookworm-${saved.handle || 'export'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Export downloaded');
    });

    /* sign out */
    root.querySelector('[data-signout-page]').addEventListener('click', () => {
      Account.signOut();
      saved = {};
      draft = baseline();
      document.dispatchEvent(new CustomEvent('account:change'));
      toast('Signed out');
      render();
    });

    /* delete — two presses, never one */
    const del = root.querySelector('[data-delete]');
    let armed = false;
    del.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        del.textContent = 'Press again to delete';
        del.classList.remove('btn-quiet');
        setTimeout(() => {
          if (!armed) return;
          armed = false;
          del.textContent = 'Delete account';
        }, 5000);
        return;
      }
      Account.signOut();
      try { localStorage.removeItem('bookworm:shelf:v1'); } catch {}
      Shelf.data = {};
      saved = {};
      draft = baseline();
      document.dispatchEvent(new CustomEvent('account:change'));
      document.dispatchEvent(new CustomEvent('shelf:change'));
      toast('Account and shelf deleted');
      render();
    });

    refreshSaveBar();
  }

  render();

  /* Signing out from the nav menu, on this page, should redraw it. */
  document.addEventListener('account:change', () => {
    const stored = Account.get() || {};
    if (stored.email === saved.email) return;
    saved = stored;
    draft = baseline();
    render();
  });
}

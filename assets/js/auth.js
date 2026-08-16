/* Bookworm — passwordless authentication.

   There are no passwords anywhere in this flow. Identity is proved by a
   one-time six-digit code sent to the user's email address.

   This is a prototype with no server: no mail is sent and the code is surfaced
   on screen instead. The state machine, validation and copy are the real
   deliverable — swapping the SIMULATED block below for an API call is the
   whole backend integration. */

/* The Account model itself lives in app.js, beside Shelf — every page needs to
   know who is signed in, only this page needs the flow. */

/* Handles already spoken for — stands in for a uniqueness check on the server. */
const TAKEN_HANDLES = ['admin', 'bookworm', 'reader', 'support', 'help', 'books', 'library'];

/* ------------------------------------------------------------- validation  */
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function handleError(h) {
  const v = h.trim().toLowerCase();
  if (!v) return 'Pick a handle — it is how other readers find you.';
  if (v.length < 3) return 'At least 3 characters.';
  if (v.length > 20) return 'Keep it under 20 characters.';
  if (!/^[a-z0-9_]+$/.test(v)) return 'Letters, numbers and underscores only.';
  if (TAKEN_HANDLES.includes(v)) return `@${v} is taken.`;
  return null;
}

const suggestHandle = name => name.trim().toLowerCase()
  .replace(/[^a-z0-9\s_]/g, '').replace(/\s+/g, '_').slice(0, 20);

/* ------------------------------------------------------------ code input   */
/* Six linked boxes. Shared with the profile page, which reuses the same
   component to confirm a change of email address. */
function otpMarkup(prefix = 'otp') {
  return `<div class="otp" data-otp>
    ${Array.from({ length: 6 }, (_, i) =>
      `<input id="${prefix}-${i}" type="text" inputmode="numeric" maxlength="1"
              aria-label="Digit ${i + 1} of 6"
              autocomplete="${i === 0 ? 'one-time-code' : 'off'}">`).join('')}
  </div>`;
}

function wireOtpBoxes(wrap, onFull) {
  const boxes = [...wrap.querySelectorAll('input')];
  const read = () => boxes.map(b => b.value).join('');
  const paint = () => boxes.forEach(b => b.classList.toggle('filled', !!b.value));

  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/\D/g, '').slice(0, 1);
      paint();
      wrap.dataset.state = '';
      if (box.value && i < 5) boxes[i + 1].focus();
      if (read().length === 6) onFull(read());
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && i > 0) { boxes[i - 1].focus(); boxes[i - 1].value = ''; paint(); }
      if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
      if (e.key === 'ArrowRight' && i < 5) boxes[i + 1].focus();
    });
    box.addEventListener('paste', e => {
      e.preventDefault();
      const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6).split('');
      digits.forEach((d, k) => { if (boxes[k]) boxes[k].value = d; });
      paint();
      boxes[Math.min(digits.length, 5)].focus();
      if (read().length === 6) onFull(read());
    });
  });

  return {
    read,
    focus: () => boxes[0].focus(),
    fill(code) { code.split('').forEach((d, k) => { if (boxes[k]) boxes[k].value = d; }); paint(); },
    reject() {
      wrap.dataset.state = 'err';
      boxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });
      boxes[0].focus();
    }
  };
}

/* ============================================================ auth page    */
function pageAuth() {
  const root = document.querySelector('[data-auth]');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const state = {
    mode: params.get('mode') === 'signup' ? 'signup' : 'signin',
    step: 1,
    email: '',
    code: '',
    sentCode: '',
    method: 'code',
    trust: true,
    name: '',
    handle: '',
    handleTouched: false,
    accent: 0,
    interests: [],
    goal: 24,
    terms: false,
    updates: false
  };

  const isSignup = () => state.mode === 'signup';
  const totalSteps = () => (isSignup() ? 3 : 2);

  /* One resend cooldown at a time — every re-render replaces the DOM it writes to. */
  let cooldown;

  /* ----------------------------------------------------------- SIMULATED
     Stands in for POST /auth/code — issues a one-time code and mails it. */
  function sendCode() {
    state.sentCode = String(Math.floor(100000 + Math.random() * 900000));
    return state.sentCode;
  }

  /* ------------------------------------------------------------- rendering */
  function render() {
    clearInterval(cooldown);
    document.title = `${isSignup() ? 'Create your account' : 'Sign in'} — Bookworm`;
    root.innerHTML = `
      <div class="wrap">
        <div class="auth-wrap">
          <div class="auth-col">${stepMarkup()}</div>
          <aside class="auth-aside">${asideMarkup()}</aside>
        </div>
      </div>`;
    wire();
    revealInit();
  }

  function stepsBar() {
    return `<div class="steps" role="progressbar" aria-valuenow="${state.step}" aria-valuemin="1" aria-valuemax="${totalSteps()}">
      ${Array.from({ length: totalSteps() }, (_, i) =>
        `<i class="${i < state.step ? 'on' : ''}"></i>`).join('')}
    </div>`;
  }

  function stepMarkup() {
    if (state.step === 1) return stepEmail();
    if (state.step === 2) return stepCode();
    if (state.step === 3) return stepProfile();
    return stepDone();
  }

  /* Step 1 — email ---------------------------------------------------------- */
  function stepEmail() {
    return `
      ${stepsBar()}
      <span class="eyebrow" style="margin-top:var(--s6)">
        <span class="dot"></span> ${isSignup() ? 'Sign up' : 'Welcome back'}
      </span>
      <h1 class="h1" style="margin-top:var(--s5)">
        ${isSignup() ? 'Create your account.' : 'Sign in to Bookworm.'}
      </h1>
      <p class="lede" style="margin-top:var(--s5)">
        ${isSignup()
          ? 'Enter your email and we will send you a six-digit code. Then pick a name and a handle — that is the whole sign-up.'
          : 'Enter the email on your account and we will send you a six-digit code to sign in.'}
      </p>

      <form style="margin-top:var(--s8)" novalidate data-form="email">
        <label class="label" for="email">Email address</label>
        <input class="input" id="email" name="email" type="email" inputmode="email"
               autocomplete="email webauthn" placeholder="you@example.com"
               value="${esc(state.email)}" required autofocus>
        <p class="hint" data-hint="email">We only use this to sign you in and to send your reading recap.</p>

        <button class="btn btn-solid btn-block" type="submit" style="margin-top:var(--s6)">
          Send my code ${icon('arrow', 16)}
        </button>
      </form>

      <div class="or-rule" style="margin-block:var(--s6)">or</div>

      <button class="btn btn-quiet btn-block" data-oauth="Google" type="button">
        ${icon('globe', 17)} Continue with Google
      </button>

      <p class="small" style="margin-top:var(--s7)">
        ${isSignup()
          ? `Already reading with us? <a data-switch="signin" href="auth.html?mode=signin" style="color:var(--teal);text-decoration:underline">Sign in</a>`
          : `New here? <a data-switch="signup" href="auth.html?mode=signup" style="color:var(--teal);text-decoration:underline">Create an account</a>`}
      </p>`;
  }

  /* Step 2 — code ----------------------------------------------------------- */
  function stepCode() {
    return `
      ${stepsBar()}
      <span class="eyebrow lilac" style="margin-top:var(--s6)">${icon('spark', 12)} Check your inbox</span>
      <h1 class="h1" style="margin-top:var(--s5)">Enter your six-digit code.</h1>
      <p class="lede" style="margin-top:var(--s5)">
        Sent to <strong class="ink">${esc(state.email)}</strong>.
        <button data-back class="btn-ghost" style="padding:0;font-size:inherit;color:var(--teal);text-decoration:underline">Change</button>
      </p>

      <div class="card card-pad wash-peach" style="border:0;margin-top:var(--s6);padding:var(--s5)">
        <span class="caption" style="color:var(--wash-peach-fg)">Prototype — no mail is sent</span>
        <p class="body" style="margin-top:6px;color:var(--ink)">Your code is
          <strong style="font-family:var(--font-display);letter-spacing:.08em">${state.sentCode}</strong>.
          <button data-autofill class="btn-ghost" style="padding:0;font-size:14px;color:var(--teal);text-decoration:underline">Fill it for me</button>
        </p>
      </div>

      <form style="margin-top:var(--s7)" novalidate data-form="code">
        <label class="label" for="otp-0">Verification code</label>
        ${otpMarkup()}
        <p class="hint" data-hint="code">The code expires in 10 minutes.</p>

        ${!isSignup() ? `
        <label class="check" style="margin-top:var(--s6)">
          <input type="checkbox" data-trust ${state.trust ? 'checked' : ''}>
          <span>Trust this device for 30 days, so you skip the code next time.</span>
        </label>` : ''}

        <button class="btn btn-solid btn-block" type="submit" style="margin-top:var(--s6)">
          Verify and continue ${icon('arrow', 16)}
        </button>
      </form>

      <p class="small" style="margin-top:var(--s6)">
        Didn't get it? <button data-resend class="btn-ghost" style="padding:0;font-size:14px;color:var(--teal);text-decoration:underline">Resend code</button>
        <span class="meta" data-timer></span>
      </p>`;
  }

  /* Step 3 — profile -------------------------------------------------------- */
  function stepProfile() {
    const person = { name: state.name || 'You', art: ACCENTS[state.accent] };
    return `
      ${stepsBar()}
      <span class="eyebrow mint" style="margin-top:var(--s6)">${icon('check', 12)} Email confirmed</span>
      <h1 class="h1" style="margin-top:var(--s5)">Set up your profile.</h1>
      <p class="lede" style="margin-top:var(--s5)">
        Your name and handle are how your shelf is labelled. Everything here can be changed later.
      </p>

      <form style="margin-top:var(--s8)" novalidate data-form="profile">
        <div class="row" style="gap:var(--s5);align-items:center">
          <span class="avatar" style="width:64px;height:64px" data-avatar>${avatarSVG(person)}</span>
          <div>
            <span class="label" style="margin-bottom:6px">Your avatar</span>
            <div class="avatar-pick" role="group" aria-label="Avatar colour">
              ${ACCENTS.map((a, i) => `
                <button type="button" class="${i === state.accent ? 'on' : ''}" data-accent="${i}"
                        aria-label="${a.name}" aria-pressed="${i === state.accent}">
                  ${avatarSVG({ name: state.name || 'You', art: a })}
                </button>`).join('')}
            </div>
          </div>
        </div>

        <div style="margin-top:var(--s7)">
          <label class="label" for="name">Display name</label>
          <input class="input" id="name" type="text" autocomplete="name" maxlength="40"
                 placeholder="Ada Lovelace" value="${esc(state.name)}" required>
          <p class="hint" data-hint="name">Shown on your shelf and on anything you share.</p>
        </div>

        <div style="margin-top:var(--s6)">
          <label class="label" for="handle">Handle</label>
          <div class="input-prefix">
            <span>@</span>
            <input class="input" id="handle" type="text" autocomplete="username" maxlength="20"
                   placeholder="ada" value="${esc(state.handle)}" required>
          </div>
          <p class="hint" data-hint="handle">Your unique identifier — bookworm.app/@handle.</p>
        </div>

        <div style="margin-top:var(--s7)">
          <span class="label">What do you read? <span class="opt">— pick at least 3</span></span>
          <div class="chip-select" data-interests>
            ${CATEGORIES.filter(c => c !== 'All').map(c =>
              `<button type="button" class="chip ${state.interests.includes(c) ? 'on' : ''}"
                       data-interest="${c}" aria-pressed="${state.interests.includes(c)}">${c}</button>`).join('')}
          </div>
          <p class="hint" data-hint="interests">This seeds your first recommendations — the shelf takes over from there.</p>
        </div>

        <div style="margin-top:var(--s7)">
          <span class="label">Books a year, honestly</span>
          <div class="seg" data-goal>
            ${[12, 24, 52, 100].map(g =>
              `<button type="button" data-g="${g}" class="${state.goal === g ? 'on' : ''}">${g}</button>`).join('')}
          </div>
          <p class="hint">Used for pacing, never shown to anyone else.</p>
        </div>

        <div class="stack" style="margin-top:var(--s7)">
          <label class="check">
            <input type="checkbox" data-terms ${state.terms ? 'checked' : ''} required>
            <span>I agree to the <a href="#" style="color:var(--teal);text-decoration:underline">Terms</a>
              and <a href="#" style="color:var(--teal);text-decoration:underline">Privacy Policy</a>.
              Your shelf is private by default.</span>
          </label>
          <label class="check">
            <input type="checkbox" data-updates ${state.updates ? 'checked' : ''}>
            <span>Send me a monthly reading recap. No marketing, unsubscribe in one click.</span>
          </label>
        </div>
        <p class="hint err" data-hint="form" hidden></p>

        <button class="btn btn-solid btn-block" type="submit" style="margin-top:var(--s7)">
          Create my shelf ${icon('arrow', 16)}
        </button>
      </form>`;
  }

  /* Done -------------------------------------------------------------------- */
  function stepDone() {
    const p = Account.get() || {};
    return `
      <span class="eyebrow mint">${icon('check', 12)} You're in</span>
      <h1 class="h1" style="margin-top:var(--s5)">
        ${isSignup() ? `Welcome, <span class="spark">${esc((p.name || '').split(' ')[0])}</span>.`
                     : `Good to see you, <span class="spark">${esc((p.name || '').split(' ')[0])}</span>.`}
      </h1>
      <p class="lede" style="margin-top:var(--s5)">
        ${isSignup()
          ? 'Your shelf is live. Bookworm has seeded it from what you told us — the first verdicts are waiting.'
          : 'Signed in without a password. Your shelf is exactly where you left it.'}
      </p>
      <div class="card card-pad" style="margin-top:var(--s7);padding:var(--s6)">
        <div class="row" style="gap:14px">
          <span class="avatar" style="width:52px;height:52px">${avatarSVG(Account.person())}</span>
          <div>
            <p class="h4" style="font-size:17px">${esc(p.name || '')}</p>
            <p class="meta">@${esc(p.handle || '')} · ${esc(p.email || '')}</p>
          </div>
        </div>
        <hr class="divider" style="margin:var(--s5) 0">
        <p class="meta">Signed in with a one-time email code · no password stored</p>
      </div>
      <div class="row" style="margin-top:var(--s7);gap:10px;flex-wrap:wrap">
        <a class="btn btn-solid" href="discover.html">See my recommendations ${icon('arrow', 16)}</a>
        <a class="btn btn-quiet" href="library.html">Go to my library</a>
      </div>`;
  }

  /* Aside ------------------------------------------------------------------- */
  function asideMarkup() {
    const covers = ['piranesi', 'project-hail-mary', 'circe'].map(byId);
    const lines = {
      1: ['Why no password?', 'A password is one more thing to lose or reuse. A single-use code lands in the inbox you already have open, and there is nothing to reset later.'],
      2: ['One code, ten minutes', 'Codes are single-use and expire quickly. Nothing about your account can be reset by guessing.'],
      3: ['Your shelf, private', 'Nothing is public unless you share it. Export or delete everything whenever you like.'],
      4: ['Ready when you are', 'Sixteen books are already analysed and waiting on your shelf.']
    }[state.step] || ['', ''];

    return `
      <div class="cover-stack">${covers.map(b => `<div class="cover">${coverSVG(b)}</div>`).join('')}</div>
      <div class="card card-pad" style="padding:var(--s7);margin-top:var(--s10)">
        <span class="caption">${esc(lines[0])}</span>
        <p class="body" style="margin-top:10px;color:var(--text)">${esc(lines[1])}</p>
        <div class="row" style="margin-top:var(--s6);gap:8px;flex-wrap:wrap">
          <span class="chip">${icon('check', 13)} No passwords</span>
          <span class="chip">${icon('check', 13)} Private by default</span>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------------------- wiring */
  function setHint(name, msg, kind) {
    const el = root.querySelector(`[data-hint="${name}"]`);
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    el.className = 'hint' + (kind ? ' ' + kind : '');
  }

  function wire() {
    /* switch between sign in / sign up without a page load */
    root.querySelectorAll('[data-switch]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      state.mode = a.dataset.switch;
      state.step = 1;
      history.replaceState(null, '', `auth.html?mode=${state.mode}`);
      render();
    }));

    const emailForm = root.querySelector('[data-form="email"]');
    if (emailForm) {
      emailForm.addEventListener('submit', e => {
        e.preventDefault();
        const input = emailForm.querySelector('#email');
        const v = input.value.trim();
        if (!validEmail(v)) {
          input.setAttribute('aria-invalid', 'true');
          setHint('email', 'That does not look like an email address.', 'err');
          input.focus();
          return;
        }
        input.removeAttribute('aria-invalid');
        state.email = v;

        /* A known address signing up is really a sign in, and vice versa. */
        const existing = Account.get();
        if (isSignup() && existing && existing.email === v) state.mode = 'signin';

        sendCode();
        state.step = 2;
        render();
      });

      root.querySelectorAll('[data-oauth]').forEach(b => b.addEventListener('click', () =>
        toast(`${b.dataset.oauth} sign-in is not wired up in this prototype`)));
    }

    const codeForm = root.querySelector('[data-form="code"]');
    if (codeForm) {
      const wrap = root.querySelector('[data-otp]');
      const otp = wireOtpBoxes(wrap, () => codeForm.requestSubmit());
      const readCode = otp.read;
      otp.focus();

      root.querySelector('[data-autofill]').addEventListener('click', () => {
        otp.fill(state.sentCode);
        codeForm.requestSubmit();
      });

      root.querySelector('[data-back]').addEventListener('click', () => { state.step = 1; render(); });

      const trust = root.querySelector('[data-trust]');
      if (trust) trust.addEventListener('change', () => { state.trust = trust.checked; });

      /* resend cooldown */
      const resend = root.querySelector('[data-resend]');
      const timer = root.querySelector('[data-timer]');
      let left = 30;
      cooldown = setInterval(() => {
        left--;
        timer.textContent = left > 0 ? `· available in ${left}s` : '';
        resend.disabled = left > 0;
        resend.style.opacity = left > 0 ? '.5' : '1';
        if (left <= 0) clearInterval(cooldown);
      }, 1000);
      resend.disabled = true;
      resend.style.opacity = '.5';
      timer.textContent = `· available in ${left}s`;
      resend.addEventListener('click', () => {
        if (resend.disabled) return;
        sendCode();
        render();
        toast('New code sent');
      });

      codeForm.addEventListener('submit', e => {
        e.preventDefault();
        const entered = readCode();
        if (entered.length < 6) { setHint('code', 'Enter all six digits.', 'err'); return; }
        if (entered !== state.sentCode) {
          setHint('code', 'That code is not right. Check the digits and try again.', 'err');
          otp.reject();
          return;
        }
        clearInterval(cooldown);
        if (isSignup()) {
          state.step = 3;
          render();
        } else {
          const existing = Account.get();
          if (!existing) {
            /* Verified an address we have never seen — carry it into sign-up
               rather than dead-ending on "no account found". */
            state.mode = 'signup';
            state.step = 3;
            toast('No shelf on that email yet — let us make one');
            render();
            return;
          }
          Account.save({ method: 'code', trustedDevice: state.trust, lastSignIn: new Date().toISOString() });
          state.step = 4;
          render();
          document.dispatchEvent(new CustomEvent('account:change'));
        }
      });
    }

    const profileForm = root.querySelector('[data-form="profile"]');
    if (profileForm) {
      const nameEl = root.querySelector('#name');
      const handleEl = root.querySelector('#handle');
      const avatarEl = root.querySelector('[data-avatar]');

      const repaintAvatars = () => {
        const person = { name: nameEl.value || 'You', art: ACCENTS[state.accent] };
        avatarEl.innerHTML = avatarSVG(person);
        root.querySelectorAll('[data-accent]').forEach(b => {
          b.innerHTML = avatarSVG({ name: nameEl.value || 'You', art: ACCENTS[+b.dataset.accent] });
        });
      };

      nameEl.addEventListener('input', () => {
        state.name = nameEl.value;
        if (!state.handleTouched) {
          state.handle = suggestHandle(nameEl.value);
          handleEl.value = state.handle;
          checkHandle(false);
        }
        repaintAvatars();
      });

      function checkHandle(showEmpty = true) {
        const v = handleEl.value.trim().toLowerCase();
        if (!v && !showEmpty) { setHint('handle', 'Your unique identifier — bookworm.app/@handle.'); return false; }
        const err = handleError(v);
        if (err) { handleEl.setAttribute('aria-invalid', 'true'); setHint('handle', err, 'err'); return false; }
        handleEl.removeAttribute('aria-invalid');
        setHint('handle', `@${v} is available.`, 'ok');
        return true;
      }

      handleEl.addEventListener('input', () => {
        state.handleTouched = true;
        handleEl.value = handleEl.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        state.handle = handleEl.value;
        checkHandle();
      });

      root.querySelectorAll('[data-accent]').forEach(b => b.addEventListener('click', () => {
        state.accent = +b.dataset.accent;
        root.querySelectorAll('[data-accent]').forEach(x => {
          x.classList.toggle('on', x === b);
          x.setAttribute('aria-pressed', String(x === b));
        });
        repaintAvatars();
      }));

      root.querySelectorAll('[data-interest]').forEach(b => b.addEventListener('click', () => {
        const c = b.dataset.interest;
        const i = state.interests.indexOf(c);
        if (i > -1) state.interests.splice(i, 1); else state.interests.push(c);
        b.classList.toggle('on', state.interests.includes(c));
        b.setAttribute('aria-pressed', String(state.interests.includes(c)));
        setHint('interests', state.interests.length < 3
          ? `${3 - state.interests.length} more to go — this seeds your first recommendations.`
          : `${state.interests.length} picked. Bookworm will start here and adjust.`,
          state.interests.length < 3 ? '' : 'ok');
      }));

      root.querySelectorAll('[data-goal] button').forEach(b => b.addEventListener('click', () => {
        state.goal = +b.dataset.g;
        root.querySelectorAll('[data-goal] button').forEach(x => x.classList.toggle('on', x === b));
      }));

      const termsEl = root.querySelector('[data-terms]');
      const updatesEl = root.querySelector('[data-updates]');
      termsEl.addEventListener('change', () => { state.terms = termsEl.checked; });
      updatesEl.addEventListener('change', () => { state.updates = updatesEl.checked; });

      profileForm.addEventListener('submit', e => {
        e.preventDefault();
        const formHint = root.querySelector('[data-hint="form"]');
        formHint.hidden = true;

        state.name = nameEl.value.trim();
        if (state.name.length < 2) {
          nameEl.setAttribute('aria-invalid', 'true');
          setHint('name', 'Tell us what to call you.', 'err');
          nameEl.focus();
          return;
        }
        nameEl.removeAttribute('aria-invalid');
        if (!checkHandle()) { handleEl.focus(); return; }
        if (state.interests.length < 3) {
          setHint('interests', `Pick ${3 - state.interests.length} more so the first recommendations are not guesswork.`, 'err');
          root.querySelector('[data-interests]').scrollIntoView({ block: 'center', behavior: 'smooth' });
          return;
        }
        if (!state.terms) {
          formHint.hidden = false;
          formHint.textContent = 'Please accept the Terms and Privacy Policy to continue.';
          termsEl.focus();
          return;
        }

        Account.save({
          email: state.email,
          name: state.name,
          handle: handleEl.value.trim().toLowerCase(),
          accent: ACCENTS[state.accent],
          interests: state.interests,
          goal: state.goal,
          updates: state.updates,
          method: state.method,
          joined: new Date().toISOString(),
          lastSignIn: new Date().toISOString()
        });
        state.step = 4;
        render();
        document.dispatchEvent(new CustomEvent('account:change'));
        toast('Shelf created — welcome to Bookworm');
      });
    }
  }

  render();
}

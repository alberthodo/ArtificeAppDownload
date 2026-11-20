// Home hero: four short chapters, one benefit each, shown in the real apps one at a time.
//   1. Fewer tokens on code          (Claude Code without and with Artifice, side by side: a real benchmark run)
//   2. Answers from your documents   (Claude Code with Artifice, then without it, one window: a real benchmark run)
//   3. Your plan lasts longer        (a usage card over an example day: the 28% as time before the limit)
//   4. Nothing hidden                (Artifice: every briefing is listed and can be opened)
// (2026-11-20: chapters 1 and 2 are new; chapters 3 and 4 are being redone next.)
// The caption under the desktop states the chapter's benefit and stays put while it plays.
// Artifice's window is built once per chapter and only the parts that change move.
// Chapters can be clicked; the loop pauses while the hero is off screen.
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const main = $('#app-main'), stage = $('#stage');
  const thread = $('#cw-thread'), chatTyped = $('#cw-typed'), send = $('.cw-send');
  const cap = $('#story-cap'), chapters = $$('.story .ch');
  if (!main || !thread || !cap || !$('.duo')) return;
  const icon = n => window.SITE.icon(n);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const win = document.documentElement.dataset.os === 'windows';
  $$('[data-cwd]').forEach(e => { e.textContent = win ? 'C:\\Users\\maya\\acme' : '/Users/maya/acme'; });
  // the sidebar items the demo moves between
  $$('.desk .app-nav div').forEach(d => { const t = d.textContent.trim(); if (t === 'Library') d.dataset.nav = 'library'; });

  // ---- a run can be interrupted (a chapter clicked): every wait checks it's still current ----
  let gen = 0;
  const STOP = Symbol('stop');
  const wait = (ms, g) => new Promise((res, rej) => setTimeout(() => (g === gen ? res() : rej(STOP)), reduce ? Math.min(ms, 1200) : ms));
  async function type(el, text, g, ms = 38) { for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await wait(ms, g); } }

  // ---- content ----
  const CODE = {
    q: 'Where do we round invoice totals?', files: 3,
    passages: [
      ['billing.ts · roundTotal()', '<code>return Math.round(total * 100 + Number.EPSILON) / 100; // half up, to the cent</code>'],
      ['docs/billing.md · Rounding', '“Totals are rounded half up to the cent after tax, never per line.”'],
      ['billing.test.ts · rounds half up', '<code>expect(roundTotal(10.005)).toBe(10.01)</code>'],
      ['billing.ts · ROUNDING_MODE', '<code>export const ROUNDING_MODE = "half-up";</code>'],
    ],
    answer: 'Totals are rounded half up to the cent, once, after tax, in <b>roundTotal()</b> (src/billing.ts:46). The mode is set by ROUNDING_MODE and covered by billing.test.ts.',
  };
  const DOCS = {
    q: 'What is our hotel limit in Geneva?', files: 2, n: 3,
    answer: '<p>The limit in Geneva is <b>260 CHF a night</b>, breakfast included. Elsewhere in Europe it is 180 EUR.</p><p>Bookings go through Expensely at least 14 days ahead.<span class="cw-cite">travel-policy.docx</span></p>',
  };

  // ---- the chapters' benefits, said once each ----
  const CAPS = [
    'On questions about your code, Claude Code uses <b>28% fewer tokens</b> with Artifice, and still answers accurately.',
    'Artifice has already read your PDFs, spreadsheets and scans, so your AI <b>goes straight to the answer</b>. No scripts to open your files, and no approvals to click through.',
    'On questions about your code, Artifice cuts token use by 28%, so the same plan covers <b>about 40% more questions</b> before you hit your limit.',
    'Every briefing is in Artifice, so you can see <b>exactly what your AI was given</b> and what it saved.',
  ];
  const LENGTH = [21000, 33000, 18000, 12500];   // roughly how long each chapter plays, for its progress bar
  let capWant = 0, capTimer = 0;
  function chapter(i) {
    chapters.forEach((c, k) => {
      c.classList.toggle('on', k === i); c.classList.toggle('done', k < i);
      const bar = $('.ch-bar i', c);
      bar.style.transition = 'none'; bar.style.width = k < i ? '100%' : '0';
      if (k === i) { bar.offsetWidth; bar.style.transition = `width ${reduce ? 1 : LENGTH[i]}ms linear`; bar.style.width = '100%'; }
    });
    // the latest chapter always wins, even if chapters are clicked quickly
    capWant = i;
    if (cap.dataset.i !== String(i)) {
      cap.classList.add('swap');
      clearTimeout(capTimer);
      capTimer = setTimeout(() => { cap.innerHTML = CAPS[capWant]; cap.dataset.i = String(capWant); cap.classList.remove('swap'); }, 300);
    }
  }

  // ---- which app is in front (on a Mac the menu bar follows it) ----
  const MENUS = { artifice: ['Artifice', 'File Edit View Window Help'], claude: ['Claude', 'File Edit View Window Help'], terminal: ['Terminal', 'Shell Edit View Window Help'], compare: ['Terminal', 'Shell Edit View Window Help'], docs: ['Terminal', 'Shell Edit View Window Help'], plan: ['Safari', 'File Edit View History Bookmarks Window Help'] };
  const mbApp = $('#mb-app'), mbMenus = $('#mb-menus');
  function front(app) {
    $$('.desk .appwin').forEach(w => w.classList.toggle('front', w.dataset.app === app));
    $('.desk').classList.remove('cam'); $('.duo').classList.remove('focus-1', 'focus-2');   // each chapter starts its own camera move
    $('.desk-dim').classList.remove('on', 'dark'); $('.solo-card').classList.remove('on');
    if (mbApp) { mbApp.textContent = MENUS[app][0]; mbMenus.innerHTML = MENUS[app][1].split(' ').map(m => `<span>${m}</span>`).join(''); }
  }
  const nav = which => $$('.desk .app-nav div[data-nav]').forEach(d => d.classList.toggle('on', d.dataset.nav === which));
  const row = (box, cls, html, at = 'end') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; at === 'start' ? box.prepend(d) : box.appendChild(d); return d; };
  const show = (box, cls, html) => { const d = row(box, cls, html); requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('on'))); return d; };
  async function swapView(html, g) {   // only when Artifice changes page: a short cross-fade, then nothing moves but what changes
    const old = $('.app-view', main);
    if (old) { old.classList.add('out'); await wait(300, g); }
    main.innerHTML = html;
  }

  // ---- 3. Your plan lasts longer: an example day of questions about your code ----
  // One usage card over the desktop, a clock running from 9 am to 6 pm, and two usage bars for the same
  // steady stream of questions. The only measured number is the 28% (pack-quality benchmark, 144 code
  // questions: with Artifice, Claude Code used 72% of the tokens). Everything else follows from it:
  //   your AI alone reaches its limit at 4 pm in this example; at that moment the same work with Artifice
  //   has used 72%; by 6 pm it has used 0.72 × 9/7 ≈ 93% and is still going.
  // The card says it's an example day; the caption carries the measured figure (28%, so about 40% more
  // questions on the same plan: 1 / 0.72 ≈ 1.39).
  const PLAN = { start: 9, end: 18, limitAt: 16, ratio: 0.72, dayMs: 9000 };
  const usage = $('.usage'), uClock = $('.u-clock', usage);
  const uRow = side => $(`.u-row[data-side="${side}"]`, usage);
  const fmtHour = h => { const m = Math.round((h % 1) * 60), hh = Math.floor(h) + (m === 60 ? 1 : 0), mm = m === 60 ? 0 : m; const ap = hh < 12 ? 'am' : 'pm'; const h12 = ((hh + 11) % 12) + 1; return `${h12}:${String(mm).padStart(2, '0')} ${ap}`; };
  function setRow(side, pct) {
    const r = uRow(side);
    $('.u-track i', r).style.transform = `scaleX(${Math.min(1, pct / 100)})`;
    $('.u-val', r).textContent = `${Math.round(Math.min(100, pct))}%`;
  }
  function resetPlan() {
    usage.classList.remove('limit', 'done');
    uClock.textContent = fmtHour(PLAN.start);
    setRow('off', 0); setRow('on', 0);
  }
  async function ch3(g) {
    chapter(2); front('plan');
    const desk = $('.desk');
    resetPlan();
    void desk.offsetWidth; requestAnimationFrame(() => { if (g === gen) desk.classList.add('cam'); });
    await wait(1100, g);
    // the day runs; it pauses for a moment when your AI alone reaches its limit
    const hours = PLAN.end - PLAN.start, span = PLAN.limitAt - PLAN.start;
    const step = 40, ticks = Math.round(PLAN.dayMs / step);
    let paused = false;
    for (let i = 1; i <= ticks; i++) {
      const h = PLAN.start + hours * (i / ticks);
      const alone = (h - PLAN.start) / span * 100;
      uClock.textContent = fmtHour(h);
      setRow('off', alone);
      setRow('on', alone * PLAN.ratio);
      if (!paused && alone >= 100) {
        paused = true;
        usage.classList.add('limit');
        await wait(1500, g);
      }
      await wait(step, g);
    }
    usage.classList.add('done');
    await wait(6500, g);
  }

  // ---- 2. Ask like you'd ask a colleague: a question about the company's documents ----
  // A real run from the document benchmark (Nov 4 2026, question company-2-02, Claude Sonnet 5.5, Artifice 0.1.8).
  // The answer is in a scanned contract PDF. One window, two beats:
  //   1. with Artifice: one turn, the answer and its source (the run's own answer, trimmed);
  //   2. the same question without Artifice: the run's own first steps, then the scripts it wrote to open the
  //      spreadsheets, each stopping for your approval. You approve, it thinks, it asks again; at the third
  //      approval the scene fades to dark, and the chapter ends there.
  // The searches, the remark about binary formats and the three commands are the run's own (in the run, four
  // such commands were held for approval and none were approved). What happens after you click Yes is shown
  // only as "Running…", since the run never got that far. Nothing says Claude can't find the answer.
  const DOC = {
    q: 'how much are we paying the port people each month?',
    on: {
      brief: 'Artifice briefed your AI from your documents',
      say: 'According to the Tidewater Ports service agreement, you pay <b>€18,500 a month</b>.',
      more: ['· <b>Term:</b> 24 months from 1 March 2026, so it runs to the end of February 2028.', '· <b>Exit:</b> either side can end it with 90 days\' notice.', 'That is the contractual fee from <code>Legal/scanned-contract.pdf</code>.'],
    },
    off: [
      ['I\'ll search the company docs for anything about port vendors.', 'Bash(ls -la && grep -rIil "port" . 2>/dev/null | head -50)', 'total 0 … +10 lines'],
      [null, 'Bash(find . -type f | head -200; grep -rIiE "port|harbor|terminal|shipping" . | head -50)', './Research/attention.pdf … +45 lines'],
    ],
    binary: 'Most of these are binary formats, so grep missed them. <code>Finance/vendors.ods</code> and <code>Finance/budget-2026.xlsx</code> are the likeliest places, so I\'ll extract their text.',
    scripts: [
      ['mkdir -p /tmp/ods_x /tmp/xlsx_x && cd /tmp/ods_x && unzip -oq Finance/vendors.ods && cd /tmp/xlsx_x && unzip -oq Finance/budget-2026.xlsx && python3 -I - <<\'EOF\' …', 'unzip'],
      ['unzip -p Finance/vendors.ods content.xml | python3 -I -c "import re,sys; s=sys.stdin.read() …"', 'unzip'],
      ['unzip -p Finance/budget-2026.xlsx xl/sharedStrings.xml | python3 -I -c "import re,sys …" | head -100', 'unzip'],
    ],
  };
  const solo = $('.solo'), soloLog = $('.cc-log', solo), soloTyped = $('.cc-typed', solo), soloInput = $('.cc-input', solo);
  const soloName = $('.solo-who', solo), soloIcon = $('.solo-icon', solo), soloDone = $('.duo-name .done', solo);
  const soloTurns = $('.n-turns', solo), soloAppr = $('.n-appr', solo), soloHint = $('.hint-r', solo), soloMore = $('.duo-nums .more', solo);
  const dim = $('.desk-dim'), card = $('.solo-card');
  const DONE_ICON = soloDone.querySelector('svg').outerHTML;
  function soloSide(side) {   // header, footer hint and a fresh terminal for one side
    const on = side === 'on';
    soloName.textContent = on ? 'Your AI with Artifice' : 'Your AI alone';   // chapter 2 names no AI tool: it's about yours
    soloIcon.innerHTML = on ? '<img src="assets/mark.svg" alt="">' : '<span class="ring"></span>';
    solo.dataset.side = side;
    soloHint.textContent = on ? 'artifice connected' : '';
    soloDone.className = 'done'; soloDone.innerHTML = DONE_ICON + 'Answered';
    soloTurns.textContent = '0'; soloAppr.textContent = '0'; soloMore.classList.remove('on');
    // a coding AI's command line opens with a short welcome and the folder it's working in;
    // this one names no product, since chapter 2 is about whichever AI you use
    const home = win ? 'C:\\Users\\maya\\acme' : '/Users/maya/acme';
    soloLog.innerHTML = `<div class="cc-welcome"><div><span class="cc-star">✻</span> Welcome! Ask anything about this folder.</div><div class="cc-dim">/help for help</div><div class="cc-dim cc-cwd">cwd: ${home}</div></div>`;
    soloTyped.textContent = '';
    $$('.cc-perm', solo).forEach(p => p.remove());
    soloInput.hidden = false;
  }
  const soloAdd = (cls, html, before) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; soloLog.insertBefore(d, before || null); requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('on'))); return d; };
  function askApproval(cmd, kind) {   // Claude Code's permission prompt takes the place of the input box
    soloInput.hidden = true;
    const perm = document.createElement('div'); perm.className = 'cc-perm';
    perm.innerHTML = `<b>Bash command</b><div class="cmd">${esc(cmd)}</div><div class="ask">Do you want to proceed?</div><div class="opt on">❯ 1. Yes</div><div class="opt">2. Yes, and don't ask again for ${kind} commands</div><div class="opt">3. No, and tell Claude what to do differently <span class="cc-dim">(esc)</span></div>`;
    soloInput.after(perm); requestAnimationFrame(() => requestAnimationFrame(() => perm.classList.add('on')));
    soloDone.className = 'done wait'; soloDone.innerHTML = '<i class="pulse"></i>Waiting for your approval';
    requestAnimationFrame(() => requestAnimationFrame(() => soloDone.classList.add('on')));
    return perm;
  }
  async function ch2(g) {
    chapter(1); front('docs');
    const desk = $('.desk');
    soloSide('on'); dim.classList.remove('on', 'dark'); card.classList.remove('on');
    void desk.offsetWidth; requestAnimationFrame(() => { if (g === gen) desk.classList.add('cam'); });
    await wait(900, g);
    // 1. with Artifice
    for (let i = 1; i <= DOC.q.length; i++) { soloTyped.textContent = DOC.q.slice(0, i); await wait(24, g); }
    await wait(400, g); soloTyped.textContent = '';
    soloAdd('ln you', `&gt; <b>${esc(DOC.q)}</b>`);
    soloAdd('ln res', `&nbsp;⎿&nbsp; <span class="art">${DOC.on.brief}</span>`);
    const spin = soloAdd('ln spin', '✻ Thinking…');
    await wait(2300, g);
    spin.remove();
    soloAdd('ln say', `<span class="dot">●</span> ${DOC.on.say}`);
    for (const m of DOC.on.more) { soloAdd('ln more', m); await wait(160, g); }
    soloTurns.textContent = '1';
    await wait(300, g); soloDone.classList.add('on');
    await wait(2600, g);
    // 2. the same question, without Artifice: an intertitle over the dimmed scene, then the run
    dim.classList.add('on'); card.classList.add('on');
    await wait(800, g);
    soloSide('off');
    await wait(1500, g);
    card.classList.remove('on'); dim.classList.remove('on');
    await wait(600, g);
    soloAdd('ln you', `&gt; <b>${esc(DOC.q)}</b>`);
    let spin2 = soloAdd('ln spin', '✻ Thinking…');
    let turns = 0;
    for (const [say, tool, res] of DOC.off) {
      await wait(1300, g);
      if (say) soloAdd('ln say', `<span class="dot">●</span> ${say}`, spin2);
      const m = tool.match(/^(\w+)\((.*)\)$/);
      soloAdd('ln tool', `<span class="dot">●</span> <b>${m[1]}</b>(${esc(m[2])})`, spin2);
      soloAdd('ln res', `&nbsp;⎿&nbsp; ${res}`, spin2);
      soloTurns.textContent = String(++turns);
    }
    await wait(1300, g);
    soloAdd('ln say', `<span class="dot">●</span> ${DOC.binary}`, spin2);
    // three scripts to open the spreadsheets, each one stopping for your approval
    for (let k = 0; k < DOC.scripts.length; k++) {
      await wait(k === 0 ? 1100 : 1400, g);
      spin2.remove();
      const [cmd, kind] = DOC.scripts[k];
      soloAdd('ln tool', `<span class="dot">●</span> <b>Bash</b>(${esc(cmd.length > 70 ? cmd.slice(0, 70) + '…' : cmd)})`);
      const perm = askApproval(cmd, kind);
      soloTurns.textContent = String(++turns); soloAppr.textContent = String(k + 1);
      if (k === DOC.scripts.length - 1) { await wait(900, g); soloMore.classList.add('on'); break; }   // the third one is left waiting, and the count keeps going
      await wait(1900, g);
      // you approve: "Yes" is pressed, the prompt closes, the script runs, Claude thinks again
      $('.opt.on', perm).classList.add('press');
      await wait(420, g);
      perm.remove(); soloInput.hidden = false; soloDone.classList.remove('on');
      soloAdd('ln res', '&nbsp;⎿&nbsp; Running…');
      spin2 = soloAdd('ln spin', '✻ Thinking…');
    }
    // the third approval: it waits, the scene fades to dark, and the chapter ends there
    await wait(1500, g);
    dim.classList.add('dark');
    await wait(4400, g);
  }

  // ---- 1. Fewer tokens on code: the same question, without and with Artifice ----
  // A real run from the pack-quality benchmark (Oct 28 2026, question httpie-3-04, Claude Sonnet 5.5,
  // Artifice 0.1.7). Each pane shows that run's own tool calls in order, its answer trimmed, and its measured
  // totals: 7 turns and 79,351 tokens in 24.2 s without Artifice; 4 turns and 56,781 tokens in 13.1 s with it.
  // Both are replayed at the same speed (SPEED), so the difference in time is the real one.
  // Token counters climb turn by turn and end on the measured totals. Both answers scored 10/10.
  const CMP = {
    q: 'How does the release thank-you snippet decide who to list? Are maintainers and bots left out?',
    off: { ms: 24200, tokens: 79351, steps: [
      ['tool', 'Search(pattern: "thank|contributor", glob: "*.py")', 'Found 2 files'],
      ['tool', 'Search(pattern: "**/*release*")', 'Found 6 files'],
      ['tool', 'Read(docs/contributors/generate.py)', 'Read 54 lines'],
      ['tool', 'Read(docs/contributors/fetch.py)', 'Read 282 lines'],
      ['tool', 'Search(pattern: "dependabot|bot\\b", path: "docs/contributors")', 'Found 3 lines'],
      ['tool', 'Read(docs/contributors/snippet.jinja2)', 'Read 15 lines'],
      ['say', 'Yes, maintainers and bots are both left out. Each exclusion is a hardcoded list of GitHub logins.',
        'The code is in <code>docs/contributors/generate.py:26-38</code>. <code>generate_snippets(release)</code> keeps a person only if both conditions hold…'],
    ] },
    on: { ms: 13100, tokens: 56781, brief: 'Artifice briefed Claude: 3 files, 393 tokens', steps: [
      ['tool', 'Read(docs/contributors/generate.py)', 'Read 54 lines', 'The template only loops over a <code>contributors</code> dict, so the filtering must happen in <code>generate.py</code>. I\'ll read that file.'],
      ['tool', 'Search(pattern: "dependabot", path: "docs/contributors")', 'Found 3 lines'],
      ['tool', 'Search(pattern: "committed|reported|github", path: "docs/contributors/fetch.py")', 'Found 32 lines'],
      ['say', 'Yes, both are left out. The filtering happens in <code>docs/contributors/generate.py</code>, not in the template.',
        'It loads the contributor database (<code>people.json</code>) and keeps a person only if both of these hold…'],
    ] },
  };
  const SPEED = 0.42;   // both runs replayed at the same pace: 24.2 s becomes about 10 s
  const duo = { off: $('.duo-col[data-side="off"]'), on: $('.duo-col[data-side="on"]') };
  const fmt = n => Math.round(n).toLocaleString('en-US');
  function count(el, from, to, ms) {   // a counter that eases to its new value
    const t0 = performance.now();
    const step = () => { const k = Math.min(1, (performance.now() - t0) / ms); el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1 && el.isConnected) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function resetPane(col) {
    const home = win ? 'C:\\Users\\maya\\httpie' : '/Users/maya/httpie';
    $('.cc-log', col).innerHTML = `<div class="cc-welcome"><div><span class="cc-star">✻</span> Welcome to <b>Claude Code</b>!</div><div class="cc-dim cc-cwd">cwd: ${home}</div></div>`;
    $('.cc-typed', col).textContent = '';
    $('.n-turns', col).textContent = '0'; $('.n-tok', col).textContent = '0';
    $('.done', col).classList.remove('on');
    // the savings keep their text while hidden, so their space is already taken and nothing shifts when they appear
    $$('.d', col).forEach(d => d.classList.remove('on'));
    const dT = $('.d-turns', col), dK = $('.d-tok', col);
    if (dT) dT.textContent = `−${CMP.off.steps.length - CMP.on.steps.length}`;
    if (dK) dK.textContent = `−${Math.round((1 - CMP.on.tokens / CMP.off.tokens) * 100)}%`;
  }
  async function replay(col, run, g) {
    const box = $('.cc-log', col), turns = $('.n-turns', col), tok = $('.n-tok', col);
    const n = run.steps.length, gap = run.ms * SPEED / n;
    const add = (cls, html, before) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; box.insertBefore(d, before || null); requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('on'))); return d; };
    const spin = add('ln spin', '✻ Thinking…');
    if (run.brief) add('ln res', `&nbsp;⎿&nbsp; <span class="art">${run.brief}</span>`, spin);
    let used = 0;
    for (let k = 0; k < n; k++) {
      await wait(gap, g);
      const [kind, a, b, first] = run.steps[k];
      if (first) add('ln say', `<span class="dot">●</span> ${first}`, spin);
      if (kind === 'tool') {
        const m = a.match(/^(\w+)\((.*)\)$/);
        add('ln tool', `<span class="dot">●</span> <b>${m[1]}</b>(${esc(m[2])})`, spin);
        add('ln res', `&nbsp;⎿&nbsp; ${b}`, spin);
      } else {
        spin.remove();
        add('ln say', `<span class="dot">●</span> ${a}`);
        add('ln more', b);
      }
      turns.textContent = String(k + 1);
      // each turn re-sends the conversation so far, so later turns cost more; the total is the measured one
      const next = run.tokens * ((k + 1) * (k + 2)) / (n * (n + 1));
      count(tok, used, next, Math.min(900, gap * .8)); used = next;
    }
    await wait(500, g);
    $('.done', col).classList.add('on');
  }
  async function ch0(g) {
    chapter(0); front('compare');
    resetPane(duo.off); resetPane(duo.on);
    // the camera starts from rest each time, then pushes in slowly for the whole chapter
    const desk = $('.desk'), pair = $('.duo');
    desk.classList.remove('cam'); pair.classList.remove('focus-1', 'focus-2');
    void desk.offsetWidth;
    requestAnimationFrame(() => { if (g === gen) desk.classList.add('cam'); });
    await wait(900, g);
    // the same question, typed into both at once
    const tOff = $('.cc-typed', duo.off), tOn = $('.cc-typed', duo.on);
    for (let i = 1; i <= CMP.q.length; i++) { tOff.textContent = tOn.textContent = CMP.q.slice(0, i); await wait(22, g); }
    await wait(450, g);
    tOff.textContent = tOn.textContent = '';
    for (const col of [duo.off, duo.on]) show($('.cc-log', col), 'ln you', `&gt; <b>${esc(CMP.q)}</b>`);
    await wait(300, g);
    // focus pull: when Artifice has answered, the other side settles back a little (it keeps working);
    // when both are done it settles further and the result appears
    const withDone = replay(duo.on, CMP.on, g).then(() => { if (g === gen) pair.classList.add('focus-1'); });
    const both = await Promise.allSettled([replay(duo.off, CMP.off, g), withDone]);
    if (both.some(r => r.status === 'rejected')) throw STOP;   // a chapter was clicked: stop both panes quietly
    pair.classList.add('focus-2');
    await wait(500, g);
    // the savings, beside Artifice's own numbers
    $$('.d', duo.on).forEach(d => d.classList.add('on'));
    await wait(8500, g);   // a long hold on the result, so it can be read and understood
  }

  // ---- 4. Nothing hidden ----
  async function ch4(g) {
    chapter(3); front('artifice'); nav('activity');
    await swapView(`<div class="app-page app-view"><div class="app-title">Activity</div><div class="app-meta">Briefed 13 times this week · about 138k tokens saved</div><div class="app-h">Today</div><div class="app-list" id="act"><div><span><div class="t">Claude asked “What's in the Q3 board deck?”</div><div class="s">5 passages from 2 files</div></span><span class="w">9:12</span></div></div></div>`, g);
    const act = $('#act');
    await wait(500, g);
    row(act, 'live-row', `<span><div class="t">Claude asked “${DOCS.q}”</div><div class="s">${DOCS.n} passages from ${DOCS.files} files</div></span><span class="w">1 min ago</span>`, 'start');
    await wait(500, g);
    const pick = row(act, 'live-row', `<span><div class="t">Claude Code asked “${CODE.q}”</div><div class="s">${CODE.passages.length} passages from ${CODE.files} files</div></span><span class="w">just now</span>`, 'start');
    await wait(1700, g);
    pick.classList.add('pick');
    await wait(600, g);
    await swapView(`<div class="app-page app-view"><div class="app-back">← Activity</div><div class="app-ask">Claude Code asked · just now</div><div class="app-q">“${CODE.q}”</div><div class="app-given">It was given ${CODE.passages.length} passages from ${CODE.files} files</div><div id="bp"></div></div>`, g);
    const bp = $('#bp');
    for (let i = 0; i < CODE.passages.length; i++) {
      const [w, t] = CODE.passages[i];
      row(bp, 'app-pass live-row', `<span class="n">${i + 1}</span><span><div class="where">${w}</div><div class="txt">${t}</div></span>`);
      await wait(560, g);
    }
    row(bp, 'app-foot live-row', 'Saved about 10,600 tokens <u>How we count</u>');
    await wait(4800, g);
  }

  // ---- the loop ----
  const CH = [ch0, ch2, ch3, ch4];
  let visible = false;
  const waitVisible = g => new Promise((res, rej) => { const t = setInterval(() => { if (g !== gen) { clearInterval(t); rej(STOP); } else if (visible && !document.hidden) { clearInterval(t); res(); } }, 250); });
  async function run(from) {
    const g = ++gen;
    let i = from;
    try {
      for (;;) {
        if (!visible || document.hidden) await waitVisible(g);
        await CH[i](g);
        i = (i + 1) % CH.length;
      }
    } catch (e) { if (e !== STOP) throw e; }
  }
  chapters.forEach((c, k) => c.addEventListener('click', () => run(k)));

  // first frame, before it starts
  chapter(0); front('compare'); nav('library'); resetPane(duo.off); resetPane(duo.on);
  main.innerHTML = `<div class="app-page app-view"><div class="app-title">Library</div><div class="app-meta">Reading… 0 of 214 files</div><div class="app-ask-box">${icon('search')}Search or ask about acme</div><div class="app-files"></div></div>`;
  let started = false;
  const start = () => { if (!started) { started = true; run(0); } };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: .25 }).observe(stage);
  } else { visible = true; start(); }
})();

// Home hero: four short chapters, one benefit each, shown in the real apps one at a time.
//   1. Your plan lasts longer        (a usage card over an example day: the 28% as time before the limit)
//   2. Fewer tokens on code          (Claude Code without and with Artifice, side by side: a real benchmark run)
//   3. Skips the busywork            (your AI with Artifice, then without it, one window: a real benchmark run)
//   4. Always up to date             (a file changes; Artifice flags the memory learned from it, and your AI is told)
// The caption under the desktop states the chapter's benefit and stays put while it plays.
// Artifice's window is built once per chapter and only the parts that change move.
// Chapters can be clicked. The hero pauses when the desktop is clicked (or tapped), while it's off screen or
// in a background tab, and with the pause button at the end of the story bar (WCAG 2.2.2). Every wait, the
// chapter 3 clock, the camera and the progress bars run on one pausable clock.
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
  // one clock for the whole hero: it stops while the hero is paused
  let isPaused = false, pausedAt = 0, pausedTotal = 0;
  const clock = () => performance.now() - pausedTotal - (isPaused ? performance.now() - pausedAt : 0);
  const wait = (ms, g) => new Promise((res, rej) => {
    const end = clock() + (reduce ? Math.min(ms, 1200) : ms);
    const tick = () => { if (g !== gen) return rej(STOP); const left = end - clock(); if (left <= 0) return res(); setTimeout(tick, isPaused ? 120 : left); };
    tick();
  });
  async function type(el, text, g, ms = 38) { for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await wait(ms, g); } }

  // ---- content ----

  // ---- the chapters' benefits, said once each ----
  const CAPS = [
    'Keep working when you\'d normally hit your limit. Artifice uses fewer tokens on questions about your code, so <b>the same plan goes about 40% further</b>.',
    'On questions about your code, Claude Code uses <b>28% fewer tokens</b> with Artifice, and still answers accurately.',
    'Artifice has already read your PDFs, spreadsheets and scans, so your AI <b>goes straight to the answer</b>, with far fewer scripts and approval prompts.',
    'When a file changes, Artifice flags anything your AI learned from it and hands over the current version, so your AI answers from <b>today\'s file, not last month\'s</b>.',
  ];
  let capWant = 0, capTimer = 0;
  // each chapter's bar fills over that chapter's real length (LEN, worked out from its own timings below),
  // on the hero's clock, so it stops when the hero is paused and is full exactly when the chapter ends
  let chIdx = 0, chStart = 0, chLen = 1;
  function chapter(i) {
    chapters.forEach((c, k) => {
      c.classList.toggle('on', k === i); c.classList.toggle('done', k < i);
      $('.ch-bar i', c).style.width = k < i ? '100%' : '0';
    });
    chIdx = i; chStart = clock(); chLen = LEN[i]();
    // the latest chapter always wins, even if chapters are clicked quickly
    capWant = i;
    if (cap.dataset.i !== String(i)) {
      cap.classList.add('swap');
      clearTimeout(capTimer);
      capTimer = setTimeout(() => { cap.innerHTML = CAPS[capWant]; cap.dataset.i = String(capWant); cap.classList.remove('swap'); }, 300);
    }
  }

  // ---- which app is in front (on a Mac the menu bar follows it) ----
  const MENUS = { artifice: ['Artifice', 'File Edit View Window Help'], claude: ['Claude', 'File Edit View Window Help'], terminal: ['Terminal', 'Shell Edit View Window Help'], compare: ['Terminal', 'Shell Edit View Window Help'], docs: ['Terminal', 'Shell Edit View Window Help'], plan: ['Finder', 'File Edit View Go Window Help'], memory: ['Artifice', 'File Edit View Window Help'] };
  const mbApp = $('#mb-app'), mbMenus = $('#mb-menus');
  function front(app) {
    $$('.desk .appwin').forEach(w => w.classList.toggle('front', w.dataset.app === app));
    $('.desk').classList.remove('cam'); $('.duo').classList.remove('focus-1', 'focus-2');   // each chapter starts its own camera move
    $('.desk-dim').classList.remove('on', 'dark'); $('.solo-card').classList.remove('on');
    if (app !== 'plan' && mbClock) mbClock.innerHTML = mbClockWas;
    if (mbApp) { mbApp.textContent = MENUS[app][0]; mbMenus.innerHTML = MENUS[app][1].split(' ').map(m => `<span>${m}</span>`).join(''); }
  }
  const nav = which => $$('.desk .window.appwin .app-nav div[data-nav]').forEach(d => d.classList.toggle('on', d.dataset.nav === which));
  const row = (box, cls, html, at = 'end') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; at === 'start' ? box.prepend(d) : box.appendChild(d); return d; };
  const show = (box, cls, html) => { const d = row(box, cls, html); requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('on'))); return d; };
  async function swapView(html, g) {   // only when Artifice changes page: a short cross-fade, then nothing moves but what changes
    const old = $('.app-view', main);
    if (old) { old.classList.add('out'); await wait(300, g); }
    main.innerHTML = html;
  }

  // ---- 3. Your plan lasts longer: an example day of questions about your code ----
  // A usage widget on the desktop, a clock running from 9 am to 6 pm in quarter hours, and two usage bars
  // for the same steady stream of questions. The only measured number is the 28% (pack-quality benchmark,
  // 144 code questions: with Artifice, Claude Code used 72% of the tokens). Everything else follows from it:
  //   your AI alone reaches its limit at 4 pm in this example; at that moment the same work with Artifice
  //   has used 72%; by 6 pm it has used 0.72 × 9/7 ≈ 93%, so 7% is still left.
  // The widget says it's an example day; the caption carries the measured figure (about 40% further:
  // 1 / 0.72 ≈ 1.39). The menu bar clock follows the widget's clock while this chapter plays.
  const PLAN = { start: 9, end: 18, limitAt: 16, ratio: 0.72, intro: 1100, dayMs: 9000, hold: 1200, end_: 6000 };
  const usage = $('.usage'), uClock = $('.u-clock', usage);
  const uRow = side => $(`.u-row[data-side="${side}"]`, usage);
  const mbClock = $('.menubar .mb-clock'), mbClockWas = mbClock ? mbClock.innerHTML : '';
  const fmtHour = (h, caps) => { const q = Math.floor(h * 4 + 1e-9) / 4, hh = Math.floor(q), mm = Math.round((q - hh) * 60); const h12 = ((hh + 11) % 12) + 1; const ap = hh < 12 ? 'am' : 'pm'; return `${h12}:${String(mm).padStart(2, '0')} ${caps ? ap.toUpperCase() : ap}`; };
  function setClock(h) {
    uClock.textContent = fmtHour(h);
    if (mbClock) mbClock.innerHTML = `Wed 19 Nov&nbsp;&nbsp;${fmtHour(h, true)}`;
  }
  function setRow(side, pct) {
    const r = uRow(side);
    $('.u-track i', r).style.transform = `scaleX(${Math.min(1, pct / 100)})`;
    $('.u-val', r).textContent = `${Math.round(Math.min(100, pct))}%`;
  }
  function resetPlan() {
    usage.classList.remove('limit', 'done');
    $('.u-val', uRow('on')).classList.remove('pulse');
    setClock(PLAN.start); setRow('off', 0); setRow('on', 0);
  }
  async function ch3(g) {
    chapter(0); front('plan');
    const desk = $('.desk');
    resetPlan();
    void desk.offsetWidth; requestAnimationFrame(() => { if (g === gen) desk.classList.add('cam'); });
    await wait(PLAN.intro, g);
    // the day runs on real time, so the chapter lasts exactly as long as its progress bar says;
    // it pauses at 4 pm, when your AI alone reaches its limit
    const hours = PLAN.end - PLAN.start, span = PLAN.limitAt - PLAN.start;
    let t0 = clock(), paused = false;
    for (;;) {
      const k = Math.min(1, (clock() - t0) / PLAN.dayMs);
      let h = PLAN.start + hours * k;
      if (!paused && h >= PLAN.limitAt) h = PLAN.limitAt;
      const alone = (h - PLAN.start) / span * 100;
      setClock(h); setRow('off', alone); setRow('on', alone * PLAN.ratio);
      if (!paused && h >= PLAN.limitAt) {
        paused = true;
        usage.classList.add('limit');
        await wait(250, g);
        $('.u-val', uRow('on')).classList.add('pulse');
        await wait(PLAN.hold - 250, g);
        t0 = clock() - span / hours * PLAN.dayMs;   // the day resumes where it stopped
        continue;
      }
      if (k >= 1) break;
      await wait(40, g);
    }
    const left = 100 - Math.round(span ? (hours / span) * 100 * PLAN.ratio : 0);
    $('.u-note', uRow('on')).textContent = `Still ${left}% left at 6:00 pm`;
    usage.classList.add('done');
    await wait(PLAN.end_, g);
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
    soloDone.className = 'done wait'; soloDone.innerHTML = '<i class="pulse"></i><span class="long">Waiting for your approval</span><span class="short">Waiting for you</span>';   // the short form fits a phone
    requestAnimationFrame(() => requestAnimationFrame(() => soloDone.classList.add('on')));
    return perm;
  }
  async function ch2(g) {
    chapter(2); front('docs');
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
    const t0 = clock();
    const step = () => { const k = Math.min(1, (clock() - t0) / ms); el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1 && el.isConnected) requestAnimationFrame(step); };
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
    chapter(1); front('compare');
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

  // ---- 4. Always up to date: a file changes, Artifice flags what was learned from it ----
  // Three windows on the desktop, as in real work: the Artifice app on its Memory page, the policy document,
  // and your AI in a terminal. The behaviour shown is the product's own:
  //   · a memory remembers where it came from (the Memory page shows "from travel-policy.docx");
  //   · when that source changes significantly, the memory is flagged; the app shows "<file> changed today"
  //     with See the change / Still true / Remove (wording and layout from the 0.1.8 redesign);
  //   · the brief your AI gets marks the memory "needs review: its source changed", and since Artifice keeps
  //     its index in step with your files, the passage it sends is the current one.
  // No number is claimed here: the change-detection benchmark compared Artifice with small local models only.
  const MEM = {
    q: 'what\'s our hotel limit in Geneva?',
    brief: 'Artifice briefed your AI: the current travel policy, and 1 memory that needs review (its source changed)',
    say: 'Hotels in Geneva are capped at <b>280 CHF a night</b>, breakfast included.',
    more: ['<code>travel-policy.docx</code> changed today. An earlier memory said 260 CHF; it\'s flagged for review in Artifice.'],
  };
  const mem = $('.mem'), mApp = $('.m4-app', mem), mDoc = $('.m4-doc', mem), mTerm = $('.m4-term', mem);
  const mFlag = $('.m4-flag', mem), mNum = $('.m4-num', mem), mDocTitle = $('.m4-doc .t', mem);
  const mLog = $('.cc-log', mTerm), mTyped = $('.cc-typed', mTerm);
  const MENU4 = { app: ['Artifice', 'File Edit View Window Help'], doc: ['TextEdit', 'File Edit Format View Window Help'], term: ['Terminal', 'Shell Edit View Window Help'] };
  function focusWin(which) {   // the window in front, as on a real desktop; the menu bar follows it
    [['app', mApp], ['doc', mDoc], ['term', mTerm]].forEach(([k, el]) => el.classList.toggle('act', k === which));
    if (mbApp) { mbApp.textContent = MENU4[which][0]; mbMenus.innerHTML = MENU4[which][1].split(' ').map(m => `<span>${m}</span>`).join(''); }
  }
  const mAdd = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; mLog.appendChild(d); requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('on'))); return d; };
  function resetMem() {
    mDoc.classList.remove('show'); mTerm.classList.remove('show'); mFlag.classList.remove('on');
    mNum.textContent = '260'; mNum.classList.remove('sel', 'new'); mDocTitle.textContent = 'travel-policy.docx';
    const home = win ? 'C:\\Users\\maya\\acme' : '/Users/maya/acme';
    mLog.innerHTML = `<div class="cc-welcome"><div><span class="cc-star">✻</span> Welcome! Ask anything about this folder.</div><div class="cc-dim">/help for help</div><div class="cc-dim cc-cwd">cwd: ${home}</div></div>`;
    mTyped.textContent = '';
    focusWin('app');
  }
  async function ch4(g) {
    chapter(3); front('memory');
    const desk = $('.desk');
    resetMem();
    void desk.offsetWidth; requestAnimationFrame(() => { if (g === gen) desk.classList.add('cam'); });
    await wait(1600, g);
    // 1. the policy is edited: 260 becomes 280, and it's saved
    mDoc.classList.add('show'); focusWin('doc');
    await wait(1100, g);
    mNum.classList.add('sel');
    await wait(650, g);
    mNum.classList.remove('sel'); mNum.classList.add('new');
    for (const t of ['2', '28', '280']) { mNum.textContent = t; await wait(140, g); }
    mDocTitle.textContent = 'travel-policy.docx — Edited';
    await wait(900, g);
    mDocTitle.textContent = 'travel-policy.docx';   // saved
    await wait(700, g);
    // 2. Artifice notices: the memory learned from that file is flagged
    focusWin('app'); mDoc.classList.remove('show');
    await wait(700, g);
    mFlag.classList.add('on');
    await wait(2200, g);
    // 3. your AI asks, and is told
    mTerm.classList.add('show'); focusWin('term');
    await wait(700, g);
    for (let i = 1; i <= MEM.q.length; i++) { mTyped.textContent = MEM.q.slice(0, i); await wait(26, g); }
    await wait(400, g); mTyped.textContent = '';
    mAdd('ln you', `&gt; <b>${esc(MEM.q)}</b>`);
    mAdd('ln res', `&nbsp;⎿&nbsp; <span class="art">${MEM.brief}</span>`);
    const spin = mAdd('ln spin', '✻ Thinking…');
    await wait(1700, g);
    spin.remove();
    mAdd('ln say', `<span class="dot">●</span> ${MEM.say}`);
    for (const m of MEM.more) { await wait(160, g); mAdd('ln more', m); }
    await wait(5600, g);
  }

  // ---- each chapter's real length: the sum of its own waits ----
  const LEN = [
    () => PLAN.intro + PLAN.dayMs + PLAN.hold + PLAN.end_,
    () => 900 + CMP.q.length * 22 + 450 + 300 + CMP.off.ms * SPEED + 500 + 500 + 8500,
    () => 900 + DOC.q.length * 24 + 400 + 2300 + DOC.on.more.length * 160 + 300 + 2600 + 800 + 1500 + 600
          + DOC.off.length * 1300 + 1300 + 1100 + (DOC.scripts.length - 1) * (1400 + 1900 + 420) + 900 + 1500 + 4400,
    () => 1600 + 1100 + 650 + 3 * 140 + 900 + 700 + 700 + 2200 + 700 + MEM.q.length * 26 + 400 + 1700 + MEM.more.length * 160 + 5600,
  ];
  (function bars() {
    const b = chapters[chIdx] && $('.ch-bar i', chapters[chIdx]);
    if (b) b.style.width = `${Math.min(100, Math.max(0, (clock() - chStart) / chLen * 100))}%`;
    requestAnimationFrame(bars);
  })();

  // ---- pausing: a click on the desktop or the pause button, or off screen / a background tab ----
  const why = { user: false, hover: false, away: false };
  const pauseBtn = $('.story-pause');
  let byHand = false;   // paused by a click (desktop or button) (not by scrolling away): only that shows the icon
  function updatePause() {
    const p = why.user || why.hover || why.away;
    if (p !== isPaused) {
      if (p) pausedAt = performance.now(); else pausedTotal += performance.now() - pausedAt;
      isPaused = p;
      stage.classList.toggle('paused', p);
    }
    const hand = why.user || why.hover;
    if (hand !== byHand) { byHand = hand; if (!why.away) flashPause(hand); }
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-pressed', String(hand));
      pauseBtn.setAttribute('aria-label', hand ? 'Play the demo' : 'Pause the demo');
      pauseBtn.classList.toggle('is-paused', hand);   // shows the real state, whichever was clicked
    }
  }
  const flash = $('.desk-flash');
  function flashPause(p) {   // like a video player: the icon appears, then fades away
    if (!flash) return;
    flash.classList.toggle('is-play', !p);
    flash.classList.remove('show'); void flash.offsetWidth; flash.classList.add('show');
  }
  const deskEl = $('.desk');
  deskEl.addEventListener('click', () => { why.user = !why.user; updatePause(); });   // click or tap the desktop to pause; again to play
  document.addEventListener('visibilitychange', () => { why.away = document.hidden || !visible; updatePause(); });
  if (pauseBtn) pauseBtn.addEventListener('click', () => { why.user = !why.user; updatePause(); });

  // ---- the loop ----
  const CH = [ch3, ch0, ch2, ch4];   // the order on screen: plan, tokens, busywork, up to date
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
  chapters.forEach((c, k) => c.addEventListener('click', () => { why.user = false; updatePause(); run(k); }));   // choosing a chapter means: play it

  // first frame, before it starts
  resetPane(duo.off); resetPane(duo.on); resetPlan(); chapter(0); front('plan'); nav('library');
  main.innerHTML = `<div class="app-page app-view"><div class="app-title">Library</div><div class="app-meta">Reading… 0 of 214 files</div><div class="app-ask-box">${icon('search')}Search or ask about acme</div><div class="app-files"></div></div>`;
  let started = false;
  const start = () => { if (!started) { started = true; run(0); } };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; why.away = !visible || document.hidden; updatePause(); if (visible) start(); }, { threshold: .25 }).observe(stage);
  } else { visible = true; start(); }
})();

// ---- benchmarks: hovering or focusing a row explains it in a sentence (the numbers are on the chart too) ----
(function () {
  const card = document.querySelector('.bm'), tip = document.querySelector('.db-tip');
  if (!card || !tip) return;
  const place = (row, x) => {
    const c = card.getBoundingClientRect(), r = row.getBoundingClientRect();
    tip.textContent = row.dataset.tip; tip.hidden = false;
    const w = tip.offsetWidth, left = Math.max(12, Math.min((x ?? r.left + r.width / 2) - c.left - w / 2, c.width - w - 12));
    tip.style.left = left + 'px'; tip.style.top = (r.top - c.top - tip.offsetHeight - 6) + 'px';
  };
  card.querySelectorAll('.db-row').forEach(row => {
    row.addEventListener('pointermove', e => place(row, e.clientX));
    row.addEventListener('pointerleave', () => { tip.hidden = true; });
    row.addEventListener('focus', () => place(row));
    row.addEventListener('blur', () => { tip.hidden = true; });
  });
})();

// ---- business / students: two tabs over the same bento (arrow keys move between them) ----
(function () {
  const tabs = [...document.querySelectorAll('.bz-tabs [role="tab"]')];
  if (!tabs.length) return;
  const pick = t => tabs.forEach(x => {
    const on = x === t;
    x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      pick(n); n.focus(); e.preventDefault();
    });
  });
})();

// ---- recurring work: the analog dial. The needle only falls, then rests on Low; the light running down the empty track loops ----
(function () {
  const dial = document.querySelector('.rwg');
  if (!dial) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const needle = dial.querySelector('.rwg-needle'), search = dial.querySelector('.rwg-search');
  const glows = [...dial.querySelectorAll('.rwg-glow')], lights = [...dial.querySelectorAll('radialGradient')];
  const cuts = [...dial.querySelectorAll('.rwg-cut')], lead = dial.querySelector('.rwg-lead'), by = dial.querySelector('.rwg-by');
  let wordX = 0, widths = null;
  // centre the line on its average word, pulled left only as far as the longest needs; its start never moves
  function layout() {
    const start = lead.getBBox().width; // the drawn width: getComputedTextLength() leaves out the dx gap
    if (!start) return;                 // inside a hidden tab: nothing to measure yet
    const all = cuts.map(c => c.getComputedTextLength());
    const rest = start + 5 + by.getComputedTextLength(), room = 320 - rest - Math.max(...all);
    const centred = (320 - rest - all.reduce((a, b) => a + b) / all.length) / 2;
    const x = Math.min(centred, Math.max(room / 2, room - 3)); // 3 units of air on the right
    lead.setAttribute('x', x);
    wordX = x + start + 5;
    cuts.forEach(c => c.setAttribute('x', wordX));
    widths = all;
  }
  document.fonts?.ready.then(() => { widths = null; });
  const CX = 160, CY = 148, R = 122;
  const LOW = .34, HIGH = .86;        // needle positions, 0 = Low, 1 = High (illustrative, not measured)
  const SETTLE = 9, SPEED = .8;       // seconds until it is fully at rest (it looks settled by about 6), and how briskly it falls
  const PASS = 5;                     // seconds for one light to run down the track; the two are half a pass apart
  const WORD = PASS / 2, SWAP = .7;   // a new cut with each light: seconds it has, and for the one before to drift out as it drifts in
  const xy = v => [CX - R * Math.cos(Math.PI * v), CY - R * Math.sin(Math.PI * v)];
  // a damped needle: soft start, long soft landing, no overshoot, so it can never move back up
  const damped = t => 1 - (1 + SPEED * t) * Math.exp(-SPEED * t);
  const clamp = v => Math.max(0, Math.min(1, v)), ease = v => v * v * (3 - 2 * v);
  const fallen = t => t >= SETTLE ? 1 : damped(t) / damped(SETTLE);

  function draw(t, still) {
    const f = still ? 1 : fallen(t), v = HIGH - (HIGH - LOW) * f;
    needle.setAttribute('transform', `rotate(${180 * v} ${CX} ${CY})`);
    search.setAttribute('d', v - LOW < .0005 ? '' : `M${xy(LOW).join(' ')} A${R} ${R} 0 0 1 ${xy(v).join(' ')}`);
    glows.forEach((glow, i) => {
      const p = (t / PASS + i / 2) % 1, [x, y] = xy(1 - (1 - LOW) * p);
      lights[i].setAttribute('cx', x);
      lights[i].setAttribute('cy', y);
      // each light is dark at both ends of its pass and the pair always adds up to the same, so the loop has no seam
      glow.style.opacity = still ? 0 : f * f * Math.sin(Math.PI * p) ** 2;
    });
    // the cuts drift up and through, like the light: one leaves as the next arrives, and the last hands over to the first
    if (!still && !widths) layout();
    dial.classList.toggle('live', !still && !!widths);
    const step = Math.floor(t / WORD), into = t - step * WORD;
    if (widths) {
      const to = widths[step % cuts.length], from = step ? widths[(step - 1) % cuts.length] : to;
      // a longer word gets its room before it fades in; a shorter one closes up after the last has gone
      const p = to > from ? clamp(into / (SWAP * .5)) : clamp((into - SWAP * .4) / (SWAP * .6));
      by.setAttribute('x', wordX + from + (to - from) * ease(p));
    }
    cuts.forEach((cut, i) => {
      let shown = 0, shift = 0;
      if (!still && i === step % cuts.length) {
        const p = step ? ease(clamp((into - SWAP * .4) / (SWAP * .6))) : 1;
        shown = p; shift = 4 * (1 - p);
      } else if (!still && step && i === (step - 1) % cuts.length && into < SWAP * .6) {
        const p = ease(clamp(into / (SWAP * .6)));
        shown = 1 - p; shift = -4 * p;
      }
      cut.style.opacity = shown;
      cut.setAttribute('transform', `translate(0 ${shift})`);
    });
  }

  let time = 0, last = null, inView = false, started = false, paused = false, frame = 0;
  function tick(now) {
    if (last !== null) time += Math.min(.1, (now - last) / 1000);
    last = now;
    draw(time);
    frame = requestAnimationFrame(tick);
  }
  function update() {
    cancelAnimationFrame(frame);
    last = null;
    if (calm.matches) draw(0, true);      // resting on Low, no light
    else if (inView && started && !paused) frame = requestAnimationFrame(tick);
  }
  dial.parentElement.addEventListener('click', () => { paused = !paused; update(); });
  calm.addEventListener?.('change', update);
  if (!('IntersectionObserver' in window)) return;   // the low position, as written in the page
  if (!calm.matches) draw(0);
  // the fall starts once most of the dial is showing; it is wound back only while none of it can be seen
  new IntersectionObserver(es => {
    const e = es[es.length - 1];
    inView = e.isIntersecting;
    if (!inView && started) {
      started = paused = false;
      time = 0;
      if (!calm.matches) draw(0);
    } else if (e.intersectionRatio >= .6) started = true;
    update();
  }, { threshold: [0, .6] }).observe(dial.parentElement);
})();

// Business, "Run it from one place": the admin's switches and six computers. The settings that are on step round the
// computers, fading in place (nothing slides). Switch one off and it leaves every computer; switch it on and every
// computer shows it before the loop carries on. Without motion all show one setting, as written in the page.
(() => {
  const vis = document.querySelector('#bz-biz .opl-vis');
  if (!vis) return;
  const ring = [0, 1, 2, 5, 4, 3];          // clockwise through the grid
  const N = 6, EVERY = 3200, HOLD = 2600;   // ms between changes, and while a setting just switched on shows everywhere
  const all = vis.querySelector('.opl-all'), list = [...vis.querySelectorAll('.opl-rule')];
  const pcs = vis.querySelectorAll('.opl-scr'), screens = ring.map(k => [...pcs[k].children]);
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const mod = v => ((v % N) + N) % N;
  let step = 0, pushed = -1, seen = false, timer = 0;

  const switchedOn = () => list.flatMap((r, i) => r.getAttribute('aria-checked') === 'true' ? [i] : []);
  function draw() {
    const on = switchedOn();
    let lit = on.length ? on[Math.floor(step / N) % on.length] : -1;   // one setting stays lit for a whole lap
    if (pushed >= 0) lit = pushed;
    else if (calm.matches && on.length) lit = on[0];
    const everywhere = pushed >= 0 || calm.matches || !on.length;
    list.forEach((r, i) => r.classList.toggle('lit', i === lit));
    screens.forEach((icons, at) => {
      const show = everywhere ? lit : on[mod(at - step) % on.length];  // with none on, the screens are empty
      icons.forEach((el, i) => {
        // only the arriving icon takes a colour, so the one leaving fades out in the colour it had
        if (i === show) el.classList.toggle('lit', i === lit);
        el.style.opacity = i === show ? 1 : 0;
      });
    });
  }
  function next() {
    clearTimeout(timer);
    if (!seen) return;
    if (pushed < 0 && (calm.matches || !switchedOn().length)) return;
    timer = setTimeout(() => {
      all.classList.remove('quick');
      if (pushed >= 0) pushed = -1; else step++;
      draw();
      next();
    }, pushed >= 0 ? HOLD : EVERY);
  }
  list.forEach((row, i) => {
    row.disabled = false;                   // without script the switches stay as drawn
    row.addEventListener('click', () => {
      const on = row.getAttribute('aria-checked') !== 'true';
      row.setAttribute('aria-checked', String(on));
      pushed = on ? i : -1;
      all.classList.add('quick');
      draw();
      next();
    });
  });
  draw();
  calm.addEventListener?.('change', () => { draw(); next(); });
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(es => { seen = es[es.length - 1].isIntersecting; next(); }).observe(vis);
})();

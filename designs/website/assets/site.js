// tryartifice.com · shared page behaviour: header, footer, icons, the visitor's computer,
// theme, search (⌘K), reveal-on-scroll, copy buttons. Pages set <body data-page="…">.
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.remove('no-js');
  const store = { get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };

  // ---------- theme: Auto (system), Light or Dark; remembered per visitor ----------
  const theme = store.get('site.theme') || 'auto';
  if (theme !== 'auto') root.dataset.theme = theme;

  // ---------- the visitor's computer ----------
  // UX Review sets wf.os; otherwise read the browser. Apple silicon can't be told apart from Intel
  // in every browser, so the button says "Mac" and the Download page offers both.
  let os = store.get('wf.os');
  if (!os) {
    const ua = navigator.userAgent, mobile = /iPhone|iPad|Android/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua) && innerWidth < 1100);
    os = mobile ? 'phone' : /Windows/.test(ua) ? 'windows' : /Macintosh|Mac OS/.test(ua) ? 'mac' : 'other';
  }
  root.dataset.os = os;
  const OS = {
    mac: { label: 'Download for Mac', short: 'Mac', icon: 'apple', file: 'Artifice_0.1.8_aarch64.dmg' },
    windows: { label: 'Download for Windows', short: 'Windows', icon: 'windows', file: 'Artifice_0.1.8_x64-setup.exe' },
    other: { label: 'Download Artifice', short: 'Mac and Windows', icon: 'download', file: null },
    phone: { label: 'Get Artifice for your computer', short: 'Mac and Windows', icon: 'download', file: null },
  }[os];
  window.SITE = { os, OS, store };

  // ---------- icons: <svg data-i="name"></svg> ----------
  const icon = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${(window.ICONS || {})[n] || ''}</svg>`;
  window.SITE.icon = icon;
  const paintIcons = (r = document) => $$('svg[data-i]', r).forEach(s => { s.outerHTML = icon(s.dataset.i, s.getAttribute('class') || 'i'); });

  // ---------- header ----------
  const page = document.body.dataset.page || '';
  const LINKS = [['why-artifice.html', 'Why Artifice', 'why'], ['pricing.html', 'Pricing', 'pricing'], ['docs.html', 'Docs', 'docs'], ['changelog.html', "What's new", 'changelog']];
  const dlHref = 'download.html';
  // A new release gets a small gold dot on Changelog for 14 days (gold = "Artifice helped", as in the app).
  const LATEST = { version: '0.1.9', date: '2026-11-18' };
  const fresh = (Date.now() - new Date(LATEST.date + 'T00:00:00Z')) / 864e5 <= 14;
  const linkHtml = (h, t, id) => {
    const isNew = fresh && id === 'changelog';
    return `<a href="${h}"${page === id ? ' aria-current="page"' : ''}${isNew ? ` title="New: Artifice ${LATEST.version}" aria-label="${t}, new release"` : ''}>${t}${isNew ? '<span class="new-dot" aria-hidden="true"></span>' : ''}</a>`;
  };
  const onComputer = os === 'mac' || os === 'windows';
  const header = `
  <a class="skip" href="#main">Skip to content</a>
  <header class="nav" id="nav">
    <div class="container nav-in">
      <a class="logo" href="index.html" aria-label="Artifice home"><img src="assets/mark.svg" alt=""><span class="word">Artifice</span></a>
      <nav class="nav-links" aria-label="Main">${LINKS.map(l => linkHtml(...l)).join('')}</nav>
      <div class="nav-end">
        <a class="btn ghost sm sales" href="mailto:info@tryartifice.com?subject=Artifice%20for%20my%20team"><span class="who" aria-hidden="true"><img src="assets/avatar-placeholder.jpg" alt=""></span>Talk to sales</a>
        <a class="btn primary sm" href="${dlHref}" data-dl>${icon(OS.icon)}<span>${onComputer ? OS.label : 'Download'}</span></a>
      </div>
      <button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="sheet" data-menu>${icon('menu')}</button>
    </div>
  </header>
  <div class="sheet" id="sheet">
    <nav class="menu-list" aria-label="Main">${LINKS.map(l => linkHtml(...l)).join('')}</nav>
    <div class="menu-end">
      ${onComputer ? `<a class="btn primary lg block" href="${dlHref}">${icon(OS.icon)}<span>${OS.label}</span></a>`
                   : `<a class="btn primary lg block" href="download.html#send">${icon('mail')}<span>Send me the download link</span></a><p>Artifice runs on Mac and Windows.</p>`}
      <a class="btn lg block" href="mailto:info@tryartifice.com?subject=Artifice%20for%20my%20team" style="margin-top:10px">Talk to sales</a>
    </div>
  </div>`;
  if (!document.body.hasAttribute('data-bare')) document.body.insertAdjacentHTML('afterbegin', header);

  // ---------- footer ----------
  const footer = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="logo" href="index.html"><img src="assets/mark.svg" alt="">Artifice</a>
          <p class="mission">Your AI tools, starting from the right pages of your own work, on your own computer.</p>
          <div class="mail"><a href="mailto:support@tryartifice.com">support@tryartifice.com</a><a href="mailto:info@tryartifice.com">info@tryartifice.com</a></div>
        </div>
        <nav aria-label="Product"><h3>Product</h3><a href="download.html">Download</a><a href="why-artifice.html">Why Artifice</a><a href="pricing.html">Pricing</a><a href="students.html">Students</a><a href="docs.html">Docs</a><a href="changelog.html">What's new</a></nav>
        <nav aria-label="Company"><h3>Company</h3><a href="about.html">About</a><a href="letters.html">Letters</a><a href="mailto:info@tryartifice.com">Contact</a><a href="redeem.html">Redeem a code</a></nav>
        <nav aria-label="Trust"><h3>Trust</h3><a href="privacy-and-data.html">Privacy and data</a><a href="how-we-count.html">How we count</a><a href="legal.html#privacy">Privacy policy</a><a href="legal.html">Terms</a></nav>
      </div>
      <div class="footer-ask"><span class="q">Ask an AI about Artifice</span><a href="#" data-ask="claude">Open in Claude</a><a href="#" data-ask="chatgpt">Open in ChatGPT</a><a href="llms.txt">llms.txt</a></div>
      <div class="footer-base">
        <span>© 2026 Artifice</span>
        <span>This site sets no cookies and has no tracking.</span>
        <span class="end"><span class="theme" role="group" aria-label="Appearance">
          <button type="button" data-theme-set="light" aria-label="Light">${icon('sun')}</button>
          <button type="button" data-theme-set="auto" aria-label="Match my computer">${icon('auto')}</button>
          <button type="button" data-theme-set="dark" aria-label="Dark">${icon('moon')}</button>
        </span></span>
      </div>
    </div>
  </footer>
  <div class="search-sheet" id="search" role="dialog" aria-label="Search">
    <div class="search-box">
      <input type="search" placeholder="Search docs, changelog and questions" aria-label="Search">
      <div class="res">
        <div class="grp">Docs</div>
        <a href="docs-article.html" class="on">Connect an AI tool <span>Docs › Basics</span></a>
        <a href="docs-article.html">Add a folder <span>Docs › Basics</span></a>
        <a href="docs-article.html">What leaves your computer <span>Docs › Privacy</span></a>
        <div class="grp">Questions</div>
        <a href="pricing.html#faq">What happens when my 14 days end? <span>Pricing</span></a>
        <a href="students.html">Who counts as a student? <span>Students</span></a>
        <div class="grp">Changelog</div>
        <a href="changelog.html">0.1.8 · Reads Word, PDF, Excel and PowerPoint <span>November</span></a>
      </div>
    </div>
  </div>`;
  if (!document.body.hasAttribute('data-bare')) document.body.insertAdjacentHTML('beforeend', footer);
  paintIcons();

  // download labels and file names anywhere on the page
  $$('[data-dl-label]').forEach(e => { e.textContent = OS.label; });
  $$('[data-dl-icon]').forEach(e => { e.outerHTML = icon(OS.icon); });
  $$('[data-os-short]').forEach(e => { e.textContent = OS.short; });
  $$('[data-os-show]').forEach(e => { e.hidden = !e.dataset.osShow.split(' ').includes(os); });

  // ---------- theme buttons ----------
  const paintTheme = t => $$('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === t)));
  paintTheme(theme);
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-theme-set]'); if (!b) return;
    const t = b.dataset.themeSet; store.set('site.theme', t);
    if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
    paintTheme(t);
  });

  // ---------- nav: hairline once scrolled; phone menu ----------
  const nav = $('#nav');
  // the nav is always the floating pill (decided 2026-11-19). Only the word "Artifice" moves:
  // it shows at the top of the page and folds away once you scroll, leaving the mark.
  if (nav) {
    nav.classList.add('compact', 'still');
    let ticking = false;
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = scrollY;
        if (y > 24) nav.classList.add('past'); else if (y < 6) nav.classList.remove('past');
      });
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  // phone menu: current page marked, page behind locked, Esc and links close it, focus moves in
  const sheetEl = $('#sheet'), menuBtn = $('[data-menu]');
  const setMenu = open => {
    if (!sheetEl || !menuBtn) return;
    sheetEl.classList.toggle('open', open); root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    menuBtn.innerHTML = icon(open ? 'x' : 'menu');
    if (open) { const a = $('a', sheetEl); a && a.focus({ preventScroll: true }); }
  };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-menu]')) setMenu(!sheetEl.classList.contains('open'));
    else if (sheetEl && e.target.closest('#sheet a')) setMenu(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetEl && sheetEl.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  matchMedia('(min-width: 861px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  // the nav's Download waits while the page's own big Download button is on screen
  const ownDl = $$('main a.btn.primary.lg').find(a => /download/i.test(a.textContent + (a.getAttribute('href') || '')) && a.offsetParent && a.getBoundingClientRect().top < innerHeight);
  if (nav && ownDl && 'IntersectionObserver' in window && ownDl.getBoundingClientRect().top < innerHeight) {
    nav.classList.add('dl-wait');
    new IntersectionObserver(([en]) => nav.classList.toggle('dl-wait', en.isIntersecting), { rootMargin: '-68px 0px 0px 0px' }).observe(ownDl);
  }

  // ---------- search (⌘K / Ctrl K) ----------
  const sheet = $('#search');
  const openSearch = () => { if (!sheet) return; sheet.classList.add('open'); setTimeout(() => $('input', sheet).focus(), 20); };
  const closeSearch = () => sheet && sheet.classList.remove('open');
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); sheet && sheet.classList.contains('open') ? closeSearch() : openSearch(); }
    if (e.key === 'Escape') closeSearch();
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-search]')) openSearch();
    else if (e.target === sheet) closeSearch();
  });

  // ---------- copy buttons ----------
  document.addEventListener('click', e => {
    const b = e.target.closest('.copy'); if (!b) return;
    const pre = b.parentElement.querySelector('pre:not([hidden])');
    const text = pre ? [...pre.childNodes].map(n => n.nodeType === 3 ? n.textContent : n.classList && (n.classList.contains('c') || n.classList.contains('p')) ? '' : n.textContent).join('').replace(/^\s*\n/gm, '').trim() : '';
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.resolve()).finally(() => {
      b.classList.add('done'); b.innerHTML = icon('check') + 'Copied';
      setTimeout(() => { b.classList.remove('done'); b.innerHTML = icon('copy') + 'Copy'; }, 1600);
    });
  });

  // ---------- tabs inside code blocks ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('.code-bar button'); if (!t) return;
    const box = t.closest('.code');
    $$('.code-bar button', box).forEach(x => x.setAttribute('aria-selected', String(x === t)));
    $$('pre', box).forEach(p => { p.hidden = p.dataset.tab !== t.dataset.tab; });
  });

  // ---------- reveal once, when seen ----------
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); en.target.dispatchEvent(new CustomEvent('seen')); } }), { rootMargin: '0px 0px -12% 0px' }) : null;
  $$('.reveal, [data-seen]').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  // ---------- version pill: shows the version, widens on hover or focus to say what's new ----------
  $$('.pill-swap').forEach(pill => {
    const box = $('.swap', pill), a = $('.a', box), b = $('.b', box);
    if (!box || !a || !b) return;
    const width = el => Math.ceil(el.getBoundingClientRect().width);
    const fits = () => width(b) <= pill.parentElement.clientWidth - 90;   // never wider than its column
    const set = open => {
      open = open && fits();
      pill.classList.toggle('open', open);
      box.style.width = (open ? width(b) : width(a)) + 10 + 'px';   // 10 = the soft right edge
    };
    set(false);
    if (matchMedia('(hover: hover)').matches) {
      pill.addEventListener('mouseenter', () => set(true));
      pill.addEventListener('mouseleave', () => set(false));
    }
    pill.addEventListener('focus', () => set(true));
    pill.addEventListener('blur', () => set(false));
    addEventListener('resize', () => set(pill.classList.contains('open')));
  });
  window.SITE.ready = true;
})();

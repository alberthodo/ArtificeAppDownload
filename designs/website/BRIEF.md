# Brief for designing tryartifice.com pages (high fidelity, final quality)

You are designing pages of the Artifice website as **final, production-quality HTML**. These are the designs the team will approve and then build, so nothing may look half done: no grey placeholder boxes, no "Picture", no "TBD", no lorem ipsum, no "[brackets]".

## What Artifice is
A desktop app (Mac and Windows) that reads a folder on your computer (documents, PDFs, sheets, slides, code), and briefs AI tools (Claude Code, Claude, Cursor, Codex, Gemini CLI, Antigravity, Windsurf, VS Code) with the right passages when they ask, so they don't search file by file. Files never leave the computer. It is for developers and for non-technical knowledge workers equally. Pricing: 14-day free trial with no card, then Pro at $5.99/month or $59/year (about 18% less); up to 3 computers; free for verified students (school email, re-checked yearly, non-commercial) and for access-code holders. When a plan ends, Artifice stops briefing AI tools; projects, Memory and Playbooks stay readable and exportable. Teams later.

## Where things are
- Design folder: `/Users/roseteck/Documents/simpleAI/planning/website/design/`. Write your pages there (flat, e.g. `pricing.html`).
- **Reference page: `index.html` (Home). Read it fully first.** Match its quality, structure, spacing, voice and markup patterns exactly.
- Shared files (read them, **do not edit them**): `assets/site.css` (design system: tokens, type `.display .h1 .h2 .h3 .h4 .lead .body .small .label`, layout `.container .section .head .grid-2/3/4 .split`, `.btn` variants, `.card`, `.tag`, `.version`, `.code` with tabs and copy, `.seg`, `.faq`, `.table`, `.window`, `.prose`, `.note`, `.page-head`, `.final`, `.reveal`), `assets/product.css` (the Artifice app UI rebuilt in HTML: `.app`, `.app-side`, `.app-nav`, `.app-page`, `.app-card`, `.app-list`, `.app-pass`, `.app-mem`, `.app-file`, `.term`), `assets/site.js` (injects header, footer, ⌘K search; paints `<svg data-i="name">` icons; `data-dl-label`/`data-dl-icon`/`data-os-short`/`data-os-show="mac windows other phone"` adapt to the visitor's computer; `.reveal` fades in once; copy buttons), `assets/icons.js` (available icon names).
- If you need a component that isn't in the shared files, write it in a `<style>` block in your page (like Home does), using only the CSS variables from site.css. Name page-specific classes clearly. Mention it in your report so it can be promoted to the shared CSS later.
- Every page: `<html lang="en" class="no-js">`, same `<head>` pattern as Home (title in cal.com's format "Topic: what it does | Artifice", a real meta description, favicon `assets/mark.svg`, `assets/site.css`, plus `assets/product.css` if you show app UI), `<body data-page="...">` (`why`, `pricing`, `changelog`, `docs` light up the nav; anything else is fine), `<main id="main">`, and at the end `<script src="assets/icons.js"></script><script src="assets/site.js"></script>`. Pages opened from the app with no site chrome use `<body data-bare>`.
- Links between pages use the flat file names: `index.html`, `why-artifice.html`, `download.html`, `pricing.html`, `students.html`, `redeem.html`, `changelog.html`, `letters.html`, `letter.html`, `privacy-and-data.html`, `how-we-count.html`, `about.html`, `docs.html`, `docs-article.html`, `legal.html` (Terms, with `#privacy` for the Privacy policy), `404.html`, `sign-in.html`, `checkout.html`.

## Design rules (from the plan, `planning/website/Artifice website plan.md`, sections 5–7; read section 7)
- Calm, premium, simple, in the spirit of cal.com: lots of space, one idea per section, hairlines not boxes, one primary (ink) button per view, system fonts only, sentence case, no all-caps.
- **Show the real product, not pictures**: where a visual helps, build it from `product.css` (app windows, briefings, memories, files, terminals) or from typography, tables and code. Never illustrations, stock imagery, gradients-as-decoration, glowing orbs, sparkle icons, emoji.
- Colour carries meaning: ink = act; gold = "Artifice helped" (savings only); oxblood = Artifice itself (rare); green = ready/never sent. Nothing coloured for decoration.
- Copy rules (plan section 7): headlines say what happens for the reader in plain words, max about 8 words, no metaphors (no library/shelves/books, except the 404's one line). The sentence under it gives specifics (real tools, files, keys, numbers). Product words (briefing, passages, Memory, Playbooks) go in body text. Short "no"s remove worries ("No card needed."). Present tense, full stops, verbs on buttons, no exclamation marks. Banned: supercharge, unlock, seamless, effortless, streamlined, revolutionize, next-gen, game-changer, AI-powered, 10x, "in today's fast-paced world".
- **Every fact must be true.** Use only facts from the sources below. If a fact is unknown (e.g. exact system requirement), write the copy so it stays true without the number, rather than inventing one or leaving a placeholder. Fictional demo content (the "acme" project, Maya, Lena, travel-policy.docx, billing.ts) is fine, as on Home.
- Accessibility: real headings in order, labels on controls, alt text, contrast via tokens only, keyboard reachable. Responsive: must look designed at 1440, 1080, 768 and 390 px wide (use the breakpoints 1080 and 860 like site.css). Dark mode comes free from the tokens; don't hard-code colours (the `.term` terminal is the one dark-always exception).
- Motion: only `.reveal` (and small, purposeful interactions). Respect reduced motion.

## Sources of truth
- Pricing and plans: `planning/Artifice plans and pricing 2026-11.md`, `planning/Artifice paid plans spec.md`.
- What the app sends, legal text: `~/Documents/GitHub/ArtificeDownload/src/pages/Legal.jsx` (current Terms and Privacy; the "Free and paid plans" section must be rewritten for paid plans in your version if you design legal.html).
- Product facts, commands, tools: `/Users/roseteck/Documents/simpleAI/Artifice docs/` (basics, guides, reference).
- Release notes: `gh release list -R alberthodo/ArtificeAppDownload` and `gh release view <tag> -R alberthodo/ArtificeAppDownload`; also `CHANGELOG.md` in `~/Documents/GitHub/ArtificeDownload` if present. 0.1.9 (Nov 18, 2026, not released yet) = Pro plan, 14-day trial, free for students, access codes, Account › Plan, up to 3 computers.
- Benchmarks: `/Users/roseteck/Documents/simpleAI/benchmarks/` (swebench-mini-2026-10 docs/FULL-REPORT.md, pack-quality-2026-10, the document benchmark). Headline numbers already on Home: −28% cost on code questions in Claude Code (pack-quality benchmark, Oct 2026), −13% cost and 8.2 vs 6.6 answer score on document folders (0.1.8, Nov 2026), ~0% on code fixes (SWE-bench-style, 50 tasks × 3 runs, Oct 2026).
- The app's look: `planning/redesign/05-look-and-feel.md`, vocabulary `planning/redesign/02-vocabulary.md`, screenshots `planning/redesign/screens/new-*.jpg` (read the images to copy the real UI).
- Contact: support@tryartifice.com, info@tryartifice.com. Company name in legal text: use "Artifice" (the legal entity isn't confirmed); say so in your report.

## Don'ts
- Don't edit shared assets, other agents' pages, or anything outside the design folder.
- Don't use the browser pane (the person is using it). Check your HTML by reading it carefully; the coordinator will review every page visually.
- Don't publish, deploy, commit or send anything.

## Report back
List the files you wrote, the facts you used and where they came from, any component you added in page CSS, and anything you had to decide or couldn't verify.

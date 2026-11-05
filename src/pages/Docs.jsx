// Docs: how to use Artifice and its command line. Only usage, never how it
// works inside (the site is deliberately quiet). Pages are Markdown in src/docs.
import { useEffect, useMemo } from 'react';
import { marked } from 'marked';
import { Link, useRoute, routeLinks } from '../lib/router.jsx';

const FILES = import.meta.glob('../docs/*.md', { query: '?raw', import: 'default', eager: true });
const md = slug => FILES[`../docs/${slug}.md`];

export const SECTIONS = [
  { title: 'Using Artifice', pages: [
    ['getting-started', 'Getting started'],
    ['the-app', 'The app'],
    ['projects', 'Projects'],
    ['ai-tools', 'Connecting AI tools'],
    ['memory-and-playbooks', 'Memory and playbooks'],
    ['account', 'Your account'],
    ['privacy-and-data', 'Privacy and your data'],
    ['updates-and-uninstalling', 'Updates and uninstalling'],
    ['troubleshooting', 'Troubleshooting'],
  ] },
  { title: 'Command line', pages: [
    ['cli', 'Command line'],
    ['cli-reference', 'Command reference'],
  ] },
];
const ALL = SECTIONS.flatMap(s => s.pages);

/// Headings get ids from their text, so pages can link to a section (#playbooks).
const slugify = t => t.replace(/<[^>]+>/g, '').toLowerCase().replace(/&[a-z#0-9]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const withIds = html => html.replace(/<h([23])>(.*?)<\/h\1>/g, (_, n, t) => `<h${n} id="${slugify(t)}">${t}</h${n}>`);

export default function Docs() {
  const { path } = useRoute();
  const slug = path.split('/')[2] || 'getting-started';
  const i = ALL.findIndex(([s]) => s === slug);
  const found = i >= 0 && md(slug);
  const html = useMemo(() => (found ? withIds(marked.parse(found)) : ''), [slug]);
  // jump to #section links once the page is drawn
  useEffect(() => { if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); }, [slug]);
  useEffect(() => { document.title = `${found ? ALL[i][1] : 'Docs'} · Artifice docs`; }, [slug]);
  const prev = ALL[i - 1], next = ALL[i + 1];
  return (
    <div className="docs">
      <details className="docs-menu" key={slug}>
        <summary>{found ? ALL[i][1] : 'Docs'}<span aria-hidden="true">▾</span></summary>
        {SECTIONS.map(s => (
          <div key={s.title}>
            <div className="lh">{s.title}</div>
            {s.pages.map(([p, t]) => <Link key={p} to={`/docs/${p}`} className={p === slug ? 'on' : ''}>{t}</Link>)}
          </div>
        ))}
      </details>
      <aside className="docs-nav" aria-label="Docs">
        {SECTIONS.map(s => (
          <div key={s.title}>
            <div className="lh">{s.title}</div>
            {s.pages.map(([p, t]) => <Link key={p} to={`/docs/${p}`} className={p === slug ? 'on' : ''}>{t}</Link>)}
          </div>
        ))}
      </aside>
      <div className="docs-body">
        {found
          ? <article className="prose" onClick={routeLinks} dangerouslySetInnerHTML={{ __html: html }} />
          : <div className="prose"><h1>Not found</h1><p>That page isn’t in the docs. Start with <Link to="/docs/getting-started">Getting started</Link>.</p></div>}
        {found && <nav className="docs-pager">
          {prev ? <Link to={`/docs/${prev[0]}`}>← {prev[1]}</Link> : <span />}
          {next ? <Link to={`/docs/${next[0]}`}>{next[1]} →</Link> : <span />}
        </nav>}
      </div>
    </div>
  );
}

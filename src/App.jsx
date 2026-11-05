import { useEffect } from 'react';
import { useRoute, Link } from './lib/router.jsx';
import Home from './pages/Home.jsx';
import Download from './pages/Download.jsx';
import SignIn from './pages/SignIn.jsx';
import Docs from './pages/Docs.jsx';
import Changelog from './pages/Changelog.jsx';
import { Privacy, Terms } from './pages/Legal.jsx';

const PAGES = {
  '/': { el: Home, title: 'Artifice', bare: true },
  '/download': { el: Download, title: 'Download Artifice' },
  '/sign-in': { el: SignIn, title: 'Sign in to Artifice', bare: true, hidden: true },
  '/changelog': { el: Changelog, title: 'Changelog · Artifice', hidden: true },
  '/privacy': { el: Privacy, title: 'Privacy · Artifice' },
  '/terms': { el: Terms, title: 'Terms · Artifice' },
};

export default function App() {
  const { path } = useRoute();
  const docs = path === '/docs' || path.startsWith('/docs/');
  const page = docs ? { el: Docs, title: 'Docs · Artifice', hidden: true } : PAGES[path];

  // Pages that shouldn't be found by search engines say so (stealth).
  useEffect(() => {
    let m = document.querySelector('meta[name=robots]');
    if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m); }
    m.content = !page || page.hidden ? 'noindex, nofollow' : 'index, follow';
    if (page && !docs) document.title = page.title;
  }, [path]);

  if (!page) return <Frame><NotFound /></Frame>;
  const El = page.el;
  return page.bare ? <El /> : <Frame wide={docs}><El /></Frame>;
}

export function Mark({ size = 28 }) {
  return <img className="mark" src="/logo.svg" width={size} height={size} alt="" />;
}

function Frame({ children, wide }) {
  return (
    <div className="frame">
      <header className={'top' + (wide ? ' wide' : '')}>
        <Link to="/" className="brand"><Mark size={22} />Artifice</Link>
        <nav><Link to="/docs">Docs</Link><Link to="/download">Download</Link></nav>
      </header>
      <main className={wide ? 'wide' : ''}>{children}</main>
      <Footer />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <Link to="/docs">Docs</Link><Link to="/changelog">Changelog</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link>
      <span>© {new Date().getFullYear()} Artifice</span>
    </footer>
  );
}

function NotFound() {
  return <div className="narrow"><h1>Nothing here</h1><p className="sub">That page doesn’t exist. <Link to="/">Go home</Link>.</p></div>;
}

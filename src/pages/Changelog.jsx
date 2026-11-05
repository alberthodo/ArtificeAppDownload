// The changelog, from CHANGELOG.md in this repository (the app's What's new
// links to it too). Only released versions are shown: anything newer than
// the latest GitHub release, or marked "Not released", stays hidden.
import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import raw from '../../CHANGELOG.md?raw';
import { routeLinks } from '../lib/router.jsx';
import { latestRelease } from '../lib/releases.js';

const num = v => String(v).split('.').map(n => parseInt(n, 10) || 0);
const newer = (a, b) => { const x = num(a), y = num(b); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); return false; };

export function releasedOnly(md, latest) {
  return md.split(/^(?=## )/m).filter(part => {
    const m = part.match(/^## Version ([\d.]+)(.*)$/m);
    if (!m) return !part.startsWith('## ');
    if (/not released/i.test(m[2])) return false;
    // without the release list, anything still marked as upcoming is hidden
    return latest ? !newer(m[1], latest) : !/next update/i.test(m[2]);
  }).join('')
    // a released version may still carry its draft label
    .replace(/^(## Version [\d.]+) · Next update$/gm, '$1');
}

export default function Changelog() {
  const [latest, setLatest] = useState(undefined);
  useEffect(() => { latestRelease().then(r => setLatest(r.version)).catch(() => setLatest(null)); }, []);
  const html = useMemo(() => (latest === undefined ? '' : marked.parse(releasedOnly(raw, latest).replace(/^# .*\n/, ''))), [latest]);
  return (
    <div className="narrow">
      <h1>Changelog</h1>
      <p className="sub">Every released version, newest first. Artifice updates itself, so you get these without doing anything.</p>
      {latest === undefined ? <p className="sub" style={{ marginTop: 24 }}>Loading…</p>
        : <article className="prose" style={{ marginTop: 24 }} onClick={routeLinks} dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  );
}

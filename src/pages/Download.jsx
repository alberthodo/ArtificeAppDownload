import { useEffect, useState } from 'react';
import { Link } from '../lib/router.jsx';
import { latestRelease, myKind, KINDS, RELEASES_URL } from '../lib/releases.js';

export default function Download() {
  const [s, set] = useState({ loading: true });
  useEffect(() => {
    let live = true;
    Promise.all([latestRelease(), myKind()])
      .then(([rel, kind]) => live && set({ rel, kind }))
      .catch(() => live && set({ failed: true }));
    return () => { live = false; };
  }, []);

  const mine = s.rel && s.kind && s.rel.files[s.kind];
  const when = s.rel?.date ? new Date(s.rel.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  return (
    <div className="narrow">
      <h1>Download Artifice</h1>
      <p className="sub">
        {s.loading ? 'Finding the latest version…' : s.failed ? 'The download list couldn’t be loaded right now.' : `Version ${s.rel.version} · ${when}`}
      </p>
      <div style={{ marginTop: 24 }}>
        {mine
          ? <a className="btn primary lg" href={mine.url}>Download for {KINDS[s.kind].label}</a>
          : <a className="btn primary lg" href={RELEASES_URL + '/latest'}>See the latest release</a>}
      </div>

      <h2 className="h">All downloads</h2>
      <div className="dl-grid">
        {Object.entries(KINDS).map(([k, v]) => {
          const f = s.rel?.files[k];
          return f
            ? <a key={k} className="dl" href={f.url}><b>{v.long}</b><span>{v.note} · {f.mb} MB</span></a>
            : <span key={k} className="dl off"><b>{v.long}</b><span>{v.note}</span></span>;
        })}
      </div>

      <p className="note">
        Once installed, Artifice updates itself. Need a hand with the first run? See <Link to="/docs/getting-started">Getting started</Link>.
        Older versions are on the <a href={RELEASES_URL}>releases page</a>.
      </p>
    </div>
  );
}

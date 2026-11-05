// The front page: deliberately quiet. A name, one line, a download.
import { useEffect, useState } from 'react';
import { Link } from '../lib/router.jsx';
import { latestRelease, myKind, KINDS } from '../lib/releases.js';
import { Footer, Mark } from '../App.jsx';

export default function Home() {
  const [dl, setDl] = useState(null);
  useEffect(() => {
    let live = true;
    Promise.all([latestRelease(), myKind()])
      .then(([rel, kind]) => live && setDl({ rel, kind, file: kind && rel.files[kind] }))
      .catch(() => live && setDl({ failed: true }));
    return () => { live = false; };
  }, []);

  const label = dl?.file ? `Download for ${KINDS[dl.kind].label}` : 'Download';
  return (
    <div className="home">
      <main className="home-main">
        <Mark size={64} />
        <h1 className="home-name">Artifice</h1>
        <p className="home-line">A quiet librarian for your AI.</p>
        <div className="home-acts">
          {dl?.file
            ? <a className="btn primary lg" href={dl.file.url}>{label}</a>
            : <Link className="btn primary lg" to="/download">{label}</Link>}
        </div>
        <p className="home-meta">
          {dl?.rel ? <>Version {dl.rel.version} · macOS and Windows · <Link to="/download">Other downloads</Link></> : 'macOS and Windows'}
        </p>
      </main>
      <Footer />
    </div>
  );
}

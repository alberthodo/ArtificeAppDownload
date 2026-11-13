import { useState } from 'react';
import { Link } from '../lib/router.jsx';

// Landing page for code links (events, creators): /redeem?code=ARTF-…
export default function Redeem() {
  const code = (new URLSearchParams(location.search).get('code') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 40);
  const [copied, setCopied] = useState(false);
  return (
    <div className="narrow">
      <h1>Your Artifice code</h1>
      <p className="sub">{code ? 'Copy it, then redeem it in the app.' : 'Redeem the code you were given in the Artifice app.'}</p>
      {code && (
        <div className="redeem-code">
          <span className="inline-code">{code}</span>
          <button className="btn" onClick={() => navigator.clipboard.writeText(code).then(() => setCopied(true))}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
      )}
      <ol className="steps">
        <li><Link to="/download">Download Artifice</Link> and sign in, if you haven’t yet.</li>
        <li>Go to <b>Account › Plan › Have a code?</b> and paste it.</li>
      </ol>
      <p className="note">In a terminal instead: <code className="inline-code">artifice plan code {code || 'ARTF-…'}</code></p>
    </div>
  );
}

// The sign-in page Artifice opens in the person's browser (the app's flow is
// in Artifice's account.rs). The page never sees the PKCE verifier: only the
// challenge the app sent. Supabase sends the browser back here with a
// one-time code, which goes to the app through artifice://, or is shown to copy.
//
// Settings (Vercel → Project → Environment Variables):
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (public by design).
import { useEffect, useMemo, useState } from 'react';
import { Link, useRoute } from '../lib/router.jsx';
import { Mark } from '../App.jsx';

const BASE = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const MARKS = {
  google: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6z"/></svg>,
  apple: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.2.8 1.1 1.7 2.3 2.9 2.3 1.1-.1 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.6zM14.1 5.6c.6-.8 1.1-1.8 1-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2-.5 2.7-1.3z"/></svg>,
  azure: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#F25022" d="M3 3h8.5v8.5H3z"/><path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z"/><path fill="#00A4EF" d="M3 12.5h8.5V21H3z"/><path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z"/></svg>,
};

async function auth(path, body) {
  const r = await fetch(BASE + path, { method: 'POST', headers: { apikey: ANON, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.msg || j.error_description || j.message || `HTTP ${r.status}`), { status: r.status });
  return j;
}
const friendly = e => e.status === 429 ? 'Too many tries. Wait a minute, then try again.'
  : /fetch|network/i.test(e.message) ? 'Couldn’t reach the sign-in server. Check your internet connection.'
  : e.message;

export default function SignIn() {
  // Read once: the done step clears the code from the address bar.
  const { search } = useRoute();
  const q = useMemo(() => new URLSearchParams(location.search), [search]);
  const to = q.get('to') === 'cli' ? 'cli' : 'app';
  const state = (q.get('state') || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 64);
  const challenge = (q.get('challenge') || '').replace(/[^A-Za-z0-9_-]/g, '');
  return (
    <div className="signin">
      <main className="signin-card" aria-live="polite">
        <Mark size={44} />
        {q.get('done') === '1' ? <Done key={search} q={q} to={to} state={state} />
          : !challenge || !state ? <StartInApp />
          : !BASE || !ANON ? <><h1>Sign-in isn’t open yet</h1><p className="sub">Check back soon.</p></>
          : <Choose to={to} state={state} challenge={challenge} />}
      </main>
      <p className="signin-legal"><Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link></p>
    </div>
  );
}

function StartInApp() {
  return <>
    <h1>Sign in from Artifice</h1>
    <p className="sub">Open the Artifice app and choose <b>Sign in with your browser</b>, or run <code>artifice login</code> in a terminal. This page needs the link they open.</p>
    <p className="center"><Link to="/download">Don’t have Artifice yet?</Link></p>
  </>;
}

function Choose({ to, state, challenge }) {
  const [step, setStep] = useState('choose'); // choose | sent | sso
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const doneUrl = `${location.origin}/sign-in?done=1&to=${to}&state=${state}`;
  const pkce = { code_challenge: challenge, code_challenge_method: 's256' };

  const provider = p => {
    location.href = `${BASE}/auth/v1/authorize?provider=${p}&redirect_to=${encodeURIComponent(doneUrl)}&code_challenge=${challenge}&code_challenge_method=s256${p === 'azure' ? '&scopes=email' : ''}`;
  };
  const sendLink = async () => {
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setErr('That email address doesn’t look right.');
    setBusy(true); setErr('');
    try { await auth(`/auth/v1/otp?redirect_to=${encodeURIComponent(doneUrl)}`, { email: v, create_user: true, ...pkce }); setStep('sent'); }
    catch (e) { setErr(friendly(e)); }
    setBusy(false);
  };
  const sso = async () => {
    const domain = (email.trim().split('@')[1] || '').toLowerCase();
    if (!domain) return setErr('Type your work email.');
    setBusy(true); setErr('');
    try {
      const r = await auth('/auth/v1/sso', { domain, redirect_to: doneUrl, skip_http_redirect: true, ...pkce });
      if (r.url) location.href = r.url; else throw new Error('No sign-in page came back.');
    } catch (e) {
      setErr(e.status === 404 || /provider/i.test(e.message) ? 'Your company hasn’t set up single sign-on with Artifice. Use another way to sign in.' : friendly(e));
      setBusy(false);
    }
  };
  const enter = fn => e => { if (e.key === 'Enter') fn(); };

  if (step === 'sent') return <>
    <h1>Check your email</h1>
    <p className="sub">We sent a sign-in link to <b>{email.trim()}</b>. Open it on this computer. It works for 10 minutes.</p>
    <p className="center"><button className="plain" onClick={() => { setStep('choose'); setErr(''); }}>Use a different email</button></p>
  </>;
  if (step === 'sso') return <>
    <h1>Single sign-on</h1>
    <p className="sub">For companies that sign in with Okta, Microsoft Entra or similar.</p>
    <div className="col">
      <input className="line" type="email" placeholder="Your work email" autoComplete="email" aria-label="Your work email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={enter(sso)} autoFocus />
      <button className="btn primary full" disabled={busy} onClick={sso}>Continue</button>
      <p className="center"><button className="plain" onClick={() => { setStep('choose'); setErr(''); }}>Other ways to sign in</button></p>
      {err && <p className="err">{err}</p>}
    </div>
  </>;
  return <>
    <h1>Sign in to Artifice</h1>
    <p className="sub">New or returning, it’s the same.</p>
    <div className="col">
      <button className="idp" onClick={() => provider('google')}>{MARKS.google}Continue with Google</button>
      <button className="idp" onClick={() => provider('apple')}>{MARKS.apple}Continue with Apple</button>
      <button className="idp" onClick={() => provider('azure')}>{MARKS.azure}Continue with Microsoft</button>
      <div className="or">or</div>
      <input className="line" type="email" placeholder="Your email" autoComplete="email" aria-label="Your email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={enter(sendLink)} />
      <button className="btn primary full" disabled={busy} onClick={sendLink}>Email me a sign-in link</button>
      <p className="center"><button className="plain" onClick={() => { setStep('sso'); setErr(''); }}>Use your company’s single sign-on</button></p>
      {err && <p className="err">{err}</p>}
    </div>
  </>;
}

function Done({ q, to, state }) {
  const code = (q.get('code') || '').replace(/[^A-Za-z0-9_-]/g, '');
  const [fallback, setFallback] = useState(to === 'cli');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!code) return;
    // the code shouldn't stay in the address bar or history
    history.replaceState(null, '', `/sign-in?done=1&to=${to}`);
    if (to === 'app') {
      location.href = `artifice://auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
      const t = setTimeout(() => setFallback(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);
  if (!code) {
    const why = q.get('error_description') || new URLSearchParams(location.hash.slice(1)).get('error_description');
    return <><h1>That didn’t work</h1><p className="sub">{why || 'The sign-in didn’t finish.'} Go back to Artifice and sign in again.</p></>;
  }
  const copy = () => navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  return <>
    <h1>You’re signed in</h1>
    {to === 'cli'
      ? <p className="sub">Copy this code and paste it into your terminal.</p>
      : <p className="sub"><span className="ring" />Going back to Artifice… You can close this tab.</p>}
    {fallback && <div className="col">
      {to === 'app' && <p className="sub center">Artifice didn’t open? Copy this code and paste it into Artifice.</p>}
      <div className="code">{code}</div>
      <button className="btn primary full" onClick={copy}>{copied ? 'Copied' : 'Copy code'}</button>
      <p className="center sub small">It works once, for a few minutes.</p>
    </div>}
  </>;
}

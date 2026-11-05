// Privacy and terms. The founder reviews these before the site goes live
// (see README: "Before going live").
import { Link } from '../lib/router.jsx';

// Help, privacy and deletion requests go to support; anything else to info.
const SUPPORT = 'support@tryartifice.com';
const INFO = 'info@tryartifice.com';

export function Privacy() {
  return (
    <div className="narrow prose">
      <h1>Privacy</h1>
      <p className="sub">Last updated November 5, 2026</p>
      <p>Artifice runs on your computer. Your files, your library and your memories stay there. This page explains the little that does leave your computer, and how to turn it off.</p>

      <h2>What Artifice never sends</h2>
      <ul>
        <li>Your files or their contents</li>
        <li>File, folder or project names and paths</li>
        <li>The questions you or your AI tools ask, and what Artifice gives them</li>
        <li>Your memories and playbooks</li>
        <li>Error messages</li>
      </ul>

      <h2>Your account</h2>
      <p>Signing in keeps your email address and the name you choose, so the same account works on each of your computers. Sign-in is handled by our authentication provider, Supabase. If you sign in with Google, Apple or Microsoft, they tell us your email and name; we don’t receive your password. You can delete your account at any time in Artifice (Account › Delete account). Deleting it doesn’t touch anything on your computer.</p>

      <h2>Anonymous usage numbers</h2>
      <p>To learn what works, the app sends anonymous usage numbers. This is on by default, and you can turn it off at any time in Settings › Privacy. They are not linked to your account.</p>
      <ul>
        <li>Which features and pages are used, and when</li>
        <li>How Artifice is working: how long things take, which AI tools are connected, and when something fails (only the kind of problem, never the message)</li>
        <li>Counts and token figures, rounded into ranges</li>
        <li>The names of the AI tools that use Artifice and the AI model you chose</li>
        <li>Artifice version, operating system and processor type</li>
        <li>A random ID for your installation</li>
      </ul>
      <p>The numbers go to PostHog, hosted in the European Union. Setting <code>DO_NOT_TRACK=1</code> or <code>ARTIFICE_TELEMETRY=0</code> also turns them off.</p>

      <h2>Things that connect to the internet</h2>
      <ul>
        <li><b>Signing in,</b> through this website and Supabase.</li>
        <li><b>Updates:</b> Artifice checks for new versions and downloads them.</li>
        <li><b>Optional models you choose:</b> if you pick a cloud AI model for summaries, the text being summarized goes to that provider under their terms.</li>
      </ul>

      <h2>This website</h2>
      <p>This site is hosted on Vercel. It uses no cookies and no analytics. The download page asks GitHub for the latest version.</p>

      <h2>Contact</h2>
      <p>Privacy questions or deletion requests: <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a>. For usage numbers, include your installation ID, shown in Settings › Privacy. Anything else: <a href={`mailto:${INFO}`}>{INFO}</a>.</p>
    </div>
  );
}

export function Terms() {
  return (
    <div className="narrow prose">
      <h1>Terms</h1>
      <p className="sub">Last updated November 5, 2026</p>
      <p>These terms apply when you download Artifice, create an account, or use this website.</p>

      <h2>Using Artifice</h2>
      <p>Artifice is free to use. You may install it on your own computers and use it for personal or work projects. Don’t copy, resell, reverse engineer or redistribute the app, or use it to break the law or the terms of the AI tools you connect it to.</p>

      <h2>Your files</h2>
      <p>Your files remain yours. Artifice reads them on your computer to brief your AI tools, and never uploads them. You’re responsible for the folders you add and for what your AI tools do with what they’re given. See <Link to="/privacy">Privacy</Link>.</p>

      <h2>Your account</h2>
      <p>Keep access to your email or sign-in provider secure; anyone who can sign in as you can use your account. You can delete your account at any time. We may suspend accounts that are used to abuse the service.</p>

      <h2>No warranty</h2>
      <p>Artifice is provided as is, without warranties of any kind. To the extent the law allows, we aren’t liable for indirect or consequential losses, or for losses caused by AI tools that use Artifice.</p>

      <h2>Changes</h2>
      <p>We may update these terms. The date above shows the latest version; using Artifice after a change means you accept it.</p>

      <h2>Contact</h2>
      <p>Questions about these terms: <a href={`mailto:${INFO}`}>{INFO}</a>. Help with Artifice: <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a>.</p>
    </div>
  );
}

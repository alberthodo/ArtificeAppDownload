// Privacy and Terms. Structure modelled on the clearest policies we read
// (cal.com, Zed, Raycast, Plausible, Linear; 2026-11-05): a short version up
// top, linked sections with an "In short" line, tables for what is kept, why
// and for how long, named providers, and a version history. Wording is ours.
//
// Before relying on these, the founder fills in OPERATOR and LAW below and
// has them reviewed (see planning/redesign/09-usage-data.md).
import { Link } from '../lib/router.jsx';

// Help, privacy and deletion requests go to support; anything else to info.
const SUPPORT = 'support@tryartifice.com';
const INFO = 'info@tryartifice.com';
const EFFECTIVE = 'November 5, 2026';

// Who runs Artifice and which law applies. Empty until the founder decides;
// the pages then use neutral wording.
const OPERATOR = { name: '', address: '' };
const LAW = ''; // e.g. 'England and Wales', 'the State of Delaware'

const operator = OPERATOR.name ? `${OPERATOR.name}${OPERATOR.address ? `, ${OPERATOR.address}` : ''}` : 'the developer of Artifice';
const Mail = ({ to }) => <a href={`mailto:${to}`}>{to}</a>;

/** One document: title, version line, short version, contents, sections, history. */
function LegalDoc({ title, version, summary, sections, history }) {
  return (
    <div className="narrow prose legal">
      <h1>{title}</h1>
      <p className="sub">Version {version} · Effective {EFFECTIVE}</p>
      <div className="summary">
        <p className="summary-h">The short version</p>
        <ul>{summary.map((s, i) => <li key={i}>{s}</li>)}</ul>
        <p className="small">The short version helps you read the rest; the full text below is what applies.</p>
      </div>
      <nav className="toc" aria-label="Contents">
        <p className="summary-h">Contents</p>
        <ol>{sections.map(s => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ol>
      </nav>
      {sections.map((s, i) => (
        <section key={s.id} id={s.id}>
          <h2>{i + 1}. {s.title}</h2>
          {s.short && <p className="inshort"><b>In short:</b> {s.short}</p>}
          {s.body}
        </section>
      ))}
      <section id="history">
        <h2>Version history</h2>
        <table>
          <thead><tr><th>Version</th><th>Effective</th><th>What changed</th></tr></thead>
          <tbody>{history.map(([v, d, w]) => <tr key={v}><td>{v}</td><td>{d}</td><td>{w}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ Privacy

const privacySections = [
  {
    id: 'who', title: 'Who we are',
    short: 'Artifice is made by a small independent team. We decide how the data described here is used.',
    body: <>
      <p>This policy covers the Artifice desktop app, its command line, your Artifice account and this website (tryartifice.com). Artifice is run by {operator} (“we”, “us”), the controller of the personal data described here.</p>
      <p>Questions about privacy, or a request about your data: <Mail to={SUPPORT} />. Anything else: <Mail to={INFO} />.</p>
    </>,
  },
  {
    id: 'local', title: 'What stays on your computer',
    short: 'Your files, Artifice’s library of them, your memories and your AI’s questions never leave your computer, unless you turn on examples.',
    body: <>
      <p>Artifice is built to work on your computer. It reads the folders you add, builds its library of them there, and briefs your AI tools there. None of these is ever sent to us:</p>
      <ul>
        <li>your files, and what’s in them;</li>
        <li>Artifice’s library: its summaries, outlines and search index;</li>
        <li>your memories and playbooks;</li>
        <li>the text of the briefings Artifice gives your AI tools;</li>
        <li>error messages, which can contain file names.</li>
      </ul>
      <p>Your questions and file names are only ever sent if you turn on examples (<a href="#examples">section 5</a>). Deleting Artifice’s data on your computer is up to you: <Link to="/docs/updates-and-uninstalling">uninstalling</Link> can remove it, and deleting your account doesn’t touch it.</p>
    </>,
  },
  {
    id: 'collect', title: 'What we collect, why, and for how long',
    short: 'Your account details, usage numbers that help us improve Artifice, and, only if you choose, examples.',
    body: <>
      <table>
        <thead><tr><th>What</th><th>Why</th><th>Legal basis (EU and UK)</th><th>Kept for</th></tr></thead>
        <tbody>
          <tr><td><b>Account:</b> email address, the name you choose, how you sign in (Google, Microsoft, email link or single sign-on), an account ID, sign-in times</td><td>To give you an account that works on each of your computers</td><td>Contract</td><td>Until you delete your account, then removed within 30 days, including from backups</td></tr>
          <tr><td><b>Sign-in emails:</b> your email address and the time we sent a link</td><td>To send you sign-in links</td><td>Contract</td><td>Up to 30 days in the sending service’s logs</td></tr>
          <tr><td><b>Usage numbers</b> (<a href="#usage">section 4</a>)</td><td>To see what works and what doesn’t, measure how well briefings help, and fix problems</td><td>Legitimate interests; you can turn them off at any time</td><td>Up to 24 months</td></tr>
          <tr><td><b>Usage numbers linked to your account</b> once you sign in</td><td>To understand use over time and across your computers, and to support you</td><td>Legitimate interests; you can turn them off at any time</td><td>Up to 24 months, or until you delete your account</td></tr>
          <tr><td><b>Crash and error reports:</b> where in Artifice’s code it happened, never the message</td><td>To fix bugs</td><td>Legitimate interests</td><td>Up to 24 months</td></tr>
          <tr><td><b>Examples</b>, only if you turn them on (<a href="#examples">section 5</a>)</td><td>To see where Artifice briefs badly, with real cases</td><td>Consent, which you can withdraw at any time</td><td>90 days</td></tr>
          <tr><td><b>Emails you send us</b></td><td>To answer you</td><td>Legitimate interests, or contract</td><td>Up to 3 years after our last exchange</td></tr>
          <tr><td><b>Website and downloads:</b> standard request details such as IP address and browser, kept by our hosts</td><td>To deliver the site, the app and its updates, and keep them secure</td><td>Legitimate interests</td><td>As long as our hosts keep request logs, typically days</td></tr>
        </tbody>
      </table>
      <p>We don’t sell personal data, don’t share it for advertising, and don’t use it to train AI models.</p>
    </>,
  },
  {
    id: 'usage', title: 'Usage numbers',
    short: 'Counts and categories about how Artifice is used and how well it works. On by default, easy to turn off, never your content.',
    body: <>
      <p>The app and command line send usage numbers to PostHog, in the European Union. They include:</p>
      <ul>
        <li>which features and pages are used, when, and how long pages take to appear;</li>
        <li>how well each briefing worked: how many parts it had, whether your AI then searched again or opened files itself, whether the task went well, and your thumbs up or down if you gave one;</li>
        <li>how Artifice is working: how long things take, which AI tools are connected and their versions, and when something fails or crashes (the kind of problem and where in Artifice’s code, never the message);</li>
        <li>counts and token figures in ranges, and the mix of file types in a project (for example, 60% code);</li>
        <li>the AI model you chose; Artifice’s version; your operating system and its version, processor, memory and number of cores;</li>
        <li>a random ID for your installation.</li>
      </ul>
      <p><b>Linked to your account.</b> When you sign in, these numbers are linked to your account (its ID, email address, how you signed in and your plan), including those sent from that computer before. When you sign out, the computer starts again with a new random ID. When you delete your account, the numbers linked to it are deleted too.</p>
      <p><b>Turning them off.</b> Settings › Privacy › Share usage numbers, or run <code>artifice privacy off</code>. Setting <code>DO_NOT_TRACK=1</code> or <code>ARTIFICE_TELEMETRY=0</code> also turns them off. Organisations can turn them off on all their computers (<Link to="/docs/privacy-and-data#for-organisations">how</Link>). Settings › Privacy also lists every kind of event Artifice can send.</p>
    </>,
  },
  {
    id: 'examples', title: 'Examples (off unless you turn them on)',
    short: 'If you choose, real briefings are shared with secrets and personal details removed, so we can see where Artifice gets it wrong.',
    body: <>
      <p>With Settings › Privacy › <b>Help improve Artifice with examples</b> on, for each briefing Artifice sends:</p>
      <ul>
        <li>your AI’s question, with secrets (keys, tokens, passwords), email addresses, phone, card and ID numbers, IP addresses and your own folder name removed;</li>
        <li>which files and parts the briefing held: their paths, titles and line ranges, and how much of each;</li>
        <li>what your AI searched for or opened afterwards, and how the task went.</li>
      </ul>
      <p>It never sends what’s in your files or the text of the briefing. Before turning it on you can see your latest briefing exactly as it would be sent, and you can leave any project out. Removal of secrets is automatic and careful, but not perfect: don’t turn examples on for projects whose file names or questions you can’t share. Examples are kept for 90 days. Turning examples off stops them at once; to have ones already sent deleted, write to <Mail to={SUPPORT} />.</p>
    </>,
  },
  {
    id: 'ai', title: 'AI tools and models',
    short: 'Artifice doesn’t send your files to an AI. Your AI tools, and any cloud model you pick for summaries, have their own terms.',
    body: <>
      <p>Artifice gives briefings to the AI tools you connect (such as Claude Code, Cursor or Codex) on your computer. What those tools then send to their providers is governed by their own terms and privacy policies, not this one.</p>
      <p>Summaries are made on your computer by default. If you choose a cloud AI model for summaries, the text being summarised is sent to that provider under their terms, using your own key.</p>
      <p>We don’t use your data, examples included, to train AI models, and we don’t let anyone else do so.</p>
    </>,
  },
  {
    id: 'providers', title: 'Who we share it with',
    short: 'Only the providers that run Artifice for us, listed here with where they are.',
    body: <>
      <p>We use these providers (“subprocessors”). Each only processes data to provide its service to us, under a contract that protects it.</p>
      <table>
        <thead><tr><th>Provider</th><th>What for</th><th>Data</th><th>Where</th></tr></thead>
        <tbody>
          <tr><td>Supabase</td><td>Accounts and sign-in</td><td>Account details</td><td>Canada</td></tr>
          <tr><td>PostHog</td><td>Usage numbers, error tracking, examples</td><td>Usage numbers, account link, examples</td><td>European Union (Germany)</td></tr>
          <tr><td>Resend</td><td>Sending sign-in emails</td><td>Email address</td><td>United States</td></tr>
          <tr><td>Vercel</td><td>Hosting this website and the sign-in page</td><td>Request details</td><td>United States, served worldwide</td></tr>
          <tr><td>GitHub</td><td>Hosting downloads and updates</td><td>Request details</td><td>United States</td></tr>
          <tr><td>Zoho</td><td>Our email</td><td>Emails you send us</td><td>As set for our account</td></tr>
        </tbody>
      </table>
      <p>If you sign in with Google or Microsoft, they handle that sign-in under their own privacy policies and tell us your email address and name. We may also disclose data if the law requires it, to protect people’s safety or our rights, or as part of a merger or sale of Artifice, in which case this policy continues to apply to it. We’ll update this list before adding a provider.</p>
    </>,
  },
  {
    id: 'transfers', title: 'International transfers',
    short: 'Some providers are outside your country. Transfers are covered by the safeguards the law requires.',
    body: <>
      <p>Where personal data from the EU, UK or Switzerland goes to a country without an adequacy decision, such as the United States, we rely on the European Commission’s Standard Contractual Clauses (with the UK addendum) or the provider’s certification under the EU-US Data Privacy Framework. Canada has an adequacy decision for commercial organisations.</p>
    </>,
  },
  {
    id: 'rights', title: 'Your rights',
    short: 'Ask us for a copy of your data, to correct or delete it, or to stop using it. Most things you can do yourself in Artifice.',
    body: <>
      <p>Depending on where you live (including the EU, UK and California), you can:</p>
      <ul>
        <li>get a copy of your personal data, in a portable form;</li>
        <li>correct it;</li>
        <li>delete it: Account › Delete account in Artifice deletes your account and the usage numbers linked to it;</li>
        <li>object to or restrict how we use it: turning off usage numbers stops them at once;</li>
        <li>withdraw consent, for examples, at any time;</li>
        <li>not be treated differently for using these rights.</li>
      </ul>
      <p>For anything you can’t do in Artifice, write to <Mail to={SUPPORT} /> with “Privacy request” as the subject, from the email address on your account if you have one. We reply within one month, and may take up to two more months for complex requests, in which case we’ll tell you. You can also complain to your data protection authority. Californians: we don’t sell or share personal information for cross-context advertising, and you may use an authorised agent.</p>
    </>,
  },
  {
    id: 'children', title: 'Children',
    short: 'Artifice isn’t for anyone under 16.',
    body: <p>Artifice isn’t meant for children under 16, and we don’t knowingly collect their data. If you believe a child has given us personal data, write to <Mail to={SUPPORT} /> and we’ll delete it.</p>,
  },
  {
    id: 'security', title: 'Security',
    short: 'We keep what we hold small, encrypted in transit, and access-controlled.',
    body: <p>Data sent to us travels encrypted (HTTPS). Sign-in uses the standard secure browser flow (OAuth with PKCE), so Artifice never sees your password, and your sign-in is kept on your computer where only your user account can read it. Access to our providers is limited and protected with two-factor authentication. No system is perfectly secure; if a breach affects your personal data, we’ll tell you and the authorities without undue delay, as the law requires.</p>,
  },
  {
    id: 'cookies', title: 'Cookies and this website',
    short: 'This website uses no cookies and no analytics.',
    body: <p>tryartifice.com sets no cookies and runs no analytics or advertising. The download page asks GitHub for the latest version of Artifice. The sign-in page sends you to Supabase and your chosen sign-in provider, which may set their own cookies for the sign-in itself.</p>,
  },
  {
    id: 'changes', title: 'Changes to this policy',
    short: 'We’ll tell you before an important change, and keep earlier versions listed below.',
    body: <p>We’ll post any change here with a new version number. For a change that matters, such as collecting a new kind of data, we’ll tell you in Artifice or by email at least 30 days before it applies. Turning on something new that shares more always stays your choice.</p>,
  },
  {
    id: 'contact', title: 'Contact',
    body: <p>Privacy questions and requests: <Mail to={SUPPORT} />. Anything else: <Mail to={INFO} />.{OPERATOR.address ? <> By post: {operator}.</> : null}</p>,
  },
];

export function Privacy() {
  return <LegalDoc
    title="Privacy"
    version="2.0"
    summary={[
      'Artifice runs on your computer. Your files, its library of them, your memories and your AI’s questions stay there.',
      'We keep your account details: your email address and the name you choose.',
      'Artifice sends usage numbers, including how well its briefings work, to improve it. They never include your files or questions, are linked to your account once you sign in, and you can turn them off at any time.',
      'Examples of real briefings are shared only if you turn them on, with secrets and personal details removed, and never what’s in your files.',
      'We don’t sell your data, use it for advertising, or train AI on it.',
      'Deleting your account deletes it and the usage numbers linked to it.',
    ]}
    sections={privacySections}
    history={[
      ['2.0', EFFECTIVE, 'Rewritten in full: usage numbers now measure how well briefings work and are linked to your account after sign-in; optional examples; named providers; retention periods.'],
      ['1.0', '2026', 'First version.'],
    ]}
  />;
}

// ------------------------------------------------------------------ Terms

const termsSections = [
  {
    id: 'agreement', title: 'This agreement',
    short: 'These terms apply when you use Artifice. If you use it for an organisation, they apply to it too.',
    body: <p>These terms are an agreement between you and {operator} (“we”, “us”) for the Artifice desktop app, its command line, your Artifice account and this website (together, “Artifice”). By downloading, installing or using Artifice, or creating an account, you accept them. If you use Artifice for an organisation, you confirm you may accept them on its behalf, and “you” includes it. Our <Link to="/privacy">Privacy policy</Link> explains how we handle personal data.</p>,
  },
  {
    id: 'eligibility', title: 'Who can use Artifice',
    short: 'You need to be at least 16.',
    body: <p>You must be at least 16, and old enough to agree to these terms where you live. You may not use Artifice if the law forbids it, including sanctions and export laws (<a href="#export">section 15</a>).</p>,
  },
  {
    id: 'account', title: 'Your account',
    short: 'Keep your sign-in safe; you’re responsible for what’s done with your account.',
    body: <p>Artifice asks you to sign in. Give us an email address you control, keep access to it and to your sign-in provider secure, and tell us at <Mail to={SUPPORT} /> if you think someone else is using your account. You’re responsible for what happens under your account. You can delete it at any time in Artifice (Account › Delete account).</p>,
  },
  {
    id: 'licence', title: 'Your licence to use Artifice',
    short: 'Install and use Artifice on your own computers, for personal or work projects.',
    body: <p>As long as you follow these terms, we give you a personal, non-exclusive, non-transferable, revocable licence to install Artifice on computers you own or control and use it for personal projects or your organisation’s internal work. Artifice is licensed, not sold; we keep all rights we don’t expressly grant. Open-source components included in Artifice are under their own licences, which take precedence for those components.</p>,
  },
  {
    id: 'rules', title: 'What you may not do',
    short: 'Don’t copy, resell or break Artifice, or use it to break the law.',
    body: <>
      <p>You may not, and may not help anyone else to:</p>
      <ul>
        <li>copy, modify, sell, rent, sublicense or redistribute Artifice, or offer it as a service to others;</li>
        <li>reverse engineer, decompile or disassemble it, except where the law allows this despite these terms;</li>
        <li>remove or bypass sign-in, licence checks or other protections;</li>
        <li>interfere with or overload our services, or access them other than through Artifice;</li>
        <li>use Artifice to break the law, infringe others’ rights, or break the terms of the AI tools you connect it to;</li>
        <li>use Artifice to build a competing product, or to benchmark it for publication without our written agreement.</li>
      </ul>
    </>,
  },
  {
    id: 'your-content', title: 'Your files and content',
    short: 'Your files stay yours, and on your computer.',
    body: <p>Your files, and anything Artifice makes from them on your computer (its library, memories and playbooks), belong to you. Artifice doesn’t upload them, and we get no rights to them. You’re responsible for the folders you add, for having the right to use them, and for what your AI tools do with the briefings Artifice gives them. If you turn on examples, you give us the limited permission described in our <Link to="/privacy#examples">Privacy policy</Link>.</p>,
  },
  {
    id: 'third-party', title: 'AI tools and other services',
    short: 'Your AI tools and other services are separate, with their own terms.',
    body: <p>Artifice works with AI tools and services we don’t control, such as Claude Code, Cursor, Codex, AI model providers you choose, and Google or Microsoft for sign-in. Your use of them is governed by their terms, and we aren’t responsible for them, their availability, or what they do or produce. AI tools can make mistakes: check their work before relying on it.</p>,
  },
  {
    id: 'feedback', title: 'Feedback',
    short: 'If you send ideas, we may use them.',
    body: <p>If you send us suggestions, ratings or other feedback, we may use them for any purpose without owing you anything. This doesn’t give us rights to your files.</p>,
  },
  {
    id: 'updates', title: 'Updates and new features',
    short: 'Artifice updates itself. Features marked as early may change or be removed.',
    body: <p>Artifice installs updates automatically, which may add, change or remove features. Features we mark as beta, preview or early are offered as they are, may change or end at any time, and may be less reliable.</p>,
  },
  {
    id: 'plans', title: 'Free and paid plans',
    short: 'Artifice is free today. Any paid plan will be explained, with its price, before you pay.',
    body: <p>Artifice is currently free. We may introduce paid plans; if we do, their price, billing, renewal, cancellation and refund terms will be shown before you buy, and form part of these terms. We may change or end free features; for a change that significantly reduces what you can do for free, we’ll tell you at least 30 days ahead. Nothing here limits any right you have by law, including a right to cancel within 14 days where it applies.</p>,
  },
  {
    id: 'ending', title: 'Ending this agreement',
    short: 'You can stop at any time. We may suspend accounts that break these terms.',
    body: <p>You can stop using Artifice at any time, and delete your account in the app. We may suspend or end your access if you seriously or repeatedly break these terms, if the law requires it, or to protect Artifice, our users or others; where reasonable, we’ll tell you first and give you a chance to fix the problem. If we stop offering Artifice altogether, we’ll tell you in advance. Sections that by their nature should last, such as ownership, disclaimers, liability and disputes, continue after this agreement ends.</p>,
  },
  {
    id: 'ours', title: 'Our rights',
    short: 'Artifice and its name belong to us.',
    body: <p>Artifice, including its software, design, name and logo, is ours or our licensors’ and is protected by law. Nothing in these terms gives you rights to them beyond the licence in <a href="#licence">section 4</a>.</p>,
  },
  {
    id: 'disclaimers', title: 'Disclaimers',
    short: 'Artifice is provided as it is. It can be wrong or unavailable.',
    body: <p>To the extent the law allows, Artifice is provided “as is” and “as available”, without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, accuracy and non-infringement. We don’t promise that Artifice will be uninterrupted or error-free, that its briefings will be complete or correct, or that it will save any particular amount. Keep backups of your files.</p>,
  },
  {
    id: 'liability', title: 'Limits on our liability',
    short: 'Our total liability is capped. Your rights as a consumer by law aren’t affected.',
    body: <>
      <p>To the extent the law allows, we aren’t liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, revenue, data or goodwill, or for losses caused by AI tools or other services you use with Artifice. Our total liability for all claims about Artifice is limited to the greater of the amount you paid us for Artifice in the 12 months before the claim and US$100.</p>
      <p>Nothing in these terms limits liability that can’t be limited by law, such as for death or personal injury caused by negligence, or for fraud. If you’re a consumer, you keep all the rights the law of your country gives you, and these limits apply only as far as that law allows.</p>
      <p>If you use Artifice for an organisation, it will defend and compensate us against third-party claims arising from its use of Artifice in breach of these terms or the law.</p>
    </>,
  },
  {
    id: 'export', title: 'Export and sanctions',
    short: 'Don’t use Artifice where the law forbids it.',
    body: <p>You may not use, export or re-export Artifice in breach of export control or sanctions laws, or if you are a person those laws restrict.</p>,
  },
  {
    id: 'disputes', title: 'Law and disputes',
    short: 'Talk to us first. Consumers keep the protection of their own country’s law and courts.',
    body: <p>If you have a problem, write to <Mail to={INFO} /> first; most things can be solved that way, and we’ll try to within 30 days. These terms are governed by {LAW ? `the laws of ${LAW}` : 'the laws of the place where we are established'}, and its courts may decide disputes about them. If you’re a consumer, you also keep the protection of the mandatory laws of the country where you live, and may bring a claim in its courts. Nothing here prevents either of us from using a small claims court where available.</p>,
  },
  {
    id: 'changes', title: 'Changes to these terms',
    short: 'We’ll tell you before an important change.',
    body: <p>We may update these terms, for example for new features, paid plans or legal reasons. We’ll post the new version here with a new version number. For a change that matters to you, we’ll tell you in Artifice or by email at least 30 days before it applies; if you don’t agree, stop using Artifice and delete your account before then. Continuing to use Artifice after a change applies means you accept it.</p>,
  },
  {
    id: 'general', title: 'General',
    body: <p>These terms, with the Privacy policy and any plan terms shown when you buy, are the whole agreement between us about Artifice. If part of them can’t be enforced, the rest still applies. If we don’t enforce a right, we haven’t given it up. You may not transfer these terms without our consent; we may transfer them as part of a merger, acquisition or sale of Artifice, and will tell you. Neither of us is responsible for delays caused by events beyond reasonable control.</p>,
  },
  {
    id: 'contact', title: 'Contact',
    body: <p>Questions about these terms: <Mail to={INFO} />. Help with Artifice: <Mail to={SUPPORT} />.{OPERATOR.address ? <> By post: {operator}.</> : null}</p>,
  },
];

export function Terms() {
  return <LegalDoc
    title="Terms"
    version="2.0"
    summary={[
      'You can install Artifice on your own computers and use it for personal or work projects. It’s free today.',
      'Your files stay yours and on your computer. We get no rights to them.',
      'Don’t copy, resell or reverse engineer Artifice, or use it to break the law or your AI tools’ terms.',
      'Your AI tools are separate services with their own terms. Check their work.',
      'Artifice is provided as it is, and our liability is limited, but your rights as a consumer by law stay intact.',
      'We’ll tell you at least 30 days before an important change to these terms.',
    ]}
    sections={termsSections}
    history={[
      ['2.0', EFFECTIVE, 'Rewritten in full: accounts, licence, AI tools, plans, ending the agreement, liability, disputes and changes.'],
      ['1.0', '2026', 'First version.'],
    ]}
  />;
}

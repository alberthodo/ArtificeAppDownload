import { useRoute, Link } from '../lib/router.jsx';

// Plans (simpleAI/planning/Artifice plans and pricing 2026-11.md). Hidden from
// search and not linked until paid plans are announced. Paying happens from
// the app (Account › Plan), signed in, so the plan reaches the right account.
const PLANS = [
  { name: 'Pro', price: '$5.99 a month', alt: 'or $59 a year', who: 'One person, any work.', items: ['Every project and every AI tool', 'Reads documents, scans and pictures', 'Memory, Playbooks and Activity', 'Up to 3 computers', 'Email support'] },
  { name: 'Student', price: 'Free', alt: 'with a school email', who: 'While you’re a student.', items: ['Everything in Pro', 'For study and personal projects', 'Checked once a year'], to: '/student' },
  { name: 'Team', price: 'Coming later', alt: 'per person, from 3 people', who: 'People working on the same projects.', items: ['Everything in Pro', 'Shared Memory and Playbooks', 'Team Activity, one bill'] },
  { name: 'Enterprise', price: 'Talk to us', alt: 'yearly contract', who: 'Companies with IT and security needs.', items: ['Everything in Team', 'Single sign-on, managed install', 'Policies, audit log, data region'], mail: 'info@tryartifice.com' },
];

export default function Pricing() {
  const { path } = useRoute();
  if (path === '/pricing/thanks') return <Thanks />;
  return (
    <div className="narrow wide-ish">
      <h1>Plans</h1>
      <p className="sub">Every plan runs on your computer. Your files never leave it.</p>
      <div className="plans">
        {PLANS.map(p => (
          <div key={p.name} className="plan">
            <b>{p.name}</b>
            <div className="plan-price">{p.price}</div>
            <span className="small">{p.alt}</span>
            <p>{p.who}</p>
            <ul>{p.items.map(i => <li key={i}>{i}</li>)}</ul>
            {p.to && <Link to={p.to}>How it works</Link>}
            {p.mail && <a href={`mailto:${p.mail}`}>{p.mail}</a>}
          </div>
        ))}
      </div>

      <h2 className="h">How to get Pro</h2>
      <p>Every new account starts with a free trial. To choose Pro, open Artifice and go to <b>Account › Plan › Choose a plan</b>. You pay in your browser with Stripe; Artifice switches over by itself.</p>
      <p>Have a code from the Artifice team? Redeem it in <b>Account › Plan › Have a code?</b>, or in the terminal with <code className="inline-code">artifice plan code ARTF-…</code>.</p>

      <h2 className="h">Questions</h2>
      <dl className="faq">
        <dt>What happens when a trial or plan ends?</dt>
        <dd>Artifice stops briefing your AI tools and stops reading changes. The app still opens, your projects, memories and playbooks stay on your computer, and you can read and export them. Choose a plan and everything carries on where it was.</dd>
        <dt>Can I cancel?</dt>
        <dd>Anytime, in Account › Plan › Manage billing. You keep Pro until the end of what you paid for.</dd>
        <dt>Does it work offline?</dt>
        <dd>Yes. Artifice checks your plan when you’re online and keeps working for 14 days without the internet.</dd>
        <dt>Who counts as a student?</dt>
        <dd>Anyone with an email address at a school or university. See <Link to="/student">Artifice for students</Link>.</dd>
        <dt>How many computers?</dt>
        <dd>Up to 3 for each person. Remove one in Account › Your computers to use another.</dd>
      </dl>
      <p className="note">Prices are in US dollars; tax is added where it applies. Questions: <a href="mailto:support@tryartifice.com">support@tryartifice.com</a>.</p>
    </div>
  );
}

function Thanks() {
  return (
    <div className="narrow">
      <h1>Thank you</h1>
      <p className="sub">Your payment went through. Go back to Artifice: it switches to Pro by itself in a few seconds.</p>
      <p className="note">Your receipt is on its way by email. Manage your plan anytime in Artifice, under Account › Plan.</p>
    </div>
  );
}

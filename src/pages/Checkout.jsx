// Artifice's own payment page: tryartifice.com/checkout?t=…[&period=…|&mode=card]
//
// The app opens it with a signed 30-minute link (the `checkout` function). The
// card fields are Stripe's (the Payment Element), drawn by Stripe inside this
// page: card numbers go from the buyer straight to Stripe and never reach this
// site or our server. Everything around them is ours. The `pay` function does
// the rest; the stripe-webhook function turns the payment into the plan, and
// the app switches to Pro by itself.
//
// Settings: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (as for sign-in). The
// Stripe publishable key comes from the server (plans_config).
import { useEffect, useMemo, useRef, useState } from 'react';
import { Mark } from '../App.jsx';

const BASE = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

async function pay(action, body) {
  const r = await fetch(`${BASE}/functions/v1/pay`, { method: 'POST', headers: { apikey: ANON, 'content-type': 'application/json' }, body: JSON.stringify({ action, ...body }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.message || `HTTP ${r.status}`), { code: j.code });
  return j;
}

let stripeJs = null;
function loadStripe(pk) {
  if (!stripeJs) {
    stripeJs = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/';
      s.onload = () => resolve(window.Stripe(pk));
      s.onerror = () => { stripeJs = null; reject(new Error('Stripe couldn’t load. Check your connection and reload the page.')); };
      document.head.appendChild(s);
    });
  }
  return stripeJs;
}

const money = (cents, cur = 'usd') => (cents / 100).toLocaleString(undefined, { style: 'currency', currency: cur.toUpperCase(), minimumFractionDigits: cents % 100 ? 2 : 0 });

/** Stripe's fields in the site's own colours and type (light and dark). */
function appearance() {
  const v = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  return {
    theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'stripe',
    variables: {
      colorPrimary: v('--ink'), colorBackground: v('--surface'), colorText: v('--ink'), colorTextSecondary: v('--ink2'),
      colorTextPlaceholder: v('--ink3'), colorDanger: v('--attn'), fontFamily: v('--sans'), fontSizeBase: '15px', borderRadius: '9px', spacingUnit: '4px',
    },
    rules: { '.Input': { borderColor: v('--line'), boxShadow: 'none' }, '.Input:focus': { borderColor: v('--ink3'), boxShadow: 'none' }, '.Label': { fontWeight: '500' }, '.Tab': { borderColor: v('--line'), boxShadow: 'none' } },
  };
}

export default function Checkout() {
  const q = useMemo(() => new URLSearchParams(location.search), []);
  const t = q.get('t') || '';
  const cardMode = q.get('mode') === 'card';
  const returned = q.get('redirect_status'); // back from a bank check that left the page
  const [info, setInfo] = useState(null);
  const [period, setPeriod] = useState(q.get('period') === 'monthly' ? 'monthly' : 'yearly');
  const [quote, setQuote] = useState(null);
  const [stage, setStage] = useState(returned === 'succeeded' ? 'done' : 'loading'); // loading | form | paying | done | error
  const [err, setErr] = useState(returned && returned !== 'succeeded' ? 'The payment wasn’t completed. Try again, or use another card.' : '');
  const [ready, setReady] = useState(false);
  const S = useRef({});

  // a new card confirmed after leaving the page: save it as the card Pro uses
  useEffect(() => {
    const si = q.get('setup_intent');
    if (cardMode && returned === 'succeeded' && si) pay('card_done', { t, setup_intent: si }).catch(e => { setErr(e.message); setStage('error'); });
  }, []);

  useEffect(() => {
    if (stage === 'done') return;
    if (!t) { setErr('This page opens from Artifice. Open Artifice and choose Pro there.'); setStage('error'); return; }
    let live = true;
    (async () => {
      try {
        const i = await pay('info', { t });
        if (!live) return;
        if (!cardMode && i.paying) { setErr('You already have Pro. Manage it in Artifice, under Account › Plan.'); setStage('error'); return; }
        setInfo(i);
        const stripe = await loadStripe(i.publishable_key);
        S.current.stripe = stripe;
        const p = i.prices[period];
        const elements = cardMode
          // which payment methods show is set in Stripe (Dashboard › Settings › Payment methods)
          ? stripe.elements({ mode: 'setup', currency: p.currency, appearance: appearance() })
          : stripe.elements({ mode: 'subscription', amount: p.amount, currency: p.currency, appearance: appearance() });
        S.current.elements = elements;
        setStage('form');
      } catch (e) { if (live) { setErr(e.code === 'link_expired' ? e.message : e.message || 'This page couldn’t load.'); setStage('error'); } }
    })();
    return () => { live = false; };
  }, []);

  // mount Stripe's fields once the form is on the page
  useEffect(() => {
    if (stage !== 'form' || S.current.mounted) return;
    const { elements } = S.current;
    S.current.mounted = true;
    if (!cardMode) {
      const address = elements.create('address', { mode: 'billing', defaultValues: { address: { country: navigator.language.split('-')[1] || 'US' } } });
      address.mount('#ck-address');
      address.on('change', e => { S.current.address = e.value; if (e.complete) requote(); });
      S.current.addressEl = address;
    }
    const payment = elements.create('payment', { layout: 'tabs', fields: cardMode ? {} : { billingDetails: { address: 'never', name: 'never' } }, wallets: { applePay: 'auto', googlePay: 'auto', link: 'never' } });
    payment.mount('#ck-payment');
    payment.on('ready', () => setReady(true));
  }, [stage]);

  // the price for the chosen period, and tax for the address
  const requote = async (per = S.current.period || period) => {
    const a = S.current.address;
    if (!a || !a.address) return;
    try {
      const qq = await pay('quote', { t, period: per, address: a.address });
      setQuote(qq);
      S.current.elements?.update({ amount: qq.total });
    } catch (e) { setErr(e.message); }
  };
  const choose = per => {
    setPeriod(per); S.current.period = per; setQuote(null);
    if (info) S.current.elements?.update({ amount: info.prices[per].amount });
    requote(per);
  };

  const submit = async e => {
    e.preventDefault();
    setErr('');
    const { stripe, elements } = S.current;
    const { error: invalid } = await elements.submit();
    if (invalid) return;
    setStage('paying');
    const back = `${location.origin}/checkout?t=${encodeURIComponent(t)}${cardMode ? '&mode=card' : ''}`;
    try {
      if (cardMode) {
        const s = await pay('card', { t });
        const r = await stripe.confirmSetup({ elements, clientSecret: s.client_secret, redirect: 'if_required', confirmParams: { return_url: back } });
        if (r.error) throw r.error;
        await pay('card_done', { t, setup_intent: r.setupIntent.id });
      } else {
        const a = S.current.address || {};
        const s = await pay('subscribe', { t, period, address: a.address, name: a.name });
        if (s.type !== 'none') {
          const confirm = s.type === 'setup' ? stripe.confirmSetup : stripe.confirmPayment;
          // the card fields don't ask for name and address (the address section above does)
          const billing_details = { name: a.name || undefined, address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: '', ...(a.address || {}) } };
          const r = await confirm.call(stripe, { elements, clientSecret: s.client_secret, redirect: 'if_required', confirmParams: { return_url: back, payment_method_data: { billing_details } } });
          if (r.error) throw r.error;
        }
      }
      setStage('done');
    } catch (x) {
      setErr(x.message || 'The payment didn’t go through. Try again, or use another card.');
      setStage('form');
    }
  };

  if (stage === 'done') {
    return (
      <Shell>
        <h1>{cardMode ? 'Your new card is saved' : 'You’re on Pro'}</h1>
        <p className="sub">{cardMode ? 'Artifice Pro is charged to it from now on.' : 'Thank you. Go back to Artifice: it switches to Pro by itself in a few seconds.'}</p>
        <p className="ck-note">{cardMode ? 'You can close this page.' : 'Your receipt is on its way by email. Manage Pro anytime in Artifice, under Account › Plan.'}</p>
      </Shell>
    );
  }
  if (stage === 'error') {
    return (
      <Shell>
        <h1>{cardMode ? 'Update your card' : 'Artifice Pro'}</h1>
        <p className="sub">{err}</p>
      </Shell>
    );
  }

  const p = info && info.prices[period];
  const total = quote ? quote.total : p ? p.amount : 0;
  return (
    <Shell>
      <h1>{cardMode ? 'Update your card' : 'Artifice Pro'}</h1>
      <p className="sub">{cardMode ? 'Add the card Artifice Pro should be charged to.' : 'Everything in Artifice for one person: every project and AI tool, documents and scans, Memory, Playbooks and Activity.'}</p>
      {info && info.email && <p className="ck-who">For {info.email}</p>}
      {stage === 'loading' && <p className="sub ck-loading"><span className="ring" /> Loading…</p>}

      <form onSubmit={submit} style={{ display: stage === 'loading' ? 'none' : 'block' }}>
        {!cardMode && info && (
          <div className="ck-periods" role="radiogroup" aria-label="How often to pay">
            {['yearly', 'monthly'].map(per => (
              <button type="button" key={per} role="radio" aria-checked={period === per} className={'ck-period' + (period === per ? ' on' : '')} onClick={() => choose(per)}>
                <b>{per === 'yearly' ? 'Yearly' : 'Monthly'}</b>
                <span>{money(info.prices[per].amount, info.prices[per].currency)} a {per === 'yearly' ? 'year' : 'month'}</span>
                {per === 'yearly' && <span className="ck-save">two months free</span>}
              </button>
            ))}
          </div>
        )}
        {!cardMode && <><h2 className="ck-h">Billing address</h2><div id="ck-address" /></>}
        <h2 className="ck-h">{cardMode ? 'Card' : 'Payment'}</h2>
        <div id="ck-payment" />

        {!cardMode && p && (
          <div className="ck-sum">
            <div><span>Artifice Pro, {period === 'yearly' ? 'yearly' : 'monthly'}</span><span>{money(quote ? quote.subtotal : p.amount, p.currency)}</span></div>
            {quote && quote.discount > 0 && <div><span>Discount</span><span>−{money(quote.discount, p.currency)}</span></div>}
            {info.tax && <div><span>Tax</span><span>{quote ? money(quote.tax, p.currency) : 'from your address'}</span></div>}
            <div className="ck-total"><span>Due today</span><span>{money(total, p.currency)}</span></div>
            <p className="ck-note">Renews every {period === 'yearly' ? 'year' : 'month'} until you cancel. Cancel anytime in Artifice, under Account › Plan; Pro stays on until the end of what you paid for.</p>
          </div>
        )}

        {err && <p className="err" style={{ textAlign: 'left' }}>{err}</p>}
        <button className="btn primary full lg" disabled={!ready || stage === 'paying'}>
          {stage === 'paying' ? (cardMode ? 'Saving…' : 'Paying…') : cardMode ? 'Save card' : `Subscribe · ${money(total, p ? p.currency : 'usd')}`}
        </button>
        <p className="ck-secure">Payments are handled by Stripe. Your card details go straight to Stripe and never reach Artifice.</p>
      </form>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="ck">
      <div className="ck-brand"><Mark size={22} /> Artifice</div>
      {children}
    </div>
  );
}

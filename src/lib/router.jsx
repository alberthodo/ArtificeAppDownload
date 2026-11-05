// A tiny router on the History API: enough for a handful of pages, no dependency.
import { createContext, useContext, useEffect, useState } from 'react';

const RouteCtx = createContext({ path: '/', search: '' });

export function navigate(to, { replace = false } = {}) {
  if (to === location.pathname + location.search) return;
  history[replace ? 'replaceState' : 'pushState'](null, '', to);
  window.dispatchEvent(new Event('artifice:navigate'));
  window.scrollTo(0, 0);
}

export function RouterProvider({ children }) {
  const read = () => ({ path: location.pathname.replace(/\/+$/, '') || '/', search: location.search });
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('popstate', on);
    window.addEventListener('artifice:navigate', on);
    return () => { window.removeEventListener('popstate', on); window.removeEventListener('artifice:navigate', on); };
  }, []);
  return <RouteCtx.Provider value={route}>{children}</RouteCtx.Provider>;
}

export const useRoute = () => useContext(RouteCtx);

/// Same-site links move without a page load; anything else behaves normally.
export function Link({ to, children, ...rest }) {
  const onClick = e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={onClick} {...rest}>{children}</a>;
}

/// Clicks on plain <a href="/…"> inside rendered Markdown go through the router too.
export function routeLinks(e) {
  const a = e.target.closest('a');
  if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('/') && !href.startsWith('//')) { e.preventDefault(); navigate(href); }
}

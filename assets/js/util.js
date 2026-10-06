// Shared helpers: storage that never throws, live-region announcements, queries.
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const mq = (q) => window.matchMedia(q).matches;

export function store(key, value) {
  try {
    if (value === undefined) return window.localStorage.getItem(key);
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch (e) {
    // Storage blocked or full: the choice applies to this page view only (7.1).
  }
  return null;
}

// Clear then set in the next frame so an identical message is announced again.
export function announce(el, msg) {
  if (!el) return;
  el.textContent = "";
  window.requestAnimationFrame(() => { el.textContent = msg; });
}

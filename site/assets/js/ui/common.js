// Small helpers shared by the page scripts.
import { initThemeSelect } from '../theme.js';

export const lang = document.documentElement.lang || 'en';
export const isPt = lang.toLowerCase().startsWith('pt');
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const THE = new Set(['US', 'GB', 'NL']);
/** Country name for use inside an English sentence ("the United States"); Portuguese stays as is. */
export function inSentence(code, name, capital = false) {
  if (isPt || !THE.has(code)) return name;
  return `${capital ? 'The' : 'the'} ${name}`;
}

/** Put text into every [data-slot="name"] element. */
export function fill(name, text, root = document) {
  for (const el of root.querySelectorAll(`[data-slot="${name}"]`)) el.textContent = text;
}

/** Show exactly one element among [data-variant] inside root. */
export function showVariant(root, name) {
  for (const el of root.querySelectorAll('[data-variant]')) el.hidden = el.dataset.variant !== name;
}

export function setupPage() {
  const sel = document.getElementById('theme');
  if (sel) initThemeSelect(sel);
}

export function remember(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ }
}

export function recall(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}

/** Bar width: home level = 50% of the track, track spans 0×–2× home. */
export function barWidth(ratio) {
  return `${Math.max(2, Math.min(100, ratio * 50))}%`;
}

export function tone(ratio) {
  return ratio > 1.03 ? 'dear' : ratio < 0.97 ? 'cheap' : '';
}

/** Rate shown in an input: more decimals for small numbers. */
export function rateDecimals(r) {
  return r >= 100 ? 1 : r >= 10 ? 2 : 4;
}

/** Data is loaded but this choice cannot be computed: hide the numbers and show .when-gap (or clear it). */
export function setGap(main, on) {
  main.toggleAttribute('data-gap', Boolean(on));
}

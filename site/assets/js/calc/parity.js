// Pocket Parity formulas (docs/methodology.md). E = destination currency per 1 origin unit; P = price level, US = 100.
import { COUNTRIES } from '../countries.js';

export function parity({ amount, rate, pOrig, pDest }) {
  if (!(rate > 0) || !pOrig?.all || !pDest?.all) return null;
  const a = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const ratio = pDest.all / pOrig.all;
  const needed = a * ratio;
  return { ratio, cash: a * rate, feelsLike: a / ratio, needed, neededLocal: needed * rate };
}

export function itemPrice(price, rate, pOrigC, pDestC) {
  const p = Number.isFinite(price) && price > 0 ? price : 0;
  const rc = pDestC / pOrigC;
  return { there: p * rate * rc, homeEquivalent: p * rc };
}

export function readParams(search) {
  const q = new URLSearchParams(search);
  const out = {};
  const amount = parseFloat(q.get('amount'));
  if (Number.isFinite(amount) && amount > 0) out.amount = amount;
  for (const k of ['from', 'to']) {
    const v = (q.get(k) || '').toUpperCase();
    if (COUNTRIES[v]) out[k] = v;
  }
  return out;
}

/** Round an input default to a friendly figure (same steps as the prototype). */
export function nice(v) {
  if (v >= 1000) return Math.round(v / 50) * 50;
  if (v >= 100) return Math.round(v / 5) * 5;
  if (v >= 10) return Math.round(v);
  return Math.round(v * 2) / 2;
}

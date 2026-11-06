// Number and money formatting for CentAtlas pages, driven by the page language.
const DASH = '—';

export function localeFor(lang) {
  return String(lang || '').toLowerCase().startsWith('pt') ? 'pt-BR' : 'en-US';
}

export function money(value, currency, lang) {
  if (!Number.isFinite(value)) return DASH;
  const d = Math.abs(value) >= 1000 || currency === 'JPY' ? 0 : 2;
  try {
    return new Intl.NumberFormat(localeFor(lang), {
      style: 'currency', currency, minimumFractionDigits: d, maximumFractionDigits: d,
    }).format(value);
  } catch {
    return `${fmtNumber(value, lang, d)} ${currency}`;
  }
}

export function pct(ratio, lang) {
  if (!Number.isFinite(ratio)) return DASH;
  const v = Math.round((ratio - 1) * 100) / 100;
  return new Intl.NumberFormat(localeFor(lang), {
    style: 'percent', signDisplay: 'exceptZero', maximumFractionDigits: 0,
  }).format(v === 0 ? 0 : v);
}

export function fmtNumber(value, lang, decimals = 0) {
  if (!Number.isFinite(value)) return DASH;
  return new Intl.NumberFormat(localeFor(lang), {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  }).format(value);
}

export function parseNumber(text, lang) {
  let s = String(text ?? '').trim().replace(/[^\d.,-]/g, '');
  s = localeFor(lang) === 'pt-BR' ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  const x = parseFloat(s);
  return Number.isFinite(x) ? x : 0;
}

/** Rate to compute with: the live rate while the field still shows it, otherwise what the visitor typed. */
export function rateFromField(text, shown, live, lang) {
  if (live && String(text).trim() === String(shown).trim()) return live;
  return parseNumber(text, lang);
}

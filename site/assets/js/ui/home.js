// Home page: mini Pocket Parity calculator in the hero card.
import { COUNTRIES, CATEGORIES, countryName, fillCountrySelect } from '../countries.js';
import { money, pct, parseNumber } from '../format.js';
import { loadPriceLevels, loadRates, crossRate } from '../data/sources.js';
import { trackStatus } from '../status.js';
import { parity } from '../calc/parity.js';
import { lang, isPt, $, fill, showVariant, setupPage, inSentence, setGap } from './common.js';

setupPage();
const main = $('main');
const card = $('.mini');
const from = $('#mfrom'), to = $('#mto'), amount = $('#mamount'), open = $('#mopen');
let levels = null, perEur = null;

fillCountrySelect(from, lang, main.dataset.from);
fillCountrySelect(to, lang, main.dataset.to);
const catName = (c) => $(`#catnames [data-cat="${c}"]`)?.textContent ?? c;
const cur = (code) => COUNTRIES[code].cur;

function render() {
  const h = from.value, d = to.value;
  const A = parseNumber(amount.value, lang);
  fill('mcur', cur(h), card);
  const base = isPt ? '/pt/pocket-parity/' : '/pocket-parity/';
  open.href = `${base}?amount=${encodeURIComponent(A)}&from=${h}&to=${d}`;
  if (!levels || !perEur) return;
  if (!levels[h] || !levels[d]) { setGap(main, true); return; }
  if (h === d) { setGap(main, false); showVariant(card, 'same'); return; }
  const r = parity({ amount: A, rate: crossRate(perEur, cur(h), cur(d)), pOrig: levels[h], pDest: levels[d] });
  setGap(main, !r);
  if (!r) return;
  showVariant(card, 'answer');
  fill('dest', inSentence(d, countryName(d, lang)), card);
  fill('amount', money(A, cur(h), lang), card);
  fill('feels', money(r.feelsLike, cur(h), lang), card);
  const top = CATEGORIES.reduce((best, c) => (levels[d][c] / levels[h][c] > levels[d][best] / levels[h][best] ? c : best));
  const ratio = levels[d][top] / levels[h][top];
  fill('topcat', catName(top), card);
  fill('toppct', pct(ratio, lang), card);
  const bar = $('.bar i', card);
  bar.style.width = `${Math.max(2, Math.min(100, ratio * 50))}%`;
  bar.className = ratio > 1 ? 'dear' : 'cheap';
}

for (const el of [from, to]) el.addEventListener('change', render);
amount.addEventListener('input', render);
render();
trackStatus(main, () => Promise.all([loadPriceLevels(), loadRates()]), ([p, r]) => {
  levels = p.levels; perEur = r.perEur; render();
});

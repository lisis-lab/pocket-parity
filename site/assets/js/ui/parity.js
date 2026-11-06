// Pocket Parity page: wires the form to calc/parity.js and the live official data.
import { COUNTRIES, countryName, fillCountrySelect } from '../countries.js';
import { money, pct, fmtNumber, parseNumber, rateFromField } from '../format.js';
import { loadPriceLevels, loadRates, crossRate } from '../data/sources.js';
import { trackStatus } from '../status.js';
import { parity, itemPrice, readParams, nice } from '../calc/parity.js';
import { lang, $, $$, fill, showVariant, setupPage, remember, recall, barWidth, tone, rateDecimals, inSentence, setGap } from './common.js';

setupPage();
const main = $('main');
const from = $('#from'), to = $('#to'), amount = $('#amount'), rate = $('#rate');
const params = readParams(location.search);
const memKey = `pp-${lang}`;
const saved = recall(memKey);
let levels = null, perEur = null, ratesDate = '', shownRate = '';

fillCountrySelect(from, lang, params.from || (COUNTRIES[saved?.f] ? saved.f : main.dataset.from));
fillCountrySelect(to, lang, params.to || (COUNTRIES[saved?.t] ? saved.t : main.dataset.to));
if (params.amount) amount.value = fmtNumber(params.amount, lang, 0);

const cur = (code) => COUNTRIES[code].cur;
const liveRate = () => (perEur ? crossRate(perEur, cur(from.value), cur(to.value)) : null);

function setRate() {
  const r = liveRate();
  rate.value = shownRate = r ? fmtNumber(r, lang, rateDecimals(r)) : '';
}

function resetHomePrices() {
  const usdToHome = crossRate(perEur, 'USD', cur(from.value));
  for (const tr of $$('tr[data-cat]')) {
    const v = nice(Number(tr.dataset.usd) * usdToHome * levels[from.value][tr.dataset.cat] / 100);
    $('input', tr).value = fmtNumber(v, lang, v % 1 ? 1 : 0);
  }
}

function render() {
  if (!levels || !perEur) return;
  const h = from.value, d = to.value;
  if (!levels[h] || !levels[d]) { setGap(main, true); return; }
  const E = rateFromField(rate.value, shownRate, liveRate(), lang) || liveRate();
  const A = parseNumber(amount.value, lang);
  const r = parity({ amount: A, rate: E, pOrig: levels[h], pDest: levels[d] });
  fill('from-cur', cur(h)); fill('to-cur', cur(d));
  fill('home', inSentence(h, countryName(h, lang))); fill('dest', inSentence(d, countryName(d, lang), true));
  setGap(main, !r);
  if (!r) return;

  const p = Math.round((r.ratio - 1) * 100);
  showVariant($('.verdicts'), h === d ? 'same' : Math.abs(p) < 3 ? 'equal' : p > 0 ? 'dear' : 'cheap');
  fill('pct-abs', `${Math.abs(p)}%`);
  fill('amount', money(A, cur(h), lang));
  fill('cash', money(r.cash, cur(d), lang));
  fill('feels', money(r.feelsLike, cur(h), lang));
  fill('needed', money(r.needed, cur(h), lang));
  fill('needed-local', money(r.neededLocal, cur(d), lang));
  fill('rates-date', ratesDate);

  for (const tr of $$('tr[data-cat]')) {
    const c = tr.dataset.cat;
    const rc = levels[d][c] / levels[h][c];
    const ip = itemPrice(parseNumber($('input', tr).value, lang), E, levels[h][c], levels[d][c]);
    $('[data-cell="there"]', tr).textContent = money(ip.there, cur(d), lang);
    $('[data-cell="home"]', tr).textContent = money(ip.homeEquivalent, cur(h), lang);
    const pc = $('.pct', tr);
    pc.textContent = pct(rc, lang);
    pc.className = `pct ${tone(rc)}`;
    const bar = $('.bar i', tr);
    bar.style.width = barWidth(rc);
    bar.className = tone(rc);
  }
  remember(memKey, { f: h, t: d });
}

from.addEventListener('change', () => { if (levels) { resetHomePrices(); setRate(); } render(); });
to.addEventListener('change', () => { setRate(); render(); });
amount.addEventListener('input', render);
rate.addEventListener('input', render);
$('#resetRate').addEventListener('click', () => { setRate(); render(); });
$$('tr[data-cat] input').forEach((i) => i.addEventListener('input', render));
$('#swap').addEventListener('click', () => {
  const oldFrom = from.value;
  const conv = perEur ? crossRate(perEur, cur(oldFrom), cur(to.value)) : null;
  from.value = to.value; to.value = oldFrom;
  if (conv) amount.value = fmtNumber(nice(parseNumber(amount.value, lang) * conv), lang, 0);
  if (levels) { resetHomePrices(); setRate(); }
  render();
});

trackStatus(main, () => Promise.all([loadPriceLevels(), loadRates()]), ([p, r]) => {
  levels = p.levels; perEur = r.perEur; ratesDate = r.date;
  setRate(); resetHomePrices(); render();
});

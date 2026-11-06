// Daily travel budget page: wires the form to calc/budget.js and the live official data.
import { COUNTRIES, CATEGORIES, fillCountrySelect } from '../countries.js';
import { money, pct, fmtNumber, parseNumber, rateFromField } from '../format.js';
import { loadPriceLevels, loadRates, crossRate } from '../data/sources.js';
import { trackStatus } from '../status.js';
import { nice } from '../calc/parity.js';
import { dailyBudget } from '../calc/budget.js';
import { lang, $, $$, fill, showVariant, setupPage, remember, recall, barWidth, tone, rateDecimals, setGap } from './common.js';

setupPage();
const main = $('main');
const from = $('#from'), to = $('#to'), days = $('#days'), rate = $('#rate');
const memKey = `tb-${lang}`;
const saved = recall(memKey);
const USD_DAY = { rest: 150, food: 20, trans: 25, rec: 30, cloth: 15 };
let levels = null, perEur = null, ratesDate = '', shownRate = '';

fillCountrySelect(from, lang, COUNTRIES[saved?.f] ? saved.f : main.dataset.from);
fillCountrySelect(to, lang, COUNTRIES[saved?.t] ? saved.t : main.dataset.to);

const cur = (code) => COUNTRIES[code].cur;
const liveRate = () => (perEur ? crossRate(perEur, cur(from.value), cur(to.value)) : null);
const input = (c) => $(`#h-${c}`);

function setRate() {
  const r = liveRate();
  rate.value = shownRate = r ? fmtNumber(r, lang, rateDecimals(r)) : '';
}

function resetHome() {
  const usdToHome = crossRate(perEur, 'USD', cur(from.value));
  for (const c of CATEGORIES) {
    const v = nice(USD_DAY[c] * usdToHome * levels[from.value][c] / 100);
    input(c).value = fmtNumber(v, lang, v % 1 ? 1 : 0);
  }
}

function render() {
  const h = from.value, d = to.value;
  fill('from-cur', cur(h)); fill('to-cur', cur(d));
  if (!levels || !perEur) return;
  if (!levels[h] || !levels[d]) { setGap(main, true); return; }
  const E = rateFromField(rate.value, shownRate, liveRate(), lang) || liveRate();
  const home = Object.fromEntries(CATEGORIES.map((c) => [c, parseNumber(input(c).value, lang)]));
  const n = Math.max(1, Math.floor(parseNumber(days.value, lang) || 0));
  const r = dailyBudget({ home, rate: E, pOrig: levels[h], pDest: levels[d], days: n });
  setGap(main, !r);
  if (!r) return;

  fill('days', fmtNumber(n, lang, 0));
  fill('trip', money(r.tripThere, cur(d), lang));
  fill('per-day', money(r.perDayThere, cur(d), lang));
  fill('per-day-2', money(r.perDayThere, cur(d), lang));
  fill('per-day-home', money(r.perDayThereInHome, cur(h), lang));
  fill('per-day-home-in', money(r.perDayHome, cur(h), lang));
  fill('rates-date', ratesDate);
  const vs = r.vsHome == null ? '—' : pct(r.vsHome, lang);
  fill('vs', vs); fill('vs-pct', vs);
  showVariant($('.ans.vs'), r.vsHome == null ? 'none' : tone(r.vsHome) || 'equal');

  for (const row of r.rows) {
    const tr = $(`tr[data-cat="${row.cat}"]`);
    $('[data-cell="home"]', tr).textContent = money(row.home, cur(h), lang);
    $('[data-cell="there"]', tr).textContent = money(row.there, cur(d), lang);
    const pc = $('.pct', tr);
    pc.textContent = pct(row.ratio, lang);
    pc.className = `pct ${tone(row.ratio)}`;
    const bar = $('.bar i', tr);
    bar.style.width = barWidth(row.ratio);
    bar.className = tone(row.ratio);
  }
  remember(memKey, { f: h, t: d });
}

from.addEventListener('change', () => { if (levels) { resetHome(); setRate(); } render(); });
to.addEventListener('change', () => { setRate(); render(); });
for (const el of [days, rate, ...$$('.side fieldset input')]) el.addEventListener('input', render);
$('#resetRate').addEventListener('click', () => { setRate(); render(); });

trackStatus(main, () => Promise.all([loadPriceLevels(), loadRates()]), ([p, r]) => {
  levels = p.levels; perEur = r.perEur; ratesDate = r.date;
  setRate(); resetHome(); render();
});

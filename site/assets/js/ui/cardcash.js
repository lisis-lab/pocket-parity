// Card vs. cash page. Works with the live ECB rate, or with a rate the visitor types (even offline).
import { COUNTRIES, fillCountrySelect } from '../countries.js';
import { money, fmtNumber, parseNumber, rateFromField } from '../format.js';
import { loadRates, crossRate } from '../data/sources.js';
import { trackStatus } from '../status.js';
import { nice } from '../calc/parity.js';
import { compareCosts } from '../calc/cardcash.js';
import { lang, $, $$, fill, showVariant, setupPage, remember, recall, rateDecimals, setGap } from './common.js';

setupPage();
const main = $('main');
const from = $('#from'), to = $('#to'), amount = $('#amount'), rate = $('#rate');
const memKey = `cc-${lang}`;
const saved = recall(memKey);
let perEur = null, ratesDate = '', shownRate = '';

fillCountrySelect(from, lang, COUNTRIES[saved?.f] ? saved.f : main.dataset.from);
fillCountrySelect(to, lang, COUNTRIES[saved?.t] ? saved.t : main.dataset.to);

const cur = (code) => COUNTRIES[code].cur;
const liveRate = () => (perEur ? crossRate(perEur, cur(from.value), cur(to.value)) : null);
const num = (id) => parseNumber($(`#${id}`)?.value, lang);
const share = (id) => num(id) / 100;
const label = (id) => $(`#names [data-id="${id}"]`).textContent;

function setRate() {
  const r = liveRate();
  rate.value = shownRate = r ? fmtNumber(r, lang, rateDecimals(r)) : '';
}

/** Example fixed fees: USD 5 at your bank, USD 4 at the ATM, converted with the live rate. */
function setFeeDefaults() {
  if (!perEur) return;
  const show = (v) => fmtNumber(nice(v), lang, nice(v) % 1 ? 1 : 0);
  $('#atm-fixed').value = show(5 * crossRate(perEur, 'USD', cur(from.value)));
  $('#atm-local').value = show(4 * crossRate(perEur, 'USD', cur(to.value)));
}

function render() {
  const h = from.value, d = to.value;
  fill('from-cur', cur(h)); fill('to-cur', cur(d));
  const E = rateFromField(rate.value, shownRate, liveRate(), lang);
  // A typed rate is enough to compute, even when the official data is unavailable.
  if (main.dataset.state !== 'ready') main.toggleAttribute('data-manual', E > 0);
  const r = compareCosts({
    amount: num('amount'), midRate: E,
    card: { spread: share('card-spread'), fee: share('card-fee') },
    atm: { spread: share('atm-spread'), fixedFee: num('atm-fixed'), localFee: num('atm-local') },
    bureau: { spread: share('bureau-spread') },
    iof: share('iof'),
  });
  // No usable rate: once the data is in (or the visitor typed something), say so instead of showing old numbers.
  setGap(main, !r && (main.dataset.state === 'ready' || rate.value.trim() !== ''));
  if (!r) return;

  const sorted = [...r.options].sort((a, b) => a.cost - b.cost);
  const best = sorted[0], worst = sorted[sorted.length - 1];
  fill('amount', money(num('amount'), cur(d), lang));
  fill('cheapest', label(r.cheapest));
  fill('reference', money(r.reference, cur(h), lang));
  fill('best', money(best.cost, cur(h), lang));
  fill('save', money(worst.cost - best.cost, cur(h), lang));
  fill('dearest', label(worst.id).toLowerCase());
  fill('rates-date', ratesDate || '—');
  showVariant($('.stmt'), worst.cost - best.cost < 0.005 ? 'tie' : 'save');

  const maxPct = Math.max(...r.options.map((o) => o.extraPct), 0.0001);
  for (const o of r.options) {
    const tr = $(`tr[data-id="${o.id}"]`);
    tr.classList.toggle('best', o.id === r.cheapest);
    $('[data-cell="cost"]', tr).textContent = money(o.cost, cur(h), lang);
    $('[data-cell="extra"]', tr).textContent = money(o.extra, cur(h), lang);
    const pc = $('.pct', tr);
    pc.textContent = `+${fmtNumber(o.extraPct * 100, lang, 1)}%`;
    pc.className = `pct ${o.id === r.cheapest ? 'cheap' : 'dear'}`;
    const bar = $('.bar i', tr);
    bar.style.width = `${Math.max(2, (o.extraPct / maxPct) * 100)}%`;
    bar.className = o.id === r.cheapest ? 'cheap' : 'dear';
  }
  remember(memKey, { f: h, t: d });
}

from.addEventListener('change', () => { setRate(); setFeeDefaults(); render(); });
to.addEventListener('change', () => { setRate(); setFeeDefaults(); render(); });
for (const el of [amount, rate, ...$$('.side fieldset input'), $('#iof')].filter(Boolean)) el.addEventListener('input', render);
$('#resetRate').addEventListener('click', () => { setRate(); render(); });
render();

trackStatus(main, loadRates, (r) => {
  perEur = r.perEur; ratesDate = r.date;
  main.removeAttribute('data-manual');
  setRate(); setFeeDefaults(); render();
});

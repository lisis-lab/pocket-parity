// Inflation calculator page: US CPI (EN) or IPCA (PT), picked by main[data-series].
import { money, fmtNumber, parseNumber } from '../format.js';
import { loadUsCpi, loadIpca } from '../data/sources.js';
import { trackStatus } from '../status.js';
import { adjust, milestones, yearRange } from '../calc/inflation.js';
import { lang, $, fill, setupPage, setGap } from './common.js';

setupPage();
const main = $('main');
const amount = $('#amount'), fromYear = $('#fromYear'), toYear = $('#toYear'), miles = $('#miles');
const cur = main.dataset.cur;
const DEFAULT_FROM = main.dataset.series === 'br-ipca' ? 1995 : 2000;
const load = main.dataset.series === 'br-ipca' ? loadIpca : loadUsCpi;
let values = null;

const pctText = (x) => `${fmtNumber(x * 100, lang, 1)}%`;

function fillYears() {
  const { min, max } = yearRange(values);
  const opts = [];
  for (let y = max; y >= min; y--) if (values[y] != null) opts.push(`<option value="${y}">${y}</option>`);
  fromYear.innerHTML = toYear.innerHTML = opts.join('');
  fromYear.value = String(Math.max(min, DEFAULT_FROM));
  toYear.value = String(max);
  fromYear.disabled = toYear.disabled = false;
}

function render() {
  if (!values) return;
  const A = parseNumber(amount.value, lang);
  const f = Number(fromYear.value), t = Number(toYear.value);
  let r;
  try { r = adjust({ amount: A, fromYear: f, toYear: t, values }); } catch { setGap(main, true); return; }
  setGap(main, false);
  fill('amount', money(A, cur, lang));
  fill('from', String(f)); fill('to', String(t));
  fill('value', money(r.value, cur, lang));
  // Inflation over the period reads the same either way, so it is always measured oldest → newest.
  const span = adjust({ amount: A, fromYear: Math.min(f, t), toYear: Math.max(f, t), values });
  fill('cumulative', pctText(span.cumulative));
  fill('avg', pctText(span.annualAvg));
  fill('years', fmtNumber(Math.abs(r.years), lang, 0));

  const rows = milestones(values, f, t);
  const top = Math.max(...rows.map((m) => m.index));
  miles.replaceChildren(...rows.map((m) => {
    const tr = document.createElement('tr');
    const v = A * m.index / values[f];
    tr.innerHTML = '<td></td><td class="num"></td><td class="num"><span class="pct"></span><span class="bar"><i></i></span></td>';
    tr.cells[0].textContent = String(m.year);
    tr.cells[1].textContent = fmtNumber(m.index, lang, 1);
    tr.querySelector('.pct').textContent = money(v, cur, lang);
    const bar = tr.querySelector('.bar i');
    bar.style.width = `${Math.max(2, (m.index / top) * 100)}%`;
    if (m.year === f || m.year === t) tr.classList.add('best');
    return tr;
  }));
}

amount.addEventListener('input', render);
fromYear.addEventListener('change', render);
toYear.addEventListener('change', render);
$('#swap').addEventListener('click', () => { [fromYear.value, toYear.value] = [toYear.value, fromYear.value]; render(); });

trackStatus(main, load, (d) => { values = d.values; fillYears(); render(); });

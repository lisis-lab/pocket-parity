import { test } from 'node:test'; import assert from 'node:assert/strict';
import { compareCosts } from '../site/assets/js/calc/cardcash.js';
const base = { amount: 100, midRate: 0.8, card: { spread: 0.02, fee: 0.03 }, atm: { spread: 0.01, fixedFee: 5, localFee: 4 }, bureau: { spread: 0.06 } };
const cost = (r, id) => r.options.find(o => o.id === id).cost;
test('example costs', () => {
  const r = compareCosts(base);
  assert.equal(r.reference, 125);
  assert.ok(Math.abs(cost(r, 'card') - 131.325) < 1e-9);
  assert.ok(Math.abs(cost(r, 'atm') - 136.25) < 1e-9);
  assert.ok(Math.abs(cost(r, 'bureau') - 132.5) < 1e-9);
  assert.equal(r.cheapest, 'card');
});
test('IOF on card and ATM only', () => {
  const r = compareCosts({ ...base, iof: 0.1 });
  assert.ok(Math.abs(cost(r, 'card') - 144.4575) < 1e-9);
  assert.ok(Math.abs(cost(r, 'atm') - 148.875) < 1e-9);
  assert.ok(Math.abs(cost(r, 'bureau') - 132.5) < 1e-9);
});
test('zero amount stays finite', () => {
  const r = compareCosts({ ...base, amount: 0 });
  assert.equal(r.reference, 0); assert.equal(cost(r, 'atm'), 10);
  assert.ok(r.options.every(o => Number.isFinite(o.extraPct)));
});
test('zero rate → null', () => assert.equal(compareCosts({ ...base, midRate: 0 }), null));
test('negative or missing fees count as 0', () => {
  const r = compareCosts({ amount: 100, midRate: 0.8, card: { spread: -1 }, atm: {}, bureau: { spread: NaN } });
  assert.ok(r.options.every(o => o.cost === 125));
  assert.equal(r.cheapest, 'card');
});

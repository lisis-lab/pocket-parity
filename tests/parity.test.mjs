import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parity, itemPrice, readParams, nice } from '../site/assets/js/calc/parity.js';

const US = { all: 100, rest: 100 };
const CH = { all: 150, rest: 150 };

test('US → CH, $5,000 at 0.8', () => {
  const r = parity({ amount: 5000, rate: 0.8, pOrig: US, pDest: CH });
  assert.equal(r.cash, 4000);
  assert.equal(r.ratio, 1.5);
  assert.ok(Math.abs(r.feelsLike - 3333.333) < 0.001);
  assert.equal(r.needed, 7500);
  assert.equal(r.neededLocal, 6000);
});

test('same country → ratio 1', () => {
  const r = parity({ amount: 100, rate: 1, pOrig: US, pDest: US });
  assert.equal(r.ratio, 1);
  assert.equal(r.feelsLike, 100);
});

test('zero rate or missing levels → null', () => {
  assert.equal(parity({ amount: 1, rate: 0, pOrig: US, pDest: CH }), null);
  assert.equal(parity({ amount: 1, rate: 1, pOrig: US, pDest: undefined }), null);
});

test('itemPrice', () => {
  assert.deepEqual(itemPrice(60, 0.8, 100, 150), { there: 72, homeEquivalent: 90 });
});

test('readParams', () => {
  assert.deepEqual(readParams('?amount=5000&to=CH'), { amount: 5000, to: 'CH' });
  assert.deepEqual(readParams('?to=XX&amount=abc'), {});
  assert.deepEqual(readParams('?from=BR&to=PT'), { from: 'BR', to: 'PT' });
});

test('nice rounds input defaults like the prototype', () => {
  assert.equal(nice(1234), 1250);
  assert.equal(nice(163), 165);
  assert.equal(nice(12.4), 12);
  assert.equal(nice(7.3), 7.5);
});

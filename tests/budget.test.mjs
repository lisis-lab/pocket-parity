import { test } from 'node:test'; import assert from 'node:assert/strict';
import { dailyBudget } from '../site/assets/js/calc/budget.js';
const US = { rest: 100, food: 100, trans: 100, rec: 100, cloth: 100 };
const CH = { rest: 150, food: 160, trans: 135, rec: 140, cloth: 120 };
const home = { rest: 150, food: 20, trans: 25, rec: 30, cloth: 15 };
test('US → CH, 7 days at 0.8', () => {
  const r = dailyBudget({ home, rate: 0.8, pOrig: US, pDest: CH, days: 7 });
  assert.equal(r.rows[0].cat, 'rest'); assert.equal(r.rows[0].there, 180);
  assert.equal(r.perDayHome, 240);
  assert.ok(Math.abs(r.perDayThere - 280.6) < 1e-9);
  assert.ok(Math.abs(r.tripThere - 1964.2) < 1e-9);
  assert.ok(Math.abs(r.vsHome - 350.75 / 240) < 1e-9);
});
test('same country → ratios 1', () => {
  const r = dailyBudget({ home, rate: 1, pOrig: US, pDest: US, days: 1 });
  assert.ok(r.rows.every(x => x.ratio === 1)); assert.equal(r.vsHome, 1);
});
test('bad inputs count as 0; days ≥ 1', () => {
  const r = dailyBudget({ home: { rest: -5, food: NaN }, rate: 1, pOrig: US, pDest: US, days: 0.4 });
  assert.equal(r.perDayHome, 0); assert.equal(r.vsHome, null); assert.equal(r.tripThere, 0);
});
test('zero rate or missing levels → null', () => {
  assert.equal(dailyBudget({ home, rate: 0, pOrig: US, pDest: CH, days: 3 }), null);
  assert.equal(dailyBudget({ home, rate: 1, pOrig: US, pDest: undefined, days: 3 }), null);
});

import { test } from 'node:test'; import assert from 'node:assert/strict';
import { adjust, milestones, yearRange } from '../site/assets/js/calc/inflation.js';
const values = { 2000: 100, 2005: 110, 2010: 125, 2012: 130 };
test('forward', () => {
  const r = adjust({ amount: 100, fromYear: 2000, toYear: 2010, values });
  assert.equal(r.value, 125); assert.equal(r.cumulative, 0.25); assert.equal(r.years, 10);
  assert.ok(Math.abs(r.annualAvg - (Math.pow(1.25, 0.1) - 1)) < 1e-12);
});
test('same year', () => { const r = adjust({ amount: 50, fromYear: 2005, toYear: 2005, values }); assert.equal(r.value, 50); assert.equal(r.annualAvg, 0); });
test('backwards', () => assert.equal(adjust({ amount: 125, fromYear: 2010, toYear: 2000, values }).value, 100));
test('missing year throws', () => assert.throws(() => adjust({ amount: 1, fromYear: 1990, toYear: 2010, values }), RangeError));
test('milestones', () => assert.deepEqual(milestones(values, 2000, 2012).map(m => m.year), [2000, 2005, 2010, 2012]));
test('milestones backwards are ascending', () => assert.deepEqual(milestones(values, 2012, 2000).map(m => m.year), [2000, 2005, 2010, 2012]));
test('yearRange', () => assert.deepEqual(yearRange(values), { min: 2000, max: 2012 }));

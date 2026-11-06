import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as S from '../site/assets/js/data/sources.js';

const fx = (f) => JSON.parse(readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8'));
const SIX = { 9260000: 1, 1111000: 1, 1101000: 1, 1107000: 1, 9110000: 1, 1103000: 1 };

test('ICP rebased to US = 100', () => {
  const by = S.parseIcp(fx('icp.json'));
  const lv = S.priceLevels(by);
  for (const c of ['all', 'rest', 'food', 'trans', 'rec', 'cloth']) assert.equal(lv.US[c], 100);
  assert.ok(Math.abs(lv.CH.rest - (by.CHE['1111000'] / by.USA['1111000']) * 100) < 1e-9);
  assert.ok(lv.BR.all < 100 && lv.CH.all > 100);
});

test('country missing a series is omitted', () => {
  const lv = S.priceLevels({ USA: SIX, CHE: { 9260000: 2 } });
  assert.ok(lv.US);
  assert.equal(lv.CH, undefined);
});

test('no US reference → no levels at all', () => {
  assert.deepEqual(S.priceLevels({ CHE: SIX }), {});
});

test('ECB cross rates', () => {
  const { perEur, date } = S.parseEcb(fx('ecb.json'));
  assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(perEur.EUR, 1);
  assert.ok(perEur.USD > 0 && perEur.CHF > 0 && perEur.BRL > 0);
  assert.ok(Math.abs(S.crossRate(perEur, 'USD', 'CHF') - perEur.CHF / perEur.USD) < 1e-12);
  assert.equal(S.crossRate(perEur, 'USD', 'USD'), 1);
  assert.equal(S.crossRate(perEur, 'USD', 'XXX'), null);
});

test('World Bank CPI keeps only published years', () => {
  const v = S.parseWbCpi(fx('wb-cpi.json'));
  assert.ok(v[2010] > 99.9 && v[2010] < 100.1);
  assert.ok(Object.values(v).every((x) => Number.isFinite(x)));
});

test('BLS annual keeps only complete years', () => {
  const y = S.parseBlsAnnual({ Results: { series: [{ data: [
    ...Array.from({ length: 12 }, (_, i) => ({ year: '2025', period: `M${String(i + 1).padStart(2, '0')}`, value: '300' })),
    { year: '2026', period: 'M01', value: '310' },
  ] }] } });
  assert.deepEqual(y, { 2025: 300 });
});

test('BLS annual prefers the official annual average (M13), even with a missing month', () => {
  const y = S.parseBlsAnnual({ Results: { series: [{ data: [
    { year: '2025', period: 'M13', value: '321.943' },
    { year: '2025', period: 'M10', value: '-' },
    ...['01', '02', '03', '04', '05', '06', '07', '08', '09', '11', '12'].map((m) => ({ year: '2025', period: `M${m}`, value: '320' })),
  ] }] } });
  assert.deepEqual(y, { 2025: 321.943 });
});

test('BLS fixture yields 2024 and 2025', () => {
  const y = S.parseBlsAnnual(fx('bls.json'));
  assert.ok(Number.isFinite(y[2024]) && Number.isFinite(y[2025]));
  assert.equal(y[2026], undefined);
});

test('chainCpi', () => {
  assert.deepEqual(S.chainCpi({ 2023: 140, 2024: 144 }, { 2024: 310, 2025: 320 }),
    { 2023: 140, 2024: 144, 2025: (144 * 320) / 310 });
});

test('chainCpi without overlap returns WB only', () => {
  assert.deepEqual(S.chainCpi({ 2024: 144 }, { 2025: 320 }), { 2024: 144 });
});

test('SIDRA December index from 1995', () => {
  const v = S.parseSidraDecember(fx('sidra.json'));
  assert.ok(!('1994' in v) && '1995' in v);
  assert.ok(Object.keys(v).every((y) => Number(y) >= 1995));
  assert.ok(v[2000] < v[2010]);
});

test('SIDRA rows without a value are dropped', () => {
  const v = S.parseSidraDecember([{ V: 'Valor' }, { D3C: '202412', V: '...' }, { D3C: '202312', V: '7000.5' }]);
  assert.deepEqual(v, { 2023: 7000.5 });
});

test('fetchCached: fresh cache, expired cache, corrupt cache, failure, blocked storage', async () => {
  const mem = new Map();
  const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  let calls = 0;
  const ok = async () => { calls++; return { ok: true, json: async () => ({ v: calls }) }; };
  assert.deepEqual(await S.fetchCached('u', { storage, now: () => 0, fetchImpl: ok }), { v: 1 });
  assert.deepEqual(await S.fetchCached('u', { storage, now: () => 1000, fetchImpl: ok }), { v: 1 });
  assert.deepEqual(await S.fetchCached('u', { storage, now: () => 90_000_000, fetchImpl: ok }), { v: 2 });
  mem.set([...mem.keys()][0], '{bad');
  assert.deepEqual(await S.fetchCached('u', { storage, now: () => 90_000_001, fetchImpl: ok }), { v: 3 });
  const bad = async () => ({ ok: false, status: 503 });
  await assert.rejects(S.fetchCached('v', { storage, now: () => 0, fetchImpl: bad }));
  const throwing = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
  assert.deepEqual(await S.fetchCached('w', { storage: throwing, now: () => 0, fetchImpl: ok }), { v: 4 });
});

test('jsonpFetch loads through a script tag and cleans up', async () => {
  const added = [];
  const doc = {
    createElement: () => ({ remove() { added.splice(added.indexOf(this), 1); } }),
    head: {
      appendChild(el) {
        added.push(el);
        const cb = new URL(el.src).searchParams.get('prefix');
        assert.match(el.src, /format=jsonp/);
        queueMicrotask(() => globalThis[cb]({ hello: 1 }));
      },
    },
  };
  const res = await S.jsonpFetch('https://api.example.org/x?format=json&a=1', { doc });
  assert.equal(res.ok, true);
  assert.deepEqual(await res.json(), { hello: 1 });
  assert.equal(Object.keys(globalThis).filter((k) => k.startsWith('__caJsonp')).length, 0);
});

test('jsonpFetch rejects on script error', async () => {
  const doc = {
    createElement: () => ({ remove() {} }),
    head: { appendChild(el) { queueMicrotask(() => el.onerror(new Error('net'))); } },
  };
  await assert.rejects(S.jsonpFetch('https://api.example.org/x?format=json', { doc }));
});

test('fetchCached times out', async () => {
  const hang = (url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
  await assert.rejects(S.fetchCached('t', { storage: null, timeoutMs: 20, fetchImpl: hang }));
});

test('fetchCached: a body the parser rejects is not cached', async () => {
  const store = new Map(); const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  const res = (body) => async () => ({ ok: true, json: async () => body });
  const parse = (d) => { if (!d.good) throw new Error('bad body'); return d.good; };
  await assert.rejects(S.fetchCached('p', { storage, now: () => 0, fetchImpl: res({ message: 'err' }), parse }), /bad body/);
  assert.equal(store.size, 0);
  assert.equal(await S.fetchCached('p', { storage, now: () => 1, fetchImpl: res({ good: 7 }), parse }), 7);
  assert.equal(await S.fetchCached('p', { storage, now: () => 2, fetchImpl: res({ good: 9 }), parse }), 7);
});

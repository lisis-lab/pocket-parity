// Official data, fetched live in the browser (no server in this version).
// Rule: no data, no number. Nothing here invents, embeds or estimates values.
import { COUNTRIES } from '../countries.js';

export const SERIES = { all: '9260000', rest: '1111000', food: '1101000', trans: '1107000', rec: '9110000', cloth: '1103000' };

export const URLS = {
  icp: (iso3s, series) => `https://api.worldbank.org/v2/sources/90/country/${iso3s.join(';')}/series/${series.join(';')}/classification/PX.WL/time/YR2021?format=json&per_page=1000`,
  ecb: (curs) => `https://data-api.ecb.europa.eu/service/data/EXR/D.${curs.join('+')}.EUR.SP00.A?lastNObservations=1&format=jsondata`,
  wbCpi: 'https://api.worldbank.org/v2/country/USA/indicator/FP.CPI.TOTL?format=json&per_page=200&date=1960:2100',
  bls: 'https://api.bls.gov/publicAPI/v1/timeseries/data/CUUR0000SA0',
  sidra: 'https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/2266/p/all',
};

const DAY = 86_400_000;

function defaultStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

/** Fetch JSON with a timeout; reuse a successful response for ttlMs. Expired or corrupt cache is ignored. */
export async function fetchCached(url, {
  ttlMs = DAY, timeoutMs = 20_000, storage = defaultStorage(), now = Date.now, fetchImpl = globalThis.fetch,
} = {}) {
  const key = `ca:${url}`;
  try {
    const hit = JSON.parse(storage?.getItem(key) ?? 'null');
    if (hit && typeof hit.t === 'number' && now() - hit.t < ttlMs) return hit.data;
  } catch { /* corrupt or blocked cache: fetch live */ }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let data;
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    data = await res.json();
  } finally {
    clearTimeout(timer);
  }
  try { storage?.setItem(key, JSON.stringify({ t: now(), data })); } catch { /* storage full or blocked */ }
  return data;
}

let jsonpSeq = 0;

/**
 * fetch()-compatible loader for World Bank endpoints that send no CORS headers (the ICP "sources" API).
 * The World Bank v2 API answers format=jsonp with a script calling our callback. Honors AbortSignal.
 */
export function jsonpFetch(url, { signal, doc = globalThis.document } = {}) {
  return new Promise((resolve, reject) => {
    const name = `__caJsonp${Date.now().toString(36)}${jsonpSeq++}`;
    const u = new URL(url);
    u.searchParams.set('format', 'jsonp');
    u.searchParams.set('prefix', name);
    const script = doc.createElement('script');
    const done = () => { delete globalThis[name]; script.remove?.(); };
    globalThis[name] = (data) => { done(); resolve({ ok: true, status: 200, json: async () => data }); };
    script.onerror = () => { done(); reject(new Error(`JSONP failed for ${url}`)); };
    signal?.addEventListener('abort', () => { done(); reject(new Error(`JSONP timeout for ${url}`)); });
    script.src = u.toString();
    doc.head.appendChild(script);
  });
}

// ---------- Parsers (pure) ----------

export function parseIcp(json) {
  const out = {};
  for (const row of json?.source?.data ?? []) {
    if (!Number.isFinite(row.value)) continue;
    const v = Object.fromEntries(row.variable.map((x) => [x.concept, x.id]));
    (out[v.Country] ??= {})[v.Series] = row.value;
  }
  return out;
}

export function priceLevels(byIso3) {
  const us = byIso3.USA;
  const out = {};
  if (!us) return out;
  for (const [code, c] of Object.entries(COUNTRIES)) {
    const row = byIso3[c.iso3];
    if (!row) continue;
    const lv = {};
    let complete = true;
    for (const [cat, id] of Object.entries(SERIES)) {
      if (!Number.isFinite(row[id]) || !Number.isFinite(us[id]) || us[id] === 0) { complete = false; break; }
      lv[cat] = (row[id] / us[id]) * 100;
    }
    if (complete) out[code] = lv;
  }
  return out;
}

export function parseEcb(json) {
  const dims = json.structure.dimensions;
  const curPos = dims.series.findIndex((d) => d.id === 'CURRENCY');
  const curs = dims.series[curPos].values.map((v) => v.id);
  const dates = dims.observation[0].values.map((v) => v.id);
  const perEur = { EUR: 1 };
  let date = '';
  for (const [key, s] of Object.entries(json.dataSets[0].series)) {
    const cur = curs[Number(key.split(':')[curPos])];
    const obsKeys = Object.keys(s.observations).map(Number).sort((a, b) => a - b);
    const last = obsKeys.at(-1);
    const value = s.observations[last]?.[0];
    if (cur && Number.isFinite(value) && value > 0) {
      perEur[cur] = value;
      if (dates[last] > date) date = dates[last];
    }
  }
  return { date, perEur };
}

export function crossRate(perEur, fromCur, toCur) {
  const a = perEur?.[fromCur], b = perEur?.[toCur];
  if (!(a > 0) || !(b > 0)) return null;
  return fromCur === toCur ? 1 : b / a;
}

export function parseWbCpi(json) {
  const out = {};
  for (const r of json?.[1] ?? []) if (Number.isFinite(r.value)) out[r.date] = r.value;
  return out;
}

export function parseBlsAnnual(json) {
  // BLS publishes the official annual average as period M13; without it, use the mean of 12 complete months.
  const byYear = {};
  for (const r of json?.Results?.series?.[0]?.data ?? []) {
    if (!/^M(0[1-9]|1[0-3])$/.test(r.period)) continue;
    const v = parseFloat(r.value);
    if (!Number.isFinite(v)) continue;
    (byYear[r.year] ??= {})[r.period] = v;
  }
  const out = {};
  for (const [y, months] of Object.entries(byYear)) {
    if (Number.isFinite(months.M13)) { out[y] = months.M13; continue; }
    const vals = Object.values(months);
    if (vals.length === 12) out[y] = Math.round((vals.reduce((a, b) => a + b, 0) / 12) * 1000) / 1000;
  }
  return out;
}

export function chainCpi(wb, bls) {
  const years = Object.keys(wb).map(Number);
  if (!years.length) return { ...wb };
  const last = Math.max(...years);
  const out = { ...wb };
  if (!Number.isFinite(bls[last])) return out;
  for (const [y, v] of Object.entries(bls)) {
    if (Number(y) > last) out[y] = (wb[last] * v) / bls[last];
  }
  return out;
}

export function parseSidraDecember(json) {
  const out = {};
  for (const r of Array.isArray(json) ? json : []) {
    const m = /^(\d{4})12$/.exec(r.D3C ?? '');
    if (!m || Number(m[1]) < 1995) continue;
    const v = parseFloat(r.V);
    if (Number.isFinite(v)) out[m[1]] = v;
  }
  return out;
}

// ---------- Loaders ----------

export async function loadPriceLevels() {
  const iso3s = Object.values(COUNTRIES).map((c) => c.iso3);
  // The ICP "sources" endpoint sends no CORS headers; JSONP works from any page (no server needed).
  const json = await fetchCached(URLS.icp(iso3s, Object.values(SERIES)), { fetchImpl: jsonpFetch });
  const levels = priceLevels(parseIcp(json));
  if (!levels.US) throw new Error('ICP: missing United States reference');
  return { levels, source: 'World Bank ICP 2021' };
}

export async function loadRates() {
  const curs = [...new Set(Object.values(COUNTRIES).map((c) => c.cur).filter((c) => c !== 'EUR'))];
  const { date, perEur } = parseEcb(await fetchCached(URLS.ecb(curs)));
  if (!date) throw new Error('ECB: no observations');
  return { date, perEur, source: 'ECB' };
}

const lastYearOf = (values) => Math.max(...Object.keys(values).map(Number));

export async function loadUsCpi() {
  const [wbJson, blsJson] = await Promise.all([fetchCached(URLS.wbCpi), fetchCached(URLS.bls).catch(() => null)]);
  const wb = parseWbCpi(wbJson);
  if (!Object.keys(wb).length) throw new Error('World Bank CPI: empty');
  const values = blsJson ? chainCpi(wb, parseBlsAnnual(blsJson)) : wb;
  return { values, lastYear: lastYearOf(values), source: 'World Bank (FP.CPI.TOTL) + BLS CPI-U' };
}

export async function loadIpca() {
  const values = parseSidraDecember(await fetchCached(URLS.sidra));
  if (!Object.keys(values).length) throw new Error('SIDRA: empty');
  return { values, lastYear: lastYearOf(values), source: 'IBGE · IPCA (SIDRA, tabela 1737)' };
}

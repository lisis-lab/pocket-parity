# CentAtlas Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the site as CentAtlas — elegant planner-ledger look, 7 visitor themes, EN/PT pages — with Pocket Parity plus three new tools, all fed by official data fetched live in the browser.

**Architecture:** Static site in `site/`, no build, no server. One HTML file per page per language holds all UI copy. Shared ES modules in `site/assets/js/`: pure calculations (`calc/`), a data layer that fetches official APIs with timeout and a 24 h cache and parses their responses (`data/sources.js`), a loading-state controller (`status.js`), formatting, themes and per-page wiring (`ui/`). With no data, no numbers are shown — only a slow/offline notice.

**Tech Stack:** HTML, CSS custom properties, vanilla ES modules, `fetch` + `AbortController`, `Intl.NumberFormat`; Node ≥18 `node:test` (no npm dependencies); Google Fonts (Newsreader, Hanken Grotesk, IBM Plex Mono, IBM Plex Serif).

**Spec:** `docs/superpowers/specs/2026-11-06-centatlas-redesign-design.md`

## Global Constraints

- Brand on every page: "Cent·Atlas" (logo) / "CentAtlas" (text). Provisional; repo `lisis-lab/pocket-parity` and Cloudflare project `pocketparity` are NOT renamed.
- Static site, no build, no server, no npm dependencies. Modules load with `<script type="module">`.
- All UI copy lives in page HTML; JS holds no sentences. Exception: country names are data in `countries.js` as `{en, pt}`.
- **No data, no number.** No price level, exchange rate or index value is ever embedded in HTML/JS or estimated. Numbers that depend on data render only in the `ready` state.
- Data sources and series exactly as in the spec's "Dados" table (ICP 2021 `PX.WL` rebased US = 100; ECB `EXR` cross rates; WB `FP.CPI.TOTL` chained with BLS `CUUR0000SA0`; SIDRA 1737/2266 December index from 1995).
- Cache: successful responses only, `localStorage`, 24 h TTL, every access in `try/catch`. Expired cache is never shown.
- Slow notice after 6 s. Fetch timeout 20 s. Notice copy (verbatim): EN slow "Official data is taking longer than usual to load…", EN error "Can't reach the official data sources right now. Check your connection."; PT slow "Os dados oficiais estão demorando mais que o normal…", PT error "Não foi possível acessar as fontes oficiais agora. Verifique sua conexão."; retry button "Try again" / "Tentar de novo".
- Every page: `<html lang="en">` or `lang="pt-BR"`, `<title>`, `<meta name="description">`, viewport, `hreflang` to itself + pair + `x-default` (EN), `/assets/centatlas.css`, `<select id="theme">`.
- Light theme tokens (verbatim): bg `#faf8f3`, card `#ffffff`, ink `#14261f`, muted `#66756f`, line `#e7e2d6`, forest `#1e4d3f`, brass `#a8823a`, dear `#b4532a`, cheap `#1d7a4f`. Text contrast AA in every theme; `contrast` targets AAA.
- Formulas go into `docs/methodology.md` in the same task as the code that uses them.
- Work on `feat/centatlas-redesign`; PR to `develop`. `npm run check` passes before each commit.

## Review Focus

1. Locale-typed decimals — "1.234,56" on PT, "1,234.56" on EN — parse to 1234.56 (tests in Task 1).
2. Same origin and destination country — ratios exactly 1, tables show 0%, rate 1 (tests in Tasks 2, 3, 5).
3. An API answers but lacks a country/year (ICP missing a series for one country, BLS mid-year with < 12 months, SIDRA without December) — that item is dropped, never filled in; a tool whose selected country has no data shows the error state for it (tests in Task 2).
4. `localStorage` throwing or holding corrupt JSON — theme and cache degrade to "no cache", pages still fetch live (tests in Tasks 1 and 2).
5. Empty, zero, negative or non-numeric inputs, and a zero/blank exchange rate — treated as 0 or `null`, UI shows "—", never NaN/Infinity (tests in Tasks 1, 5, 6).

---

### Task 1: Foundation — styles, themes, formatting, countries, audit

**Files:**
- Create: `site/assets/centatlas.css`, `site/assets/js/theme.js`, `site/assets/js/format.js`, `site/assets/js/countries.js`, `docs/page-template.md`
- Create: `tests/format.test.mjs`, `tests/theme.test.mjs`, `tests/check.test.mjs`
- Modify: `check.mjs`, `package.json`

**Interfaces:**
- Produces (`format.js`): `localeFor(lang): 'en-US'|'pt-BR'`; `money(value, currency, lang): string` (0 decimals if `|v| ≥ 1000` or `JPY`, else 2; non-finite → `"—"`); `pct(ratio, lang): string` (signed whole % of `ratio − 1`; non-finite → `"—"`); `parseNumber(text, lang): number` (invalid/empty → 0); `fmtNumber(value, lang, decimals): string`.
- Produces (`theme.js`): `THEMES = ['light','dark','sepia','contrast','sheet','terminal','ledger']`; `readSaved(storage): string|null` (null on throw); `resolveTheme(saved, prefersDark): string`; `initThemeSelect(select): void`.
- Produces (`countries.js`): `COUNTRIES: Record<code, {name:{en,pt}, cur, iso3}>` for the 17 prototype codes US CA MX BR GB CH NO DE FR NL IT ES PT GR JP TH AU (iso3 USA CAN MEX BRA GBR CHE NOR DEU FRA NLD ITA ESP PRT GRC JPN THA AUS; currencies as in the prototype); `CATEGORIES = ['rest','food','trans','rec','cloth']`; `countryName(code, lang)`; `fillCountrySelect(select, lang, selected)` (options "Name (CUR)", sorted by localized name). **No numeric data.**
- Produces (`check.mjs`): `export function audit(root): string[]`.

- [ ] **Step 1: Write failing tests**

```js
// tests/format.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { money, pct, parseNumber, localeFor } from '../site/assets/js/format.js';
const n = s => s.replace(/ | /g, ' ');
test('localeFor', () => { assert.equal(localeFor('pt-BR'), 'pt-BR'); assert.equal(localeFor('en'), 'en-US'); });
test('money', () => {
  assert.equal(money(5000, 'USD', 'en'), '$5,000');
  assert.equal(n(money(5000, 'USD', 'pt-BR')), 'US$ 5.000');
  assert.equal(money(12.5, 'USD', 'en'), '$12.50');
  assert.equal(n(money(150, 'JPY', 'en')), '¥150');
  assert.equal(money(NaN, 'USD', 'en'), '—'); assert.equal(money(Infinity, 'USD', 'en'), '—');
});
test('pct', () => {
  assert.equal(pct(1.52, 'en'), '+52%'); assert.equal(pct(1, 'en'), '0%');
  assert.match(pct(0.7, 'en'), /^[−-]30%$/); assert.equal(pct(NaN, 'en'), '—');
});
test('parseNumber is locale-aware', () => {
  assert.equal(parseNumber('1,234.56', 'en'), 1234.56);
  assert.equal(parseNumber('1.234,56', 'pt-BR'), 1234.56);
  assert.equal(parseNumber('5.000', 'pt-BR'), 5000);
  assert.equal(parseNumber('0,884', 'pt-BR'), 0.884);
  assert.equal(parseNumber('', 'en'), 0); assert.equal(parseNumber('abc', 'en'), 0);
});
```

```js
// tests/theme.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { THEMES, resolveTheme, readSaved } from '../site/assets/js/theme.js';
test('seven themes', () => assert.deepEqual(THEMES, ['light','dark','sepia','contrast','sheet','terminal','ledger']));
test('resolveTheme', () => {
  assert.equal(resolveTheme('terminal', false), 'terminal');
  assert.equal(resolveTheme(null, true), 'dark'); assert.equal(resolveTheme(null, false), 'light');
  assert.equal(resolveTheme('bogus', true), 'dark');
});
test('readSaved survives a throwing storage', () => {
  assert.equal(readSaved({ getItem() { throw new Error('blocked'); } }), null);
  assert.equal(readSaved(undefined), null);
  assert.equal(readSaved({ getItem: () => 'sepia' }), 'sepia');
});
```

```js
// tests/check.test.mjs — temp site trees via fs.mkdtempSync, then audit(root)
// 'passes a valid EN/PT pair'                 → deepEqual []
// 'flags missing hreflang pair'                → an error includes 'hreflang'
// 'flags pair that does not link back'         → an error includes 'hreflang'
// 'flags page without theme selector'          → an error includes 'id="theme"'
// 'flags page without centatlas.css'           → an error includes 'centatlas.css'
// 'flags embedded data in a .js file under site/assets' (file containing `rate:1.38` or `P:{`) → an error includes 'embedded data'
```

- [ ] **Step 2: Run, verify FAIL** — `node --test tests/` → modules not found / `audit` not exported.
- [ ] **Step 3: Implement `format.js`, `theme.js`, `countries.js`.** `parseNumber`: `pt*` strips `.` and maps `,`→`.`; `en` strips `,`. `pct` uses `Intl.NumberFormat(locale,{style:'percent',signDisplay:'exceptZero',maximumFractionDigits:0})`. PT names: Estados Unidos, Canadá, México, Brasil, Reino Unido, Suíça, Noruega, Alemanha, França, Países Baixos, Itália, Espanha, Portugal, Grécia, Japão, Tailândia, Austrália.
- [ ] **Step 4: Implement `audit(root)`** — keep existing rules; add per page: `/assets/centatlas.css` link, `<select id="theme"`, `hreflang` en / pt-BR / x-default with existing targets that link back; for `site/**/*.js`: flag `/\brate:\s*\d/` or `/\bP:\s*\{/` as "embedded data". CLI runs only when executed directly (`import.meta.url === pathToFileURL(process.argv[1]).href`).
- [ ] **Step 5: Write `centatlas.css`** — structure classes `.top .wrap .eyebrow h1 .lead .hero .stmt .big .num .sect .grid .tool .tp .side table.ledger .tot .bar .note details.how .foot`; state classes driven by `main[data-state]`: `.when-loading`, `.when-slow`, `.when-error`, `.when-ready` shown only in their state; `.needs-data` hidden unless `ready`; `.skeleton` grey animated bars (respect `prefers-reduced-motion`). Theme blocks `:root[data-theme="…"]` redefine `--bg --card --ink --muted --line --accent --detail --dear --cheap --soft --font-display --font-body --font-num --radius --shadow`; values: `dark` bg `#101a17` card `#16231f` ink `#e4efeb` accent `#4fc3a1`; `sepia` bg `#f4ecd8` card `#fbf5e6` ink `#3b2f22` accent `#7a4e1d`; `contrast` black on white, dear `#a00000`, cheap `#005a00`, 112% font, 2px borders, 3px focus; `sheet` accent `#217346`, Calibri/Segoe UI/Arial, radius 0, bordered cells `#d4d4d4`, `.tot` `#e2efda` + 2px accent; `terminal` `#ffb000` on `#000`, all IBM Plex Mono, uppercase labels, radius 0, no shadow; `ledger` `#fbf7ea` with 22px ruled lines, IBM Plex Serif, accent `#7a1f1f`, double top border on `.tot`. `:root:not([data-theme])` takes `dark` tokens under `prefers-color-scheme: dark`. 16px gutter, no horizontal scroll at 375px; `.tp` single column under 720px.
- [ ] **Step 6: Write `docs/page-template.md`** — the exact `<head>` (charset, viewport, title, description, canonical, three hreflang, Google Fonts URL for the four families, `/assets/centatlas.css`, and before it `<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>`), the `.top` header (logo → `/` or `/pt/`, `<select id="theme">` with 7 translated labels, EN|PT link to the pair), the status block markup (`.when-slow`, `.when-error` with retry button, `.when-loading`), and the footer.
- [ ] **Step 7: Scripts** — `package.json`: `"test": "node --test tests/"`, `"check": "node --test tests/ && node check.mjs"`.
- [ ] **Step 8: Verify** — `node --test tests/` → PASS. (`npm run check` audit still fails on the two old pages; fixed in Tasks 3–4.)
- [ ] **Step 9: Commit** — `git commit -m "feat: base CentAtlas (estilos, 7 temas, formatação, países, auditoria)"`

---

### Task 2: Data layer and loading states

**Files:**
- Create: `site/assets/js/data/sources.js`, `site/assets/js/status.js`, `tests/sources.test.mjs`, `tests/status.test.mjs`, `tests/fixtures/{icp.json, ecb.json, wb-cpi.json, bls.json, sidra.json}`
- Modify: `docs/methodology.md` (new "Fontes de dados" section: series, rebase, cross rate, CPI chaining, December index, cache and no-number rule)

**Interfaces:**
- Consumes: `COUNTRIES`, `CATEGORIES` (countries.js).
- Produces (`data/sources.js`):
  - `URLS` — exact endpoints:
    - `icp(iso3s, series)` → `https://api.worldbank.org/v2/sources/90/country/${iso3s.join(';')}/series/${series.join(';')}/classification/PX.WL/time/YR2021?format=json&per_page=1000`
    - `ecb(curs)` → `https://data-api.ecb.europa.eu/service/data/EXR/D.${curs.join('+')}.EUR.SP00.A?lastNObservations=1&format=jsondata`
    - `wbCpi` → `https://api.worldbank.org/v2/country/USA/indicator/FP.CPI.TOTL?format=json&per_page=200&date=1960:2100`
    - `bls` → `https://api.bls.gov/publicAPI/v1/timeseries/data/CUUR0000SA0`
    - `sidra` → `https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/2266/p/all`
  - `SERIES = {all:'9260000', rest:'1111000', food:'1101000', trans:'1107000', rec:'9110000', cloth:'1103000'}`
  - `fetchCached(url, {ttlMs = 86_400_000, timeoutMs = 20_000, storage = globalThis.localStorage, now = Date.now, fetchImpl = globalThis.fetch} = {}): Promise<any>` — fresh cache → cached JSON; else fetch with `AbortController` timeout, non-2xx or bad JSON → throw; on success store `{t, data}` (try/catch). Corrupt or expired cache is ignored.
  - Pure parsers: `parseIcp(json): Record<iso3, Record<seriesId, number>>`; `priceLevels(byIso3): Record<code, {all,rest,food,trans,rec,cloth}>` (rebased `PX/PX_USA×100`; a country missing any series is omitted); `parseEcb(json): {date: string, perEur: Record<cur, number>}` (adds `EUR: 1`); `crossRate(perEur, fromCur, toCur): number|null`; `parseWbCpi(json): Record<year, number>` (non-null only); `parseBlsAnnual(json): Record<year, number>` (mean of M01–M12, only years with all 12); `chainCpi(wb, bls): Record<year, number>` (WB years as-is; each BLS year after WB's last: `wb[last] × bls[y]/bls[last]`; requires `bls[last]`, else returns `wb`); `parseSidraDecember(json): Record<year, number>` (rows with period `YYYY12`, year ≥ 1995; SIDRA's first row is the header).
  - Loaders (compose the above): `loadPriceLevels(): Promise<{levels, source:'World Bank ICP 2021'}>`, `loadRates(): Promise<{date, perEur, source:'ECB'}>`, `loadUsCpi(): Promise<{values, lastYear, source}>`, `loadIpca(): Promise<{values, lastYear, source}>`.
- Produces (`status.js`):
  - `statusAt({startedAt, now, settled, online, slowMs = 6000}): 'loading'|'slow'|'ready'|'error'|'offline'` — `settled` is `null|'ok'|'error'`; `online === false` and not ok → `'offline'`.
  - `trackStatus(main: HTMLElement, load: () => Promise<any>, onReady: (data) => void): void` — sets `main.dataset.state` (`offline` uses the error notice), ticks for the slow notice, wires the retry button (`[data-retry]`) and `online`/`offline` events to re-run `load`.

- [ ] **Step 1: Capture fixtures** — download each URL above once with `curl` (ICP for `USA;CHE;BRA` and all six series; ECB for `USD+CHF+BRL`) into `tests/fixtures/`. These are real responses used only by tests.
- [ ] **Step 2: Write failing tests**

```js
// tests/sources.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as S from '../site/assets/js/data/sources.js';
const fx = f => JSON.parse(readFileSync(new URL(`./fixtures/${f}`, import.meta.url)));
test('ICP rebased to US = 100', () => {
  const by = S.parseIcp(fx('icp.json')); const lv = S.priceLevels(by);
  for (const c of ['all','rest','food','trans','rec','cloth']) assert.equal(lv.US[c], 100);
  assert.ok(Math.abs(lv.CH.rest - by.CHE['1111000'] / by.USA['1111000'] * 100) < 1e-9);
  assert.ok(lv.BR.all < 100 && lv.CH.all > 100);
});
test('country missing a series is omitted', () => {
  const lv = S.priceLevels({ USA: { 9260000:1,1111000:1,1101000:1,1107000:1,9110000:1,1103000:1 }, CHE: { 9260000: 2 } });
  assert.ok(lv.US); assert.equal(lv.CH, undefined);
});
test('ECB cross rates', () => {
  const { perEur, date } = S.parseEcb(fx('ecb.json'));
  assert.match(date, /^\d{4}-\d{2}-\d{2}$/); assert.equal(perEur.EUR, 1);
  assert.ok(Math.abs(S.crossRate(perEur, 'USD', 'CHF') - perEur.CHF / perEur.USD) < 1e-12);
  assert.equal(S.crossRate(perEur, 'USD', 'USD'), 1);
  assert.equal(S.crossRate(perEur, 'USD', 'XXX'), null);
});
test('BLS annual keeps only complete years', () => {
  const y = S.parseBlsAnnual({ Results: { series: [{ data: [
    ...Array.from({ length: 12 }, (_, i) => ({ year: '2025', period: `M${String(i + 1).padStart(2, '0')}`, value: '300' })),
    { year: '2026', period: 'M01', value: '310' }] }] } });
  assert.deepEqual(y, { 2025: 300 });
});
test('chainCpi', () => assert.deepEqual(S.chainCpi({ 2023: 140, 2024: 144 }, { 2024: 310, 2025: 320 }),
  { 2023: 140, 2024: 144, 2025: 144 * 320 / 310 }));
test('chainCpi without overlap returns WB only', () => assert.deepEqual(S.chainCpi({ 2024: 144 }, { 2025: 320 }), { 2024: 144 }));
test('SIDRA December index from 1995', () => {
  const v = S.parseSidraDecember(fx('sidra.json'));
  assert.ok(!('1994' in v) && '1995' in v);
  assert.ok(Object.keys(v).every(y => Number(y) >= 1995));
});
test('fetchCached: fresh cache, expired cache, corrupt cache, failure', async () => {
  const mem = new Map(); const storage = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  let calls = 0; const ok = async () => { calls++; return { ok: true, json: async () => ({ v: calls }) }; };
  assert.deepEqual(await S.fetchCached('u', { storage, now: () => 0, fetchImpl: ok }), { v: 1 });
  assert.deepEqual(await S.fetchCached('u', { storage, now: () => 1000, fetchImpl: ok }), { v: 1 });           // cached
  assert.deepEqual(await S.fetchCached('u', { storage, now: () => 90_000_000, fetchImpl: ok }), { v: 2 });     // expired
  mem.set([...mem.keys()][0], '{bad'); assert.deepEqual(await S.fetchCached('u', { storage, now: () => 90_000_001, fetchImpl: ok }), { v: 3 });
  const bad = async () => ({ ok: false, status: 503 });
  await assert.rejects(S.fetchCached('v', { storage, now: () => 0, fetchImpl: bad }));
  const throwing = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
  assert.deepEqual(await S.fetchCached('w', { storage: throwing, now: () => 0, fetchImpl: ok }), { v: 4 });
});
```

```js
// tests/status.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { statusAt } from '../site/assets/js/status.js';
test('states', () => {
  assert.equal(statusAt({ startedAt: 0, now: 1000, settled: null, online: true }), 'loading');
  assert.equal(statusAt({ startedAt: 0, now: 6000, settled: null, online: true }), 'slow');
  assert.equal(statusAt({ startedAt: 0, now: 100, settled: 'ok', online: true }), 'ready');
  assert.equal(statusAt({ startedAt: 0, now: 100, settled: 'error', online: true }), 'error');
  assert.equal(statusAt({ startedAt: 0, now: 100, settled: null, online: false }), 'offline');
  assert.equal(statusAt({ startedAt: 0, now: 100, settled: 'ok', online: false }), 'ready');
});
```

- [ ] **Step 3: Run, verify FAIL** — `node --test tests/sources.test.mjs tests/status.test.mjs`.
- [ ] **Step 4: Implement `sources.js` and `status.js`** (signatures above). Cache key: `'ca:' + url`.
- [ ] **Step 5: Run, verify PASS.**
- [ ] **Step 6: Live smoke test** — `node -e "import('./site/assets/js/data/sources.js').then(async S=>{console.log(Object.keys((await S.loadPriceLevels()).levels).length, (await S.loadRates()).date, (await S.loadUsCpi()).lastYear, (await S.loadIpca()).lastYear)})"` with `globalThis.localStorage` absent. Expected: `17`, a recent date, last complete US year, last complete BR year. If ICP returns fewer than 17 countries, stop and report which are missing.
- [ ] **Step 7: Document in `docs/methodology.md`** and **commit** — `git commit -m "feat: camada de dados oficiais no navegador (ICP 2021, BCE, WB/BLS, SIDRA) e estados de carregamento"`

---

### Task 3: Pocket Parity on the new base (EN + PT)

**Files:**
- Create: `site/assets/js/calc/parity.js`, `site/assets/js/ui/parity.js`, `site/pt/pocket-parity/index.html`, `tests/parity.test.mjs`
- Modify: `site/pocket-parity/index.html` (rewrite; no inline CSS/JS, no `const C` data)

**Interfaces:**
- Consumes: `loadPriceLevels`, `loadRates`, `crossRate` (sources.js); `trackStatus` (status.js); `COUNTRIES`, `fillCountrySelect`, `countryName`; `money`, `pct`, `parseNumber`; `initThemeSelect`.
- Produces (`calc/parity.js`): `parity({amount, rate, pOrig, pDest}): {ratio, cash, feelsLike, needed, neededLocal} | null` (`ratio = pDest.all/pOrig.all`; `null` if `rate <= 0` or levels missing); `itemPrice(price, rate, pOrigC, pDestC): {there, homeEquivalent}`; `readParams(search): {amount?, from?, to?}` (unknown codes ignored).

- [ ] **Step 1: Write failing tests**

```js
// tests/parity.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { parity, itemPrice, readParams } from '../site/assets/js/calc/parity.js';
const US = { all: 100, rest: 100 }, CH = { all: 150, rest: 150 };
test('US → CH, $5,000 at 0.8', () => {
  const r = parity({ amount: 5000, rate: 0.8, pOrig: US, pDest: CH });
  assert.equal(r.cash, 4000); assert.equal(r.ratio, 1.5);
  assert.ok(Math.abs(r.feelsLike - 3333.333) < 0.001);
  assert.equal(r.needed, 7500); assert.equal(r.neededLocal, 6000);
});
test('same country → ratio 1', () => {
  const r = parity({ amount: 100, rate: 1, pOrig: US, pDest: US });
  assert.equal(r.ratio, 1); assert.equal(r.feelsLike, 100);
});
test('zero rate or missing levels → null', () => {
  assert.equal(parity({ amount: 1, rate: 0, pOrig: US, pDest: CH }), null);
  assert.equal(parity({ amount: 1, rate: 1, pOrig: US, pDest: undefined }), null);
});
test('itemPrice', () => assert.deepEqual(itemPrice(60, 0.8, 100, 150), { there: 72, homeEquivalent: 90 }));
test('readParams', () => {
  assert.deepEqual(readParams('?amount=5000&to=CH'), { amount: 5000, to: 'CH' });
  assert.deepEqual(readParams('?to=XX&amount=abc'), {});
});
```

- [ ] **Step 2: Run, verify FAIL.**
- [ ] **Step 3: Implement `calc/parity.js`.**
- [ ] **Step 4: Run, verify PASS.**
- [ ] **Step 5: Pages + `ui/parity.js`** — same features as the prototype (verdict, three answers, 7-item table, swap, editable rate with reset, remembered countries in try/catch), laid out per spec v2. Item rows are static HTML rows with `data-cat` and a home-price input; the default home price for each item is the prototype's USD price (`data-usd`: dinner 60, hotel 160, coffee 9, grocery 80, transit 10, museum 25, jeans 60) converted with the live `crossRate('USD', homeCur)` × `levels[home][cat]/100` and rounded with the prototype's `nice()` — this is a default for an editable input, not data. All result numbers carry `.needs-data`; rate input starts empty and is filled when rates load; source line "Price levels: World Bank ICP 2021 · Rates: ECB, <date>". `trackStatus(main, () => Promise.all([loadPriceLevels(), loadRates()]), render)`. URL params override defaults. Defaults EN US→CH, $5,000; PT BR→PT, R$ 5.000. `details.how` with the four formulas. If the selected country is absent from `levels`, show the error block.
- [ ] **Step 6: Verify** — `npm run check` (audit may still flag home pages until Task 4). Browser via `python -m http.server 8000 -d site`: loads with skeleton then numbers; devtools "Offline" + reload with cleared storage → error notice, no numbers; throttle "Slow 3G" → slow notice after 6 s; "1.234,56" on PT parses.
- [ ] **Step 7: Commit** — `git commit -m "feat: Pocket Parity com dados oficiais ao vivo, en/pt"`

---

### Task 4: Home pages with the mini calculator (EN + PT) and brand in docs

**Files:**
- Create: `site/pt/index.html`, `site/assets/js/ui/home.js`
- Modify: `site/index.html` (rewrite), `README.md`, `CLAUDE.md`, `docs/handoff.md`, `docs/decisions.md`

**Interfaces:**
- Consumes: `parity`; `loadPriceLevels`, `loadRates`, `crossRate`; `trackStatus`; `COUNTRIES`, `fillCountrySelect`, `countryName`; `money`, `pct`, `parseNumber`; `initThemeSelect`.

- [ ] **Step 1: Pages** — hero (eyebrow "Money tools · official data" / "Ferramentas de dinheiro · dados oficiais", title "Know what your money is *really* worth." / "Saiba quanto seu dinheiro *realmente* vale.", lead), mini calculator in `.stmt` (amount, destination; origin under "from United States ▾" / "de Brasil ▾"), answer sentence with `data-slot` spans — EN "In <dest>, your <amount> buys what <feels> buys at home.", PT "Em <dest>, seus <amount> compram o que <feels> compram em casa." — plus the most-expensive category with its `pct`, and "Open Pocket Parity →" carrying `?amount&from&to`. The mini calculator uses the same status blocks (compact). Sections "Travel money" / "Dinheiro de viagem" and "Personal finance" / "Finanças pessoais" with `.tool` cards and brass source labels (WORLD BANK ICP · ECB; BY CATEGORY; FEES & SPREAD; WORLD BANK · BLS / IBGE · IPCA).
- [ ] **Step 2: `ui/home.js`** — wires the above; same-country shows the static "Pick two different countries" / "Escolha dois países diferentes" element.
- [ ] **Step 3: Docs** — "Lisis Lab" → "CentAtlas (nome provisório)" in README, CLAUDE.md, handoff (repo/Cloudflare unchanged); CLAUDE.md rule updated: data fetched live in the browser in this version, no number without data. `docs/decisions.md` rows dated 2026-11-06: marca CentAtlas provisória; visual B v2; 7 temas; páginas por idioma; dados oficiais ao vivo no navegador (ICP 2021, BCE, WB+BLS, SIDRA) e sem número quando a fonte falha.
- [ ] **Step 4: Verify** — `npm run check` (only links to not-yet-built tools may be flagged). Browser: mini calculator, link into Pocket Parity, 7 themes persist across reload.
- [ ] **Step 5: Commit** — `git commit -m "feat: página inicial CentAtlas com mini calculadora; marca e regra de dados nos docs"`

---

### Task 5: Daily travel budget (EN + PT)

**Files:**
- Create: `site/assets/js/calc/budget.js`, `site/assets/js/ui/budget.js`, `site/travel-budget/index.html`, `site/pt/orcamento-de-viagem/index.html`, `tests/budget.test.mjs`
- Modify: `docs/methodology.md` ("Daily travel budget")

**Interfaces:**
- Consumes: `loadPriceLevels`, `loadRates`, `crossRate`; `trackStatus`; `COUNTRIES`, `CATEGORIES`, `fillCountrySelect`; `money`, `pct`, `parseNumber`; `initThemeSelect`.
- Produces (`calc/budget.js`): `dailyBudget({home, rate, pOrig, pDest, days}): {rows:{cat, home, ratio, there}[], perDayHome, perDayThere, perDayThereInHome, tripThere, tripThereInHome, vsHome} | null` — `there_c = home_c × rate × pDest[c]/pOrig[c]`; negative/non-finite `home_c` → 0; `days → max(1, floor(days))`; `vsHome = perDayThereInHome/perDayHome` (`null` when `perDayHome` is 0); `null` when `rate <= 0` or levels missing; rows in `CATEGORIES` order.

- [ ] **Step 1: Document the formulas.**
- [ ] **Step 2: Write failing tests**

```js
// tests/budget.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { dailyBudget } from '../site/assets/js/calc/budget.js';
const US = { rest: 100, food: 100, trans: 100, rec: 100, cloth: 100 };
const CH = { rest: 150, food: 160, trans: 135, rec: 140, cloth: 120 };
const home = { rest: 150, food: 20, trans: 25, rec: 30, cloth: 15 };
test('US → CH, 7 days at 0.8', () => {
  const r = dailyBudget({ home, rate: 0.8, pOrig: US, pDest: CH, days: 7 });
  assert.equal(r.rows[0].cat, 'rest'); assert.equal(r.rows[0].there, 180);
  assert.equal(r.perDayHome, 240);
  assert.ok(Math.abs(r.perDayThere - 280.6) < 1e-9);   // 180 + 25.6 + 27 + 33.6 + 14.4
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
```

- [ ] **Step 3: Run, verify FAIL.**  - [ ] **Step 4: Implement.**  - [ ] **Step 5: Run, verify PASS.**
- [ ] **Step 6: Pages + `ui/budget.js`** — `.side`: from, to, days, rate (filled from ECB, editable, reset), inputs per category — EN "Lodging & dining / Groceries / Transport / Leisure / Shopping", PT "Hospedagem e restaurantes / Supermercado / Transporte / Lazer / Compras"; default per-day amounts USD 150/20/25/30/15 converted to the home currency with `crossRate('USD', homeCur)` × `levels[home][c]/100`, rounded with `nice()` (input defaults, recomputed when the home country changes). `.stmt`: trip total, per day, above/below home; `table.ledger` Category · Home · Price level (pct + bar) · There/day + `.tot`. Status blocks, source line, `details.how`. Defaults EN US→CH 7 days; PT BR→PT 7 days.
- [ ] **Step 7: Verify** — `npm run check`; browser at 375px/desktop in `light`, `sheet`, `terminal`, plus offline.
- [ ] **Step 8: Commit** — `git commit -m "feat: orçamento diário de viagem com dados ao vivo (en/pt)"`

---

### Task 6: Card vs. cash (EN + PT)

**Files:**
- Create: `site/assets/js/calc/cardcash.js`, `site/assets/js/ui/cardcash.js`, `site/card-vs-cash/index.html`, `site/pt/cartao-ou-dinheiro/index.html`, `tests/cardcash.test.mjs`
- Modify: `docs/methodology.md` ("Card vs. cash")

**Interfaces:**
- Consumes: `loadRates`, `crossRate`; `trackStatus`; `COUNTRIES`, `fillCountrySelect`; `money`, `pct`, `parseNumber`; `initThemeSelect`.
- Produces (`calc/cardcash.js`): `compareCosts({amount, midRate, card:{spread, fee}, atm:{spread, fixedFee, localFee}, bureau:{spread}, iof = 0}): {reference, options:{id, cost, extra, extraPct}[], cheapest} | null` — decimals (0.03 = 3%); `reference = amount/midRate`; `card = reference×(1+spread)×(1+fee)×(1+iof)`; `atm = reference×(1+spread)×(1+iof) + fixedFee + localFee/midRate`; `bureau = reference×(1+spread)`; `extra = cost − reference`; `extraPct = reference ? extra/reference : 0`; `cheapest` = lowest cost, ties in card → atm → bureau order; negatives → 0; `null` when `midRate <= 0`.

- [ ] **Step 1: Document the formulas** (IOF on card and ATM only, user-entered, empty by default).
- [ ] **Step 2: Write failing tests**

```js
// tests/cardcash.test.mjs
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
```

- [ ] **Step 3: Run, verify FAIL.**  - [ ] **Step 4: Implement.**  - [ ] **Step 5: Run, verify PASS.**
- [ ] **Step 6: Pages + `ui/cardcash.js`** — `.side`: home and destination, amount (destination currency), mid-market rate (empty until ECB loads, editable — if the visitor types one, the tool works without data); fieldsets Card (spread %, foreign fee %), ATM (spread %, bank fee in home currency, local fee in destination currency), Exchange bureau (spread %); PT adds "IOF (%)", empty, with a one-line explanation. Example defaults labelled "Example values — check your bank's" / "Valores de exemplo — confira os do seu banco": card 2 / 3; ATM 1, bank fee 5 (home currency, converted from USD 5 with the live rate), local fee 4 (destination currency, converted from USD 4); bureau 6 — fee defaults that need a rate stay empty until rates load. % inputs ÷ 100. `.stmt`: cheapest and savings vs. most expensive; `table.ledger` Method · Cost · Extra · Extra % with bars; DCC note. Results show only when a rate exists (live or typed); otherwise status blocks. Defaults EN US→CH 500; PT BR→PT 500.
- [ ] **Step 7: Verify** — `npm run check`; browser: clear all fee fields (no NaN); offline with a typed rate still computes.
- [ ] **Step 8: Commit** — `git commit -m "feat: cartão ou dinheiro (en/pt)"`

---

### Task 7: Inflation calculator (EN + PT)

**Files:**
- Create: `site/assets/js/calc/inflation.js`, `site/assets/js/ui/inflation.js`, `site/inflation-calculator/index.html`, `site/pt/calculadora-de-inflacao/index.html`, `tests/inflation.test.mjs`
- Modify: `docs/methodology.md` ("Inflation calculator")

**Interfaces:**
- Consumes: `loadUsCpi`, `loadIpca` (sources.js); `trackStatus`; `money`, `pct`, `parseNumber`; `initThemeSelect`. Page picks the loader by `<main data-series="us-cpi|br-ipca">`.
- Produces (`calc/inflation.js`): `adjust({amount, fromYear, toYear, values}): {value, cumulative, annualAvg, years}` (`value = amount×I[to]/I[from]`; `cumulative = I[to]/I[from] − 1`; `years = to − from`; `annualAvg = (I[to]/I[from])^(1/|years|) − 1`, 0 when years = 0; throws `RangeError` on a missing year); `milestones(values, fromYear, toYear, step = 5): {year, index}[]` (endpoints + multiples of `step` between, only years present, ascending); `yearRange(values): {min, max}`.

- [ ] **Step 1: Write failing tests**

```js
// tests/inflation.test.mjs
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
test('yearRange', () => assert.deepEqual(yearRange(values), { min: 2000, max: 2012 }));
```

- [ ] **Step 2: Run, verify FAIL.**  - [ ] **Step 3: Implement.**  - [ ] **Step 4: Run, verify PASS.**
- [ ] **Step 5: Document** — sources, chaining WB→BLS, December index, PT from 1995 (Real).
- [ ] **Step 6: Pages + `ui/inflation.js`** — eyebrow "Personal finance" / "Finanças pessoais"; `.side`: amount, from year, to year (selects filled from `yearRange` once data loads; disabled before); `.stmt`: "$100 in 2000 is worth $X in <year>" / "R$ 100 em 1995 equivalem a R$ X em <ano>" (`data-slot`), cumulative and average annual inflation; `table.ledger` of `milestones` (Year · Index · Value) with bars; source line ("World Bank (FP.CPI.TOTL) + BLS CPI-U" / "IBGE · IPCA, tabela 1737"). Defaults EN 100 USD 2000 → last year; PT 100 BRL 1995 → last year. Status blocks as elsewhere.
- [ ] **Step 7: Verify** — `npm run check` → PASS with zero audit errors (all pages exist). Browser: both pages, backwards years, offline.
- [ ] **Step 8: Commit** — `git commit -m "feat: calculadora de inflação com dados oficiais ao vivo (en/pt)"`

---

### Task 8: Final pass and PR

**Files:**
- Modify: whatever the checks turn up; `docs/handoff.md`

- [ ] **Step 1: Manual matrix** — 10 pages × 7 themes at 375 px and desktop: no horizontal scroll, readable contrast, visible focus, theme persists across pages, EN|PT lands on the pair, every number has its source line.
- [ ] **Step 2: Failure matrix** — with cleared storage: devtools Offline → error notice and no numbers on all data pages; Slow 3G → slow notice after 6 s then numbers; back online → retry/auto-reload shows numbers; storage blocked → pages still fetch live.
- [ ] **Step 3: Update `docs/handoff.md`** — CentAtlas state, the 4 tools, live data sources and their limits (ICP 2021 age, BLS 3-year window, rate limits: BLS v1 25 requests/day per visitor IP, softened by the 24 h cache), next steps (Eurostat 2023+ with Marlon's extrapolation rule, server/pipeline, domain, AdSense, SEO pages).
- [ ] **Step 4: Verify** — `npm run check` → PASS.
- [ ] **Step 5: Push and PR**

```bash
git push -u origin feat/centatlas-redesign
```

```bash
gh pr create --base develop --title "CentAtlas: visual próprio, 7 temas, dados oficiais ao vivo e 3 ferramentas novas (en/pt)" --fill
```

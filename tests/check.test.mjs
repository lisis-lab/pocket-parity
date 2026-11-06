import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { audit } from '../check.mjs';

function page({ lang = 'en', self, pair, pairLang, theme = true, css = true, xdef }) {
  return `<!doctype html><html lang="${lang}"><head>
<meta name="viewport" content="width=device-width">
<title>T</title><meta name="description" content="d">
${css ? '<link rel="stylesheet" href="/assets/centatlas.css">' : ''}
<link rel="alternate" hreflang="${lang}" href="${self}">
${pair ? `<link rel="alternate" hreflang="${pairLang}" href="${pair}">` : ''}
<link rel="alternate" hreflang="x-default" href="${xdef}">
</head><body>${theme ? '<select id="theme"></select>' : ''}</body></html>`;
}

function site(files) {
  const root = mkdtempSync(join(tmpdir(), 'ca-'));
  for (const [rel, content] of Object.entries({ 'assets/centatlas.css': '', ...files })) {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
  }
  return root;
}

const en = (o = {}) => page({ lang: 'en', self: '/', pair: '/pt/', pairLang: 'pt-BR', xdef: '/', ...o });
const pt = (o = {}) => page({ lang: 'pt-BR', self: '/pt/', pair: '/', pairLang: 'en', xdef: '/', ...o });

test('passes a valid EN/PT pair', () => {
  assert.deepEqual(audit(site({ 'index.html': en(), 'pt/index.html': pt() })), []);
});

test('flags missing hreflang pair', () => {
  const errs = audit(site({ 'index.html': en({ pair: null }), 'pt/index.html': pt() }));
  assert.ok(errs.some((e) => e.includes('hreflang')), errs.join('\n'));
});

test('flags pair that does not link back', () => {
  const errs = audit(site({ 'index.html': en(), 'pt/index.html': pt({ pair: '/other/' }), 'other/index.html': en({ self: '/other/', pair: '/pt/' }) }));
  assert.ok(errs.some((e) => e.includes('hreflang')), errs.join('\n'));
});

test('flags page without theme selector', () => {
  const errs = audit(site({ 'index.html': en({ theme: false }), 'pt/index.html': pt() }));
  assert.ok(errs.some((e) => e.includes('id="theme"')), errs.join('\n'));
});

test('flags page without centatlas.css', () => {
  const errs = audit(site({ 'index.html': en({ css: false }), 'pt/index.html': pt() }));
  assert.ok(errs.some((e) => e.includes('centatlas.css')), errs.join('\n'));
});

test('flags embedded data in a .js file under site/assets', () => {
  const errs = audit(site({ 'index.html': en(), 'pt/index.html': pt(), 'assets/js/x.js': 'const C={CA:{rate:1.38, P:{all:90}}}' }));
  assert.ok(errs.some((e) => e.includes('embedded data')), errs.join('\n'));
});

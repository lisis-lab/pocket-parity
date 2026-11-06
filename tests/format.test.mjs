import { test } from 'node:test';
import assert from 'node:assert/strict';
import { money, pct, parseNumber, localeFor, fmtNumber, rateFromField } from '../site/assets/js/format.js';

const n = (s) => s.replace(/ | /g, ' ');

test('localeFor', () => {
  assert.equal(localeFor('pt-BR'), 'pt-BR');
  assert.equal(localeFor('pt'), 'pt-BR');
  assert.equal(localeFor('en'), 'en-US');
});

test('money', () => {
  assert.equal(money(5000, 'USD', 'en'), '$5,000');
  assert.equal(n(money(5000, 'USD', 'pt-BR')), 'US$ 5.000');
  assert.equal(money(12.5, 'USD', 'en'), '$12.50');
  assert.equal(n(money(150, 'JPY', 'en')), '¥150');
  assert.equal(money(NaN, 'USD', 'en'), '—');
  assert.equal(money(Infinity, 'USD', 'en'), '—');
});

test('pct', () => {
  assert.equal(pct(1.52, 'en'), '+52%');
  assert.equal(pct(1, 'en'), '0%');
  assert.match(pct(0.7, 'en'), /^[−-]30%$/);
  assert.equal(pct(NaN, 'en'), '—');
});

test('parseNumber is locale-aware', () => {
  assert.equal(parseNumber('1,234.56', 'en'), 1234.56);
  assert.equal(parseNumber('1.234,56', 'pt-BR'), 1234.56);
  assert.equal(parseNumber('5.000', 'pt-BR'), 5000);
  assert.equal(parseNumber('0.884', 'en'), 0.884);
  assert.equal(parseNumber('0,884', 'pt-BR'), 0.884);
  assert.equal(parseNumber('', 'en'), 0);
  assert.equal(parseNumber('abc', 'en'), 0);
});

test('fmtNumber', () => {
  assert.equal(fmtNumber(1234.5678, 'en', 2), '1,234.57');
  assert.equal(n(fmtNumber(1234.5678, 'pt-BR', 1)), '1.234,6');
  assert.equal(fmtNumber(NaN, 'en', 2), '—');
});

test('rateFromField: untouched field uses the live rate, edited field uses the typed one', () => {
  assert.equal(rateFromField('0,0050', '0,0050', 0.004973, 'pt'), 0.004973);
  assert.equal(rateFromField('0,006', '0,0050', 0.004973, 'pt'), 0.006);
  assert.equal(rateFromField('', '0,0050', 0.004973, 'pt'), 0);
  assert.equal(rateFromField('1.2', '', null, 'en'), 1.2);
});

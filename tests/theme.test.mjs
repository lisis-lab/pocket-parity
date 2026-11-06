import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, resolveTheme, readSaved } from '../site/assets/js/theme.js';

test('seven themes', () => {
  assert.deepEqual(THEMES, ['light', 'dark', 'sepia', 'contrast', 'sheet', 'terminal', 'ledger']);
});

test('resolveTheme', () => {
  assert.equal(resolveTheme('terminal', false), 'terminal');
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme(null, false), 'light');
  assert.equal(resolveTheme('bogus', true), 'dark');
});

test('readSaved survives a throwing storage', () => {
  assert.equal(readSaved({ getItem() { throw new Error('blocked'); } }), null);
  assert.equal(readSaved(undefined), null);
  assert.equal(readSaved({ getItem: () => 'sepia' }), 'sepia');
});

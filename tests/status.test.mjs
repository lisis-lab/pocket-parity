import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statusAt } from '../site/assets/js/status.js';

test('states', () => {
  assert.equal(statusAt({ startedAt: 0, now: 1000, settled: null, online: true }), 'loading');
  assert.equal(statusAt({ startedAt: 0, now: 6000, settled: null, online: true }), 'slow');
  assert.equal(statusAt({ startedAt: 0, now: 100, settled: 'ok', online: true }), 'ready');
  assert.equal(statusAt({ startedAt: 0, now: 100, settled: 'error', online: true }), 'error');
  assert.equal(statusAt({ startedAt: 0, now: 100, settled: null, online: false }), 'offline');
  assert.equal(statusAt({ startedAt: 0, now: 100, settled: 'error', online: false }), 'offline');
  assert.equal(statusAt({ startedAt: 0, now: 100, settled: 'ok', online: false }), 'ready');
});

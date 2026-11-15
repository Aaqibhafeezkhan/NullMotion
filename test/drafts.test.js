import test from 'node:test';
import assert from 'node:assert/strict';
import { luminance } from '../public/drafts.mjs';

test('3-digit and 6-digit white have the same luminance', () => {
  assert.equal(luminance('#fff'), 1);
  assert.equal(luminance('#ffffff'), 1);
  assert.equal(luminance('#fff'), luminance('#ffffff'));
});

test('black has zero luminance', () => {
  assert.equal(luminance('#000'), 0);
  assert.equal(luminance('#000000'), 0);
  assert.equal(luminance('#000'), luminance('#000000'));
});

test('dark hex colours calculate luminance correctly', () => {
  const lum = luminance('#070708');
  assert.ok(lum > 0 && lum < 0.05);
  assert.equal(lum, (7 * 0.3 + 7 * 0.59 + 8 * 0.11) / 255);
});

test('unparsable and named colours fall back to light (luminance 1)', () => {
  assert.equal(luminance('white'), 1);
  assert.equal(luminance(''), 1);
  assert.equal(luminance(null), 1);
  assert.equal(luminance(undefined), 1);
  assert.equal(luminance('#12'), 1);
  assert.equal(luminance('#12345'), 1);
  assert.equal(luminance('#gggggg'), 1);
});

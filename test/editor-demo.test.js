import test from 'node:test';
import assert from 'node:assert/strict';
import * as model from '../public/editor-model.mjs';

const reference = (id, count) => ({ id, segments: Array.from({ length: count }, (_, index) => ({ ref: id, in: index, out: index + 1 })) });
const picks = [['69614b10fa87', 4], ['2896ae0eec89', 2], ['760ad39806d7', 1], ['3227c09daea3', 13]];

test('demo fills four clips from other references when no hardcoded pick exists', () => {
  assert.equal(typeof model.demoClipList, 'function', `demoClipList missing: expected a function, got ${typeof model.demoClipList}`);
  const library = [reference('aaa', 3), reference('bbb', 2), reference('ccc', 1)];
  const clips = model.demoClipList(library, picks);
  assert.equal(clips.length, 4, `expected 4 demo clips, got ${clips.length}`);
  const keys = clips.map(clip => `${clip.ref}:${clip.in}`);
  assert.equal(new Set(keys).size, 4, `demo clips must not repeat a segment: ${keys.join(', ')}`);
  assert.deepEqual(keys.slice(0, 3), ['aaa:0', 'bbb:0', 'ccc:0']);
});

test('demo keeps hardcoded picks first and skips duplicate fallbacks', () => {
  const library = [reference('2896ae0eec89', 3), reference('x', 1)];
  const clips = model.demoClipList(library, picks);
  assert.deepEqual(clips.map(clip => `${clip.ref}:${clip.in}`), ['2896ae0eec89:2', 'x:0', '2896ae0eec89:0', '2896ae0eec89:1']);
});

test('demo adds further segments of other references before further hardcoded segments', () => {
  const library = [reference('2896ae0eec89', 3), reference('x', 3)];
  const clips = model.demoClipList(library, picks);
  assert.deepEqual(clips.map(clip => `${clip.ref}:${clip.in}`), ['2896ae0eec89:2', 'x:0', 'x:1', 'x:2']);
});

test('demo returns every segment when the library has fewer than four', () => {
  const clips = model.demoClipList([reference('solo', 2)], picks);
  assert.equal(clips.length, 2);
});

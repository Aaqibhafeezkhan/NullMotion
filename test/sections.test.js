import test from 'node:test';
import assert from 'node:assert/strict';
import { HAND_BUILT, planSections, beatStarts } from '../public/sections.mjs';

test('hand-timed beats follow the hand-built cuts', () => {
  const names = ['a', 'b', 'c', 'd', 'e', 'f'];
  const sections = planSections({ id: HAND_BUILT.id }, { duration: 20, names });
  assert.deepEqual(sections.map(s => s.start), HAND_BUILT.cuts);
  assert.deepEqual(sections.map(s => s.end), [3, 5.75, 9.5, 13, 16.5, 20]);
  assert.deepEqual(sections.map(s => s.name), names);
  assert.deepEqual(sections.map(s => s.scrap), [0, 1, 2, 3, 4, 5]);
});

test('a two-beat draft snaps to the scene cut nearest the middle', () => {
  // Section 10..20: cuts at 30%..80% are 13..18; 15.4 is nearest 55% (15.5).
  assert.deepEqual(beatStarts(2, 10, 20, [11, 13.5, 15.4, 17.9, 19]), [0, 5.4]);
  const [section] = planSections({ id: 'r' }, {
    duration: 10,
    drafts: { aliases: {}, drafts: { r: { sections: [{ name: 'Intro', beats: [['text', 'x'], ['text', 'y']] }] } } },
    bounds: { r: [{ start: 0, end: 10 }] },
    cuts: { r: [6] },
  });
  assert.equal(section.name, 'Intro');
  assert.deepEqual(section.starts, [0, 6]);
});

test('cuts outside 30%-80% are ignored', () => {
  assert.deepEqual(beatStarts(2, 0, 10, [3, 8]), [0, 5.5]);
});

test('with no cut a two-beat draft falls back to 55%', () => {
  assert.deepEqual(beatStarts(2, 4, 14, []), [0, 5.5]);
});

test('three or more beats split the section evenly', () => {
  assert.deepEqual(beatStarts(3, 0, 9, [4.5]), [0, 3, 6]);
  assert.deepEqual(beatStarts(4, 2, 10, []), [0, 2, 4, 6]);
  assert.deepEqual(beatStarts(1, 0, 5, []), [0]);
});

test('without bounds the reference is split evenly into 3-8 sections', () => {
  const sections = planSections({ id: 'none' }, { duration: 9 });
  assert.equal(sections.length, 3);
  assert.deepEqual(sections.map(s => s.start), [0, 3, 6]);
  assert.equal(sections.at(-1).end, 9);
  assert.equal(sections[0].name, 'Part 1');
});

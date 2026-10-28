import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The exporter must crop the film like the page's object-fit: cover, not stretch it into the card.
const sourceText = await readFile(new URL('../public/demo.mjs', import.meta.url), 'utf8');

function drawExportFrameBody() {
  const from = sourceText.indexOf('async function drawExportFrame');
  assert.notEqual(from, -1, 'demo.mjs should define drawExportFrame');
  return sourceText.slice(from, sourceText.indexOf('\n}\n', from));
}

// The crop is computed from the frame and the card, so evaluate those lines as written.
function cropFor(film, f) {
  const body = drawExportFrameBody();
  const start = body.indexOf('const scaleToCover');
  assert.notEqual(start, -1, 'drawExportFrame should compute the cover crop');
  const end = body.indexOf('context.save()', start);
  const crop = new Function('film', 'f', `${body.slice(start, end)}\nreturn { sourceX, sourceY, sourceW, sourceH };`);
  return crop(film, f);
}

test('export draws the film with a centered source crop', () => {
  const body = drawExportFrameBody();
  const start = body.indexOf('context.drawImage(film,');
  assert.notEqual(start, -1, 'drawExportFrame should draw the film');
  let depth = 0, end = start + 'context.drawImage'.length;
  for (; end < body.length; end++) {
    if (body[end] === '(') depth++;
    if (body[end] === ')' && --depth === 0) break;
  }
  const args = body.slice(start + 'context.drawImage('.length, end).split(',').map(part => part.trim());
  assert.deepEqual(args, ['film', 'sourceX', 'sourceY', 'sourceW', 'sourceH', 'f.x', 'f.y', 'f.w', 'f.h'],
    `expected drawImage(film, sourceX, sourceY, sourceW, sourceH, f.x, f.y, f.w, f.h), got ${args.join(', ')}`);
});

test('vertical reference is cropped to the card width and centered vertically', () => {
  const card = { x: 0, y: 0, w: 1600, h: 900 };
  const film = { displayWidth: 1080, displayHeight: 1920 };
  const { sourceX, sourceY, sourceW, sourceH } = cropFor(film, card);
  assert.equal(sourceX, 0, 'no horizontal crop for a film narrower than the card ratio');
  assert.equal(sourceW, 1080, 'source keeps the full width');
  assert.ok(Math.abs(sourceH / sourceW - card.h / card.w) < 1e-9, 'source crop has the card aspect ratio');
  assert.ok(Math.abs(sourceY - (1920 - sourceH) / 2) < 1e-9, 'source crop is vertically centered');
});

test('wide reference is cropped to the card height and centered horizontally', () => {
  const card = { x: 0, y: 0, w: 1600, h: 900 };
  const film = { displayWidth: 2560, displayHeight: 1080 };
  const { sourceX, sourceY, sourceW, sourceH } = cropFor(film, card);
  assert.equal(sourceY, 0, 'no vertical crop for a film with a wider ratio than the card');
  assert.equal(sourceH, 1080, 'source keeps the full height');
  assert.ok(Math.abs(sourceW / sourceH - card.w / card.h) < 1e-9, 'source crop has the card aspect ratio');
  assert.ok(Math.abs(sourceX - (2560 - sourceW) / 2) < 1e-9, 'source crop is horizontally centered');
});

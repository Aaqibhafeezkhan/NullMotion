import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sourceText = await readFile(new URL('../public/demo.mjs', import.meta.url), 'utf8');

test('export streams to a selected file when the File System Access API is available', () => {
  assert.match(sourceText, /window\.showSaveFilePicker/);
  assert.match(sourceText, /new Mp4Muxer\.FileSystemWritableFileStreamTarget\(writable\)/);
  assert.match(sourceText, /fastStart: writable \? false : 'in-memory'/);
  assert.match(sourceText, /await writable\.close\(\)/);
});

test('export keeps the in-memory download fallback', () => {
  assert.match(sourceText, /new Mp4Muxer\.ArrayBufferTarget\(\)/);
  assert.match(sourceText, /new Blob\(\[muxer\.target\.buffer\]/);
});

test('cancelling the save picker restores the download control without rendering', () => {
  assert.match(sourceText, /error\?\.name === 'AbortError'/);
  assert.match(sourceText, /exporting = null; \$\('download'\)\.disabled = false/);
});

test('a failed disk write aborts the pending file', () => {
  assert.match(sourceText, /await writable\.abort\(\)/);
});

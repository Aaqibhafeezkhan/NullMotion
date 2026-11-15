import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Parses the preview page's source for the modifier contract of its shortcuts.
test('browser shortcuts with Alt, Ctrl or Cmd are left to the browser', async () => {
  const source = await readFile(new URL('../public/demo.mjs', import.meta.url), 'utf8');

  const handler = source.indexOf("document.addEventListener('keydown', event => {");
  assert.ok(handler > 0, 'shortcuts: the preview page needs its keydown handler');

  const modifiers = source.indexOf('if (event.altKey || event.ctrlKey || event.metaKey) return;', handler);
  assert.ok(modifiers > handler, 'shortcuts: the handler must ignore combinations with a modifier key');

  const firstShortcut = source.indexOf("if (event.code === 'Space')", handler);
  assert.ok(
    firstShortcut > modifiers,
    'shortcuts: the modifier guard must run before the page handles any bare key',
  );
});

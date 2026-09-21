import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const formPages = [
  'src/legacy-pages/contact.html',
  'src/legacy-pages/how_to_apply.html',
];

test('legacy booking forms ignore duplicate submissions while loading', async () => {
  for (const page of formPages) {
    const html = await readFile(page, 'utf8');
    assert.match(
      html,
      /async submitBooking\(\) \{\s+if \(this\.loading\) return;/,
      `${page} should return immediately while a booking submit is already in progress`,
    );
  }
});

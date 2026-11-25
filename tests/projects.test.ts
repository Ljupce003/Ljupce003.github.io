import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatProjectExcerpt, sortProjectEntries } from '../src/lib/project-utils.ts';

test('formatProjectExcerpt keeps short descriptions intact', () => {
  const short = 'A concise project description.';
  assert.equal(formatProjectExcerpt(short, 120), short);
});

test('formatProjectExcerpt truncates long descriptions cleanly with ellipsis', () => {
  const long = 'A'.repeat(130);
  const result = formatProjectExcerpt(long, 120);
  assert.equal(result.length, 121);
  assert.equal(result.endsWith('…'), true);
});

test('formatProjectExcerpt trims trailing whitespace before adding ellipsis', () => {
  const text = 'Hello world   extra text beyond limit';
  const result = formatProjectExcerpt(text, 14);
  assert.equal(result, 'Hello world…');
});

test('sortProjectEntries sorts by explicit order first, then alphabetically by title', () => {
  const entries = [
    { data: { title: 'Zeta' } },
    { data: { order: 2, title: 'Second' } },
    { data: { title: 'Alpha' } },
    { data: { order: 1, title: 'First' } },
  ];
  assert.deepEqual(
    sortProjectEntries(entries).map((entry) => entry.data.title),
    ['First', 'Second', 'Alpha', 'Zeta'],
  );
});

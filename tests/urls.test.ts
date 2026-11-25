import assert from 'node:assert/strict';
import { test } from 'node:test';
import { routes } from '../src/lib/urls.ts';

test('all static routes are root-relative and never contain double slashes', () => {
  for (const url of [routes.home(), routes.about(), routes.aboutContact(), routes.projects()]) {
    assert.equal(url.startsWith('/'), true, `Expected root-relative URL, got: ${url}`);
    assert.equal(url.includes('//'), false, `Unexpected double slash in URL: ${url}`);
  }
});

test('aboutContact appends #contact to the about route', () => {
  assert.equal(routes.aboutContact(), `${routes.about()}#contact`);
});

test('project(slug) builds a valid root-relative project URL and rejects empty slugs', () => {
  const url = routes.project('drive-hub');
  assert.equal(url.startsWith('/projects/drive-hub'), true, `Unexpected project URL: ${url}`);
  assert.equal(url.includes('//'), false);
  assert.throws(() => routes.project(''), /slug/i);
  assert.throws(() => routes.project('   '), /slug/i);
});

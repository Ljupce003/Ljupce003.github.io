import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import {
  checkDemoStatus,
  parseDemoUrls,
  type DemoButtonElement,
} from '../src/lib/demo-status.ts';

function makeButtonFixture(urls: string[], statusUrl: string | null = null) {
  const text: { textContent?: string | null } = {};
  const dot: { className?: string } = {};
  const btn: DemoButtonElement = {
    href: urls[0] ?? '',
    dataset: {},
    style: {},
    classList: { remove() {} },
    getAttribute: (name) => (name === 'data-demo-urls' ? JSON.stringify(urls) : statusUrl),
    querySelector: (selector) =>
      selector === '.demo-text' ? text : selector === '.status-dot' ? dot : null,
  };
  return { btn, text, dot };
}

test('parseDemoUrls normalizes bare hostnames, strips !ignore, and rejects unsafe protocols', () => {
  const parsed = parseDemoUrls(JSON.stringify(['backup.example', 'https://demo.example !ignore']));
  assert.deepEqual(parsed, [
    { url: 'https://backup.example/', skipCheck: false },
    { url: 'https://demo.example/', skipCheck: true },
  ]);
  assert.throws(() => parseDemoUrls(JSON.stringify(['javascript:alert(1)'])));
});

test('opaque cross-origin responses are reachable, not falsely offline or confirmed healthy', async () => {
  const { btn, text, dot } = makeButtonFixture(['https://demo.example']);
  await checkDemoStatus(btn, {
    origin: 'https://portfolio.example',
    fetchImpl: (async (_url, options) => {
      assert.equal(options?.mode, 'no-cors');
      assert.equal(options?.credentials, 'omit');
      assert.equal(options?.cache, 'no-store');
      assert(options?.signal);
      return { type: 'opaque', ok: false, status: 0 } as Response;
    }) as typeof fetch,
  });
  assert.equal(btn.dataset.demoStatus, 'reachable');
  assert.equal(text.textContent, 'Demo Reachable');
  assert.equal(btn.href, 'https://demo.example/');
  assert.match(dot.className ?? '', /bg-amber-500/);
});

test('a CORS-readable health response confirms the app is live without parsing the body', async () => {
  const { btn, text } = makeButtonFixture(['https://demo.example'], 'https://demo.example/health');
  await checkDemoStatus(btn, {
    origin: 'https://portfolio.example',
    fetchImpl: (async (url, options) => {
      assert.equal(url, 'https://demo.example/health');
      assert.equal(options?.mode, 'cors');
      return {
        ok: true,
        json: () => assert.fail('Health response body should not be parsed'),
      } as unknown as Response;
    }) as typeof fetch,
  });
  assert.equal(btn.dataset.demoStatus, 'online');
  assert.equal(text.textContent, 'Demo Live');
});

test('the configured cybersecurity game checks its GitHub Pages demo and shows green on HTTP success', async () => {
  const markdown = fs.readFileSync(
    new URL('../src/content/projects/cybersecurity-awareness-game.md', import.meta.url),
    'utf8',
  );
  const demoMatch = markdown.match(/^demo:\s*"([^"]+)"/m);
  const statusMatch = markdown.match(/^demoStatusUrl:\s*"([^"]+)"/m);
  assert(demoMatch?.[1] && statusMatch?.[1]);

  let requests = 0;
  const { btn, text, dot } = makeButtonFixture([demoMatch[1]], statusMatch[1]);
  await checkDemoStatus(btn, {
    origin: 'https://portfolio.example',
    fetchImpl: (async (url, options) => {
      requests++;
      assert.equal(url, 'https://bjovanceva.github.io/Safe-net-game/');
      assert.equal(options?.mode, 'cors');
      assert.equal(options?.credentials, 'omit');
      return { type: 'cors', ok: true, status: 200 } as Response;
    }) as typeof fetch,
  });
  assert.equal(requests, 1);
  assert.equal(btn.dataset.demoStatus, 'online');
  assert.equal(text.textContent, 'Demo Live');
  assert.match(dot.className ?? '', /bg-emerald-500/);
});

test('HTTP 503 from the health endpoint is offline while its demo remains clickable', async () => {
  const { btn } = makeButtonFixture(['https://demo.example'], 'https://demo.example/health');
  await checkDemoStatus(btn, {
    origin: 'https://portfolio.example',
    fetchImpl: (async () => ({ ok: false, status: 503 }) as Response) as typeof fetch,
  });
  assert.equal(btn.dataset.demoStatus, 'offline');
  assert.equal(btn.style.pointerEvents, 'auto');
  assert.equal(btn.href, 'https://demo.example/');
});

test('a blocked health check falls back to reachability rather than a false offline result', async () => {
  const modes: string[] = [];
  const { btn } = makeButtonFixture(['https://demo.example'], 'https://demo.example/health');
  await checkDemoStatus(btn, {
    origin: 'https://portfolio.example',
    fetchImpl: (async (_url, options) => {
      modes.push(String(options?.mode));
      if (options?.mode === 'cors') throw new TypeError('Failed to fetch');
      return { type: 'opaque', ok: false } as Response;
    }) as typeof fetch,
  });
  assert.deepEqual(modes, ['cors', 'no-cors']);
  assert.equal(btn.dataset.demoStatus, 'reachable');
});

test('network failures leave an unknown status and a working navigation link', async () => {
  const { btn } = makeButtonFixture(['https://demo.example']);
  await checkDemoStatus(btn, {
    origin: 'https://portfolio.example',
    fetchImpl: (async () => {
      throw new TypeError('Failed to fetch');
    }) as typeof fetch,
  });
  assert.equal(btn.dataset.demoStatus, 'unknown');
  assert.equal(btn.href, 'https://demo.example/');
  assert.equal(btn.style.pointerEvents, 'auto');
});

test('fallback hostnames use HTTPS instead of a path on the portfolio', async () => {
  const requested: string[] = [];
  const { btn } = makeButtonFixture(['https://first.example', 'backup.example']);
  await checkDemoStatus(btn, {
    origin: 'https://portfolio.example',
    fetchImpl: (async (url) => {
      requested.push(String(url));
      if (requested.length === 1) throw new Error('DNS failure');
      return { type: 'opaque', ok: false } as Response;
    }) as typeof fetch,
  });
  assert.deepEqual(requested, ['https://first.example/', 'https://backup.example/']);
  assert.equal(btn.href, 'https://backup.example/');
});

test('legacy skip flag is stripped and does not claim a verified live demo', async () => {
  const { btn } = makeButtonFixture(['https://demo.example !ignore']);
  await checkDemoStatus(btn, {
    origin: 'https://portfolio.example',
    fetchImpl: (() => assert.fail('Check should be skipped')) as unknown as typeof fetch,
  });
  assert.equal(btn.href, 'https://demo.example/');
  assert.equal(btn.dataset.demoStatus, 'unknown');
});

test('same-origin HTTP success remains readable', async () => {
  const { btn } = makeButtonFixture(['https://portfolio.example/demo']);
  await checkDemoStatus(btn, {
    origin: 'https://portfolio.example',
    fetchImpl: (async (_url, options) => {
      assert.equal(options?.mode, 'same-origin');
      return { type: 'basic', ok: true } as Response;
    }) as typeof fetch,
  });
  assert.equal(btn.dataset.demoStatus, 'online');
});

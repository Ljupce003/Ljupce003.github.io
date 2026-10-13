const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(require.resolve('../Assets/js/demo-status.js'), 'utf8');
function fixture(urls, fetch, statusUrl = null) {
  const text = {};
  const dot = {};
  const btn = {
    href: urls[0], dataset: {}, style: {}, classList: { remove() {} },
    getAttribute: name => name === 'data-demo-urls' ? JSON.stringify(urls) : statusUrl,
    querySelector: selector => selector === '.demo-text' ? text : selector === '.status-dot' ? dot : null,
  };
  const context = {
    fetch, URL, AbortController, setTimeout, clearTimeout,
    window: { location: { origin: 'https://portfolio.example' } },
    document: { addEventListener() {} },
  };
  vm.runInNewContext(source, context);
  return { btn, text, dot, check: () => context.checkDemoStatus(btn) };
}

test('opaque cross-origin responses are reachable, not falsely offline or confirmed healthy', async () => {
  const f = fixture(['https://demo.example'], async (url, options) => {
    assert.equal(options.mode, 'no-cors');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.cache, 'no-store');
    assert(options.signal);
    return { type: 'opaque', ok: false, status: 0 };
  });
  await f.check();
  assert.equal(f.btn.dataset.demoStatus, 'reachable');
  assert.equal(f.text.textContent, 'Demo Reachable');
  assert.equal(f.btn.href, 'https://demo.example/');
  assert.match(f.dot.className, /bg-amber-500/);
});

test('a CORS-readable health response confirms the app is live', async () => {
  const f = fixture(['https://demo.example'], async (url, options) => {
    assert.equal(url, 'https://demo.example/health');
    assert.equal(options.mode, 'cors');
    // Laravel's /up can return HTML; a readable HTTP success is sufficient.
    return { ok: true, json: () => assert.fail('Health response body should not be parsed') };
  }, 'https://demo.example/health');
  await f.check();
  assert.equal(f.btn.dataset.demoStatus, 'online');
  assert.equal(f.text.textContent, 'Demo Live');
});

test('the configured cybersecurity game checks its GitHub Pages demo and shows green on HTTP success', async () => {
  const projects = JSON.parse(fs.readFileSync(require.resolve('../projects.json'), 'utf8'));
  const game = projects.find(project => project.slug === 'cybersecurity-awareness-game');
  let requests = 0;
  const f = fixture([game.demo], async (url, options) => {
    requests++;
    assert.equal(url, 'https://bjovanceva.github.io/Safe-net-game/');
    assert.equal(options.mode, 'cors');
    assert.equal(options.credentials, 'omit');
    return { type: 'cors', ok: true, status: 200 };
  }, game.demoStatusUrl);
  await f.check();
  assert.equal(requests, 1);
  assert.equal(f.btn.dataset.demoStatus, 'online');
  assert.equal(f.text.textContent, 'Demo Live');
  assert.match(f.dot.className, /bg-emerald-500/);
});

test('HTTP 503 from the health endpoint is offline while its demo remains clickable', async () => {
  const f = fixture(['https://demo.example'], async () => ({ ok: false, status: 503 }), 'https://demo.example/health');
  await f.check();
  assert.equal(f.btn.dataset.demoStatus, 'offline');
  assert.equal(f.btn.style.pointerEvents, 'auto');
  assert.equal(f.btn.href, 'https://demo.example/');
});

test('a blocked health check falls back to reachability rather than a false offline result', async () => {
  const modes = [];
  const f = fixture(['https://demo.example'], async (_url, options) => {
    modes.push(options.mode);
    if (options.mode === 'cors') throw new TypeError('Failed to fetch');
    return { type: 'opaque', ok: false };
  }, 'https://demo.example/health');
  await f.check();
  assert.deepEqual(modes, ['cors', 'no-cors']);
  assert.equal(f.btn.dataset.demoStatus, 'reachable');
});

test('network failures leave an unknown status and a working navigation link', async () => {
  const f = fixture(['https://demo.example'], async () => { throw new TypeError('Failed to fetch'); });
  await f.check();
  assert.equal(f.btn.dataset.demoStatus, 'unknown');
  assert.equal(f.btn.href, 'https://demo.example/');
  assert.equal(f.btn.style.pointerEvents, 'auto');
});

test('fallback hostnames use HTTPS instead of a path on the portfolio', async () => {
  const requested = [];
  const f = fixture(['https://first.example', 'backup.example'], async url => {
    requested.push(url);
    if (requested.length === 1) throw new Error('DNS failure');
    return { type: 'opaque', ok: false };
  });
  await f.check();
  assert.deepEqual(requested, ['https://first.example/', 'https://backup.example/']);
  assert.equal(f.btn.href, 'https://backup.example/');
});

test('legacy skip flag is stripped and does not claim a verified live demo', async () => {
  const f = fixture(['https://demo.example !ignore'], () => assert.fail('Check should be skipped'));
  await f.check();
  assert.equal(f.btn.href, 'https://demo.example/');
  assert.equal(f.btn.dataset.demoStatus, 'unknown');
});

test('same-origin HTTP success remains readable', async () => {
  const f = fixture(['https://portfolio.example/demo'], async (_url, options) => {
    assert.equal(options.mode, 'same-origin');
    return { type: 'basic', ok: true };
  });
  await f.check();
  assert.equal(f.btn.dataset.demoStatus, 'online');
});

// A no-cors response proves reachability, but hides HTTP errors such as 503.
// Only a readable response from a status endpoint can confirm app health.
async function fetchDemoStatus(url, mode) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      mode,
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function updateDemoStatus(btn, state, url) {
  const states = {
    online: ['Demo Live', 'bg-emerald-500', 'The application health check passed.'],
    offline: ['Demo Offline', 'bg-rose-500', 'The server reports that the application is unavailable. You can still try opening it.'],
    reachable: ['Demo Reachable', 'bg-amber-500', 'The server responded, but the browser cannot verify its HTTP status.'],
    unknown: ['Demo', 'bg-amber-500', 'Availability could not be verified from this browser. You can still open the demo.'],
  };
  const [label, color, title] = states[state];
  if (url) btn.href = url;
  btn.title = title;
  btn.dataset.demoStatus = state;
  btn.style.pointerEvents = 'auto';
  btn.classList.remove('opacity-50', 'grayscale');
  btn.querySelector('.status-ping')?.remove();
  const dot = btn.querySelector('.status-dot');
  const text = btn.querySelector('.demo-text');
  if (dot) dot.className = `relative inline-flex rounded-full h-2.5 w-2.5 ${color} status-dot transition-colors duration-500`;
  if (text) text.textContent = label;
}

async function checkDemoStatus(btn) {
  try {
    const entries = JSON.parse(btn.getAttribute('data-demo-urls'));
    const urls = entries.filter(value => typeof value === 'string' && value.trim()).map(value => {
      const raw = value.replace('!ignore', '').trim();
      const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid demo URL');
      return { url: url.href, skipCheck: value.includes('!ignore') };
    });
    if (!urls.length) return;
    // Leave a usable link even when a request fails or a legacy flag skips checks.
    updateDemoStatus(btn, 'unknown', urls[0].url);
    const skipped = urls.find(entry => entry.skipCheck);
    if (skipped) {
      updateDemoStatus(btn, 'unknown', skipped.url);
      return;
    }

    const statusUrl = btn.getAttribute('data-demo-status-url');
    if (statusUrl) {
      try {
        const response = await fetchDemoStatus(statusUrl, 'cors');
        if (!response.ok) {
          updateDemoStatus(btn, 'offline');
          return;
        }
        updateDemoStatus(btn, 'online');
        return;
      } catch {
        // DNS, TLS, CORS, or timeout does not prove the app is down.
      }
    }

    for (const { url } of urls) {
      try {
        const sameOrigin = new URL(url).origin === window.location.origin;
        const response = await fetchDemoStatus(url, sameOrigin ? 'same-origin' : 'no-cors');
        if (response.type === 'opaque') {
          updateDemoStatus(btn, 'reachable', url);
          return;
        }
        if (response.ok) {
          updateDemoStatus(btn, 'online', url);
          return;
        }
      } catch {
        // Try the next configured demo without disabling navigation.
      }
    }
  } catch {
    // Malformed project data must not break the other demo buttons.
    updateDemoStatus(btn, 'unknown');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const buttons = [...document.querySelectorAll('.smart-demo-btn')];
  // Schedule after completion so slow requests never overlap the next refresh.
  async function refresh() {
    await Promise.all(buttons.map(checkDemoStatus));
    setTimeout(refresh, 30000);
  }
  await refresh();
});

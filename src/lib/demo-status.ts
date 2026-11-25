import type { DemoStatusState, DemoUrlEntry } from '../types/project.ts';

export interface DemoButtonElement {
  href: string;
  title?: string;
  dataset: Record<string, string | undefined>;
  style: { pointerEvents?: string };
  classList: { remove: (...tokens: string[]) => void };
  getAttribute: (name: string) => string | null;
  querySelector: (selector: string) => {
    className?: string;
    textContent?: string | null;
    remove?: () => void;
  } | null;
}

export interface DemoStatusDependencies {
  fetchImpl?: typeof fetch;
  origin?: string;
  timeoutMs?: number;
}

export const DEMO_STATUS_META: Record<
  DemoStatusState,
  { label: string; colorClass: string; title: string }
> = {
  online: {
    label: 'Demo Live',
    colorClass: 'bg-emerald-500',
    title: 'The application health check passed.',
  },
  offline: {
    label: 'Demo Offline',
    colorClass: 'bg-rose-500',
    title: 'The server reports that the application is unavailable. You can still try opening it.',
  },
  reachable: {
    label: 'Demo Reachable',
    colorClass: 'bg-amber-500',
    title: 'The server responded, but the browser cannot verify its HTTP status.',
  },
  unknown: {
    label: 'Demo',
    colorClass: 'bg-amber-500',
    title: 'Availability could not be verified from this browser. You can still open the demo.',
  },
};

export function applyDemoStatusToButton(
  btn: DemoButtonElement,
  state: DemoStatusState,
  url?: string,
): void {
  const { label, colorClass, title } = DEMO_STATUS_META[state];
  if (url) btn.href = url;
  btn.title = title;
  btn.dataset.demoStatus = state;
  btn.style.pointerEvents = 'auto';
  btn.classList.remove('opacity-50', 'grayscale');
  btn.querySelector('.status-ping')?.remove?.();

  const dot = btn.querySelector('.status-dot');
  const text = btn.querySelector('.demo-text');
  if (dot) {
    dot.className = `relative inline-flex rounded-full h-2.5 w-2.5 ${colorClass} status-dot transition-colors duration-500`;
  }
  if (text) {
    text.textContent = label;
  }
}

async function fetchDemoStatus(
  url: string,
  mode: RequestMode,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, {
      mode,
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function parseDemoUrls(rawJson: string | null): DemoUrlEntry[] {
  if (!rawJson) return [];
  const entries: unknown = JSON.parse(rawJson);
  if (!Array.isArray(entries)) {
    throw new Error('Invalid demo URLs payload');
  }

  return entries
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => {
      const skipCheck = value.includes('!ignore');
      const raw = value.replace(/!ignore/g, '').trim();
      const parsed = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(`Invalid demo URL protocol: ${parsed.protocol}`);
      }
      return { url: parsed.href, skipCheck };
    });
}

export async function checkDemoStatus(
  btn: DemoButtonElement,
  deps: DemoStatusDependencies = {},
): Promise<DemoStatusState | void> {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  const origin = deps.origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const timeoutMs = deps.timeoutMs ?? 8_000;

  try {
    const urls = parseDemoUrls(btn.getAttribute('data-demo-urls'));
    if (urls.length === 0) return;

    // Always leave the link clickable with a valid fallback URL even if checks fail.
    applyDemoStatusToButton(btn, 'unknown', urls[0].url);

    const skipped = urls.find((entry) => entry.skipCheck);
    if (skipped) {
      applyDemoStatusToButton(btn, 'unknown', skipped.url);
      return 'unknown';
    }

    const statusUrl = btn.getAttribute('data-demo-status-url');
    if (statusUrl) {
      try {
        const response = await fetchDemoStatus(statusUrl, 'cors', fetchImpl, timeoutMs);
        if (!response.ok) {
          applyDemoStatusToButton(btn, 'offline');
          return 'offline';
        }
        applyDemoStatusToButton(btn, 'online');
        return 'online';
      } catch {
        // DNS, TLS, CORS, or timeout does not prove the app is down; fall through.
      }
    }

    for (const { url } of urls) {
      try {
        const sameOrigin = origin !== '' && new URL(url).origin === origin;
        const response = await fetchDemoStatus(
          url,
          sameOrigin ? 'same-origin' : 'no-cors',
          fetchImpl,
          timeoutMs,
        );
        if (response.type === 'opaque') {
          applyDemoStatusToButton(btn, 'reachable', url);
          return 'reachable';
        }
        if (response.ok) {
          applyDemoStatusToButton(btn, 'online', url);
          return 'online';
        }
      } catch {
        // Try the next configured demo URL without disabling navigation.
      }
    }

    return 'unknown';
  } catch {
    // Malformed project data must never break other demo buttons.
    applyDemoStatusToButton(btn, 'unknown');
    return 'unknown';
  }
}

export function initDemoStatusPolling(root: Document = document, intervalMs = 30_000): () => void {
  const buttons = [...root.querySelectorAll<HTMLAnchorElement>('.smart-demo-btn')];
  let disposed = false;
  let timerId: ReturnType<typeof setTimeout> | undefined;

  async function refresh(): Promise<void> {
    await Promise.all(buttons.map((btn) => checkDemoStatus(btn)));
    if (!disposed && buttons.length > 0) {
      timerId = setTimeout(() => {
        void refresh();
      }, intervalMs);
    }
  }

  void refresh();

  return () => {
    disposed = true;
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
  };
}

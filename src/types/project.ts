export interface Project {
  slug: string;
  order?: number;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  /** Single demo URL, fallback list of URLs, or empty string when no demo exists. */
  demo?: string | string[];
  /** Optional public CORS-enabled health check endpoint (e.g. /health or GitHub Pages root). */
  demoStatusUrl?: string;
}

export type DemoStatusState = 'online' | 'offline' | 'reachable' | 'unknown';

export interface DemoUrlEntry {
  url: string;
  skipCheck: boolean;
}

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ljupchoangelovski.com',
  output: 'static',
  build: {
    format: 'directory',
  },
  // TO-DO(Bucket B.2 — URL structure & SEO):
  // Decide whether to use clean directory URLs (Astro default: build.format = 'directory' -> /about/, /projects/<slug>/)
  // or keep legacy .html URLs (build.format = 'file' -> /about.html, /projects/<slug>.html).
  // If switching to directory URLs, consider adding `redirects` here for old .html bookmarks & search index links.
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});

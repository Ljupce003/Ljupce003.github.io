# Ljupcho Angelovski — Portfolio

Hosted on GitHub Pages: **https://ljupchoangelovski.com**

Built with **Astro**, **TypeScript**, and **Tailwind CSS v4**, deployed automatically via GitHub Actions.

## Quick start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start local Astro dev server
- `npm run build` — build static site into `dist/`
- `npm run preview` — preview the production build locally
- `npm run check` — run Astro & TypeScript diagnostics
- `npm test` — run unit/contract tests (`node --test tests/*.test.ts`)

## Project structure

- `src/layouts/BaseLayout.astro` — shared HTML shell, SEO tags, favicons, anti-flash theme init
- `src/components/` — `Navbar`, `Footer`, `ProjectCard`, `TechBadges`, `DemoStatusButton`
- `src/pages/` — `index.astro`, `about.astro`, `projects/index.astro`, `projects/[slug].astro`
- `src/content.config.ts` — Astro Content Collections schema & loader
- `src/lib/` — `projects.ts` (project loading), `urls.ts` (route helpers), `demo-status.ts` (demo health checks)
- `src/data/projects.json` — migrated project data
- `public/` — static files (`CNAME`, `robots.txt`, `BingSiteAuth.xml`, `Assets/images/`, `Assets/favicon/`)
- `.github/workflows/deploy.yml` — GitHub Pages CI/CD build & deploy

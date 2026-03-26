# Ljupcho Angelovski — Portfolio

Hosted on GitHub Pages: **https://ljupchoangelovski.com**

This repo contains my personal portfolio website (projects, about page, and individual project pages). It’s a simple static site, but the HTML is generated from templates so the shared navbar/footer and project pages stay consistent.

## Quick start

```bash
npm install
npm run build
```

## How it works

There are two “build steps”:

1. **HTML generation** (templates → real pages)
2. **CSS build** (Tailwind → `Assets/css/output.css`)

### Source of truth (edit these)

- `templates/index-template.html` — home page template
- `templates/about-template.html` — about page template
- `templates/projects-index-template.html` — projects listing page template
- `templates/project-template.html` — single project page template
- `templates/partials/nav.html` — shared navbar
- `templates/partials/footer.html` — shared footer
- `templates/partials/project-card.html` — card layout used on the projects index
- `projects.json` — project data (`slug`, `title`, `description`, `technologies[]`, `github`, optional `demo`)
- `build-templates.js` — the generator that injects partials + creates pages

### Generated files (don’t edit manually)

These files are overwritten on every HTML build:

- `index.html`
- `about.html`
- `projects/index.html`
- `projects/<slug>.html`

## Scripts

- `npm run build:html` — runs `node build-templates.js` (generates the static HTML files)
- `npm run build:css` — runs Tailwind to generate `Assets/css/output.css`
- `npm run build` — runs both: **build:html** then **build:css**
- `npm run watch` — watches `projects.json` and `templates/` and re-runs the HTML builder

## Notes

- Theme switching uses Tailwind’s `dark` class mode.
- The domain is configured via `CNAME`.


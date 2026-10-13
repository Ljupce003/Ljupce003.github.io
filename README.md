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
- `Assets/js/demo-status.js` — shared demo availability checks

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

### Demo availability on GitHub Pages

Cross-origin demo links use credential-free `no-cors` requests. An opaque
response shows **Demo Reachable** because the browser hides its HTTP status;
it cannot confirm that the application is healthy. Network errors leave the
status unverified, and links remain clickable. The legacy `!ignore` flag skips
checking and no longer claims that a demo is live.

For a verified application check, set the optional `demoStatusUrl` in
`projects.json` to a public CORS-enabled endpoint that returns a successful HTTP
status when healthy, or a non-success HTTP status when unavailable. The response
body can be JSON or HTML; the check reads only the HTTP status.

The Cybersecurity Awareness Game uses its GitHub Pages homepage as
`demoStatusUrl`. That page allows cross-origin requests, so a readable HTTP
success verifies that the static demo is available and shows **Demo Live**.

DriveHub and StudyOrganizer use `/health` on their respective domains. The shared
Nginx proxy forwards these checks to DriveHub's `/api/health` (app and database
readiness) and StudyOrganizer's `/up` (Laravel boot health). Nginx adds
`Access-Control-Allow-Origin: *` on success and error responses, only for these
public checks. Deploy the updated Nginx configs and portfolio together; no app
CORS changes are required. Before the proxy is updated, a blocked check falls
back to **Demo Reachable**.

Run `npm test` to verify availability handling.


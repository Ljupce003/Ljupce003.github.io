
## 1) Source-of-truth files (edit these)
- `templates/index-template.html` -> Home page design/content source
- `templates/about-template.html` -> About page design/content source
- `templates/projects-index-template.html` -> Projects listing page layout source
- `templates/project-template.html` -> Individual project page layout source
- `templates/partials/nav.html` -> Shared navbar for all pages
- `templates/partials/footer.html` -> Shared footer for all pages
- `projects.json` -> Project data (`slug`, `title`, `description`, `technologies[]`, `github`, optional `demo`)
- `build-templates.js` -> Build logic (injects partials + generates all static pages)

## 2) Generated files (do NOT edit manually)
- `index.html` (generated from `templates/index-template.html`)
- `about.html` (generated from `templates/about-template.html`)
- `projects/index.html` (generated from `templates/projects-index-template.html` + `projects.json`)
- `projects/<slug>.html` for each project (generated from `templates/project-template.html` + `projects.json`)

Any manual edits in generated files will be overwritten on next build.

## 3) Build flow
- Run `node build-templates.js`
- Script reads:
    - page templates
    - partials (`nav`, `footer`)
    - `projects.json`
- Script injects `{{nav}}` and `{{footer}}` into every page
- Script replaces project placeholders (`{{title}}`, `{{description}}`, `{{technologies}}`, `{{github}}`, `{{demoLink}}`, etc.)
- Script writes final static HTML files for SEO

## 4) Shared nav/footer behavior
- Partials use placeholders:
    - `{{rootPath}}` ("" for root pages, "../" for pages inside `/projects`)
    - `{{projectsIndexPath}}` (relative link target for Projects index)
    - `{{activeHome}}`, `{{activeAbout}}`, `{{activeProjects}}` (active nav highlight class)
- `build-templates.js` sets these per page context.

## 5) Styling rules
- To change global design/layout: edit templates/partials only.
- To change Home/About section styles: edit the corresponding template file.
- To change all project detail pages: edit `templates/project-template.html`.
- To change projects list card design: edit `templates/projects-index-template.html` and/or `renderProjectCard` in `build-templates.js`.

## 6) Safe workflow for design changes
1. Edit only files in `templates/` (and `build-templates.js` if logic changes).
2. If project content changes, edit `projects.json`.
3. Rebuild with `node build-templates.js`.
4. Review generated output in:
    - `index.html`
    - `about.html`
    - `projects/index.html`
    - `projects/*.html`
5. Never treat generated HTML as source-of-truth.

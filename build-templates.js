#!/usr/bin/env node

/**
 * build-templates.js — Portfolio Build Script
 *
 * Reads templates and projects.json, then generates ALL static HTML pages:
 *   - index.html
 *   - about.html
 *   - projects/index.html
 *   - projects/<slug>.html  (one per project)
 *
 * Partials (nav & footer) live in templates/partials/ — edit them once,
 * they are injected into every page automatically.
 *
 * Run:  node build-templates.js
 */

const fs   = require('fs');
const path = require('path');

// ─── Paths ───────────────────────────────────────────────────────────────────
const ROOT = __dirname;
const T    = (...p) => path.join(ROOT, 'templates', ...p);   // template helper

// ─── Load partials ────────────────────────────────────────────────────────────
const NAV_PARTIAL    = fs.readFileSync(T('partials', 'nav.html'),    'utf8');
const FOOTER_PARTIAL = fs.readFileSync(T('partials', 'footer.html'), 'utf8');

// ─── Load page templates ──────────────────────────────────────────────────────
const INDEX_TEMPLATE    = fs.readFileSync(T('index-template.html'),          'utf8');
const ABOUT_TEMPLATE    = fs.readFileSync(T('about-template.html'),          'utf8');
const PROJ_IDX_TEMPLATE = fs.readFileSync(T('projects-index-template.html'), 'utf8');
const PROJ_TEMPLATE     = fs.readFileSync(T('project-template.html'),        'utf8');

// ─── Read projects data ───────────────────────────────────────────────────────
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects.json'), 'utf8'));

// ─── Ensure /projects folder exists ──────────────────────────────────────────
const PROJECTS_DIR = path.join(ROOT, 'projects');
if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });

// ─── Helpers ─────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BADGE_COLORS = [
  'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30',
  'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30',
  'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30',
  'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30',
  'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30',
  'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30',
  'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30',
  'bg-pink-500/20 text-pink-300 ring-1 ring-pink-500/30',
];

function renderBadges(technologies) {
  return technologies
    .map((tech, i) => `<span class="badge ${BADGE_COLORS[i % BADGE_COLORS.length]}">${escapeHtml(tech)}</span>`)
    .join('\n        ');
}

function renderDemoLink(demo) {
  if (!demo) return '';
  return `
        <a href="${escapeHtml(demo)}" target="_blank" rel="noopener noreferrer"
           class="btn-outline inline-flex items-center gap-2 border border-slate-600 text-slate-200 px-6 py-3 rounded-lg font-semibold text-sm">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Live Demo
        </a>`;
}

// ─── Partial injection ────────────────────────────────────────────────────────
/**
 * Builds the nav partial for a given page context.
 * @param {string} rootPath           - Path prefix to reach root ("" or "../")
 * @param {string} projectsIndexPath  - Relative path to projects/index.html
 * @param {'home'|'about'|'projects'} activePage
 */
function buildNav(rootPath, projectsIndexPath, activePage) {
  return NAV_PARTIAL
    .replace(/{{rootPath}}/g,          rootPath)
    .replace(/{{projectsIndexPath}}/g, projectsIndexPath)
    .replace('{{activeHome}}',     activePage === 'home'     ? 'text-indigo-400' : '')
    .replace('{{activeAbout}}',    activePage === 'about'    ? 'text-indigo-400' : '')
    .replace('{{activeProjects}}', activePage === 'projects' ? 'text-indigo-400' : '');
}

/**
 * Builds the footer partial for a given page context.
 */
function buildFooter(rootPath, projectsIndexPath) {
  return FOOTER_PARTIAL
    .replace(/{{rootPath}}/g,          rootPath)
    .replace(/{{projectsIndexPath}}/g, projectsIndexPath);
}

/**
 * Injects nav and footer partials into a template string.
 */
function injectPartials(html, { rootPath, projectsIndexPath, activePage }) {
  return html
    .replace('{{nav}}',    buildNav(rootPath, projectsIndexPath, activePage))
    .replace('{{footer}}', buildFooter(rootPath, projectsIndexPath));
}

// ─── Write helper ─────────────────────────────────────────────────────────────
function write(filePath, html) {
  const relative = path.relative(ROOT, filePath).replace(/\\/g, '/');
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`  ✓  ${relative}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Generate index.html
// ─────────────────────────────────────────────────────────────────────────────
write(
  path.join(ROOT, 'index.html'),
  injectPartials(INDEX_TEMPLATE, {
    rootPath:          '',
    projectsIndexPath: 'projects/index.html',
    activePage:        'home',
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Generate about.html
// ─────────────────────────────────────────────────────────────────────────────
write(
  path.join(ROOT, 'about.html'),
  injectPartials(ABOUT_TEMPLATE, {
    rootPath:          '',
    projectsIndexPath: 'projects/index.html',
    activePage:        'about',
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Generate projects/<slug>.html
// ─────────────────────────────────────────────────────────────────────────────
projects.forEach(project => {
  const { slug, title, description, technologies, github, demo } = project;

  let html = PROJ_TEMPLATE
    .replace(/{{title}}/g,           escapeHtml(title))
    .replace(/{{metaDescription}}/g, escapeHtml(description.slice(0, 160)))
    .replace(/{{description}}/g,     escapeHtml(description))
    .replace(/{{technologies}}/g,    renderBadges(technologies))
    .replace(/{{github}}/g,          escapeHtml(github))
    .replace(/{{demoLink}}/g,        renderDemoLink(demo))
    .replace(/{{slug}}/g,            escapeHtml(slug));

  html = injectPartials(html, {
    rootPath:          '../',
    projectsIndexPath: 'index.html',
    activePage:        'projects',
  });

  write(path.join(PROJECTS_DIR, `${slug}.html`), html);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Generate projects/index.html
// ─────────────────────────────────────────────────────────────────────────────
function renderProjectCard(project) {
  const { slug, title, description, technologies, github, demo } = project;

  const badgesHtml = technologies
    .slice(0, 4)
    .map((tech, i) => `<span class="badge ${BADGE_COLORS[i % BADGE_COLORS.length]}">${escapeHtml(tech)}</span>`)
    .join('\n              ');

  const extraCount = Math.max(0, technologies.length - 4);
  const extraBadge = extraCount > 0
    ? `<span class="badge bg-slate-700 text-slate-400">+${extraCount} more</span>`
    : '';

  const demoBtn = demo
    ? `<a href="${escapeHtml(demo)}" target="_blank" rel="noopener noreferrer"
                 class="text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Demo
              </a>`
    : '';

  const shortDesc = description.length > 120
    ? description.slice(0, 120).trimEnd() + '…'
    : description;

  return `
      <!-- ${escapeHtml(title)} -->
      <article class="group relative flex flex-col bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/20">
        <div class="flex items-start justify-between mb-4">
          <h2 class="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug pr-4">
            <a href="${escapeHtml(slug)}.html" class="stretched-link focus:outline-none">
              ${escapeHtml(title)}
            </a>
          </h2>
          <a href="${escapeHtml(github)}" target="_blank" rel="noopener noreferrer"
             class="relative z-10 shrink-0 text-slate-500 hover:text-white transition-colors" title="View on GitHub">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>

        <p class="text-slate-400 text-sm leading-relaxed mb-5 flex-1">${escapeHtml(shortDesc)}</p>

        <div class="flex flex-wrap gap-1.5 mb-5">
          ${badgesHtml}
          ${extraBadge}
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-slate-700/50 relative z-10">
          <a href="${escapeHtml(slug)}.html"
             class="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-semibold flex items-center gap-1">
            View Details
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>
          ${demoBtn}
        </div>
      </article>`;
}

const projectCardsHtml = projects.map(renderProjectCard).join('\n');

write(
  path.join(PROJECTS_DIR, 'index.html'),
  injectPartials(
    PROJ_IDX_TEMPLATE.replace('{{projectCards}}', projectCardsHtml),
    {
      rootPath:          '../',
      projectsIndexPath: 'index.html',
      activePage:        'projects',
    }
  )
);

// ─── Done ─────────────────────────────────────────────────────────────────────
console.log(`\n✅  Build complete — ${projects.length} project(s) generated.`);
console.log('\n📁  To update nav or footer, edit:');
console.log('      templates/partials/nav.html');
console.log('      templates/partials/footer.html');
console.log('    Then rerun:  node build-templates.js\n');

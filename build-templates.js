#!/usr/bin/env node

/**
 * build-templates.js — Portfolio Build Script
 */

const fs   = require('fs');
const path = require('path');

// ─── Paths ───────────────────────────────────────────────────────────────────
const ROOT = __dirname;
const T    = (...p) => path.join(ROOT, 'templates', ...p);

// ─── Load partials ────────────────────────────────────────────────────────────
const NAV_PARTIAL         = fs.readFileSync(T('partials', 'nav.html'),         'utf8');
const FOOTER_PARTIAL      = fs.readFileSync(T('partials', 'footer.html'),      'utf8');
const PROJ_CARD_PARTIAL   = fs.readFileSync(T('partials', 'project-card.html'), 'utf8');

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

// Updated badge colors to be legible in both Light and Dark themes
const BADGE_COLORS = [
    'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-500/30',
    'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-200 dark:ring-cyan-500/30',
    'bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-200 dark:ring-violet-500/30',
    'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-500/30',
];

function renderBadges(technologies, limit = 99) {
    const visible = technologies.slice(0, limit);
    const badges = visible.map((tech, i) =>
        `<span class="badge ${BADGE_COLORS[i % BADGE_COLORS.length]}">${escapeHtml(tech)}</span>`
    );

    if (technologies.length > limit) {
        const extra = technologies.length - limit;
        badges.push(`<span class="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">+${extra} more</span>`);
    }
    return badges.join('\n        ');
}

function renderDemoBtn(demo, isSmall = false) {
    // If demo is missing, empty string, or empty array, render nothing.
    if (!demo || (Array.isArray(demo) && demo.length === 0) || demo === "") {
        return '';
    }

    // Normalize to an array (so we can handle both "url" and ["url1", "url2"])
    const urls = Array.isArray(demo) ? demo : [demo];
    // Convert array to a string safe for an HTML attribute
    const urlsJson = escapeHtml(JSON.stringify(urls));
    // Use the first URL as the default fallback href
    const fallbackUrl = escapeHtml(urls[0]);

    if (isSmall) {
        return `<a href="${fallbackUrl}" data-demo-urls="${urlsJson}" target="_blank" rel="noopener noreferrer"
               class="smart-demo-btn text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium flex items-center gap-1.5">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 status-ping"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 status-dot"></span>
              </span>
              <span class="demo-text">Demo</span> 
            </a>`;
    }

    // Full Project Page version (big button with indicator)
    return `<a href="${fallbackUrl}" data-demo-urls="${urlsJson}" target="_blank" rel="noopener noreferrer"
             class="smart-demo-btn btn-primary inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold text-sm">
            <span class="relative flex h-2.5 w-2.5">
               <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75 status-ping"></span>
               <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 status-dot"></span>
            </span>
            <span class="demo-text">Demo</span>
          </a>`;
}

function renderProjectCard(project) {
    const { slug, title, description, technologies, github, demo } = project;
    const shortDesc = description.length > 120 ? description.slice(0, 120).trimEnd() + '…' : description;

    return PROJ_CARD_PARTIAL
        .replace(/{{slug}}/g,        escapeHtml(slug))
        .replace(/{{title}}/g,       escapeHtml(title))
        .replace(/{{github}}/g,      escapeHtml(github))
        .replace(/{{description}}/g, escapeHtml(shortDesc))
        .replace(/{{badges}}/g,      renderBadges(technologies, 4))
        .replace(/{{demoLink}}/g,     renderDemoBtn(demo, true));
}

// ─── Partial injection ────────────────────────────────────────────────────────
function buildNav(rootPath, projectsIndexPath, activePage) {
    return NAV_PARTIAL
        .replace(/{{rootPath}}/g,          rootPath)
        .replace(/{{projectsIndexPath}}/g, projectsIndexPath)
        .replace('{{activeHome}}',     activePage === 'home'     ? 'text-indigo-400' : '')
        .replace('{{activeAbout}}',    activePage === 'about'    ? 'text-indigo-400' : '')
        .replace('{{activeProjects}}', activePage === 'projects' ? 'text-indigo-400' : '');
}

function buildFooter(rootPath, projectsIndexPath) {
    return FOOTER_PARTIAL
        .replace(/{{rootPath}}/g,          rootPath)
        .replace(/{{projectsIndexPath}}/g, projectsIndexPath);
}

function injectPartials(html, { rootPath, projectsIndexPath, activePage }) {
    return html
        .replace('{{nav}}',    buildNav(rootPath, projectsIndexPath, activePage))
        .replace('{{footer}}', buildFooter(rootPath, projectsIndexPath));
}

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
        .replace(/{{demoLink}}/g,        renderDemoBtn(demo))
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

console.log(`\n✅  Build complete — ${projects.length} project(s) generated.`);
console.log('\n📁  To update nav or footer, edit:');
console.log('      templates/partials/nav.html');
console.log('      templates/partials/footer.html');
console.log('    Then rerun:  node build-templates.js\n');

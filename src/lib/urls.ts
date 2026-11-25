/**
 * Centralized route helpers matching `build.format: 'directory'` in `astro.config.mjs`.
 */
export const routes = {
  home(): string {
    return '/';
  },
  about(): string {
    return '/about/';
  },
  aboutContact(): string {
    return `${this.about()}#contact`;
  },
  projects(): string {
    return '/projects/';
  },
  project(slug: string): string {
    const normalized = slug.trim().replace(/^\/+|\/+$/g, '');
    if (!normalized) {
      throw new Error('Project slug must be a non-empty string');
    }
    return `/projects/${normalized}/`;
  },
};

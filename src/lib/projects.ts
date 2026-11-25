import { getCollection, type CollectionEntry } from 'astro:content';
import type { Project } from '../types/project.ts';
import { formatProjectExcerpt, sortProjectEntries } from './project-utils.ts';

export type ProjectEntry = CollectionEntry<'projects'>;

export { formatProjectExcerpt, sortProjectEntries };

export async function getAllProjectEntries(): Promise<ProjectEntry[]> {
  const entries = await getCollection('projects');
  return sortProjectEntries(entries);
}

export async function getAllProjects(): Promise<Project[]> {
  const entries = await getAllProjectEntries();
  return entries.map((entry) => ({
    ...entry.data,
    slug: entry.data.slug || entry.id,
  }));
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const projects = await getAllProjects();
  return projects.find((project) => project.slug === slug);
}

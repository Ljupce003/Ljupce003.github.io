import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const projectSchema = z.object({
  slug: z.string().min(1),
  order: z.number().int().positive().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  technologies: z.array(z.string().min(1)).min(1),
  github: z.string().url(),
  demo: z.union([z.string(), z.array(z.string())]).optional(),
  demoStatusUrl: z.string().url().optional(),
});

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
    schema: projectSchema,
  }),
};

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    date:        z.string(), // e.g. "2026-01-01"
    tags:        z.array(z.string()).optional().default([]),
    draft:       z.boolean().optional().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    tags:        z.array(z.string()).optional().default([]),
    repo:        z.string().optional(),
    live:        z.string().optional(),
    status:      z.enum(['planned', 'active', 'complete']).default('planned'),
    relatedTag:  z.string().optional(),
  }),
});

export const collections = { blog, projects };

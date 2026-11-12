import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title:       z.string(),
    description: z.string(),
    date:        z.string(), // e.g. "2026-01-01"
    tags:        z.array(z.string()).optional().default([]),
    draft:       z.boolean().optional().default(false),
    // Optional thumbnail, path relative to the .md file (e.g. ./media/thumb.jpg)
    thumbnail:         image().optional(),
    thumbnailAlt:      z.string().optional(),
    thumbnailPosition: z.string().optional(), // CSS object-position for cropping, e.g. "center 30%"
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title:       z.string(),
    description: z.string(),
    tags:        z.array(z.string()).optional().default([]),
    repo:        z.string().optional(),
    live:        z.string().optional(),
    status:      z.enum(['planned', 'active', 'live', 'paused', 'complete']).default('planned'),
    relatedTag:  z.string().optional(),
    // Optional thumbnail, path relative to the .md file (e.g. ./media/thumb.jpg)
    thumbnail:         image().optional(),
    thumbnailAlt:      z.string().optional(),
    thumbnailPosition: z.string().optional(), // CSS object-position for cropping, e.g. "center 30%"
  }),
});

export const collections = { blog, projects };

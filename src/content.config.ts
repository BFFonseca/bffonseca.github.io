import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Per-entry thumbnail crop; any field left out falls back to the defaults in site.config.ts.
const crop = z.object({
  x:    z.number().min(0).max(100).optional(), // focal point, % from left
  y:    z.number().min(0).max(100).optional(), // focal point, % from top
  zoom: z.number().min(1).optional(),          // 1 = just fills the box
});
const thumbnailCrop = crop.extend({
  strip: crop.optional(), // overrides for the index-card strip only
  hero:  crop.optional(), // overrides for the post/project page banner only
}).optional();

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    date:        z.string(), // e.g. "2026-01-01"
    tags:        z.array(z.string()).optional().default([]),
    draft:       z.boolean().optional().default(false),
    // Thumbnail = thumbnail.png/.jpg/.jpeg in the entry's folder or media/, else the last image in the body
    thumbnailAlt:      z.string().optional(),
    thumbnailCrop,
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
    status:      z.enum(['planned', 'active', 'live', 'paused', 'complete']).default('planned'),
    relatedTag:  z.string().optional(),
    // Thumbnail = thumbnail.png/.jpg/.jpeg in the entry's folder or media/, else the last image in the body
    thumbnailAlt:      z.string().optional(),
    thumbnailCrop,
  }),
});

export const collections = { blog, projects };

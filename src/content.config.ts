import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One markdown file per case, synced from the workshop's public/ READMEs.
// The schema matches the frontmatter standard in _publishing/CONVENTIONS.md.
const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    client: z.string().optional(),
    role: z.string().optional(),
    tags: z.array(z.string()).default([]),
    summary: z.string().optional(),
  }),
});

export const collections = { cases };

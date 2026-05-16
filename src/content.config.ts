import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    endDate: z.date().optional(),
    location: z.string(),
    description: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }).optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    name: z.string(),
    role: z.string().optional(),
    yearsInTable: z.number().optional(),
    quote: z.string(),
    photo: z.string().optional(),
    publishedAt: z.date(),
  }),
});

const grants = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/grants' }),
  schema: z.object({
    beneficiary: z.string(),
    year: z.number(),
    amount: z.number().optional(),
    cause: z.string(),
    summary: z.string(),
  }),
});

export const collections = { events, stories, grants };

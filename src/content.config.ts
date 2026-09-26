import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Catalyst Team'),
    audience: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
    category: z.string().optional(),
    featured: z.boolean().optional(),
    // Per-post FAQ. Rendered visibly at the end of the article and emitted as
    // FAQPage JSON-LD so answers can be surfaced in search/AI answer engines.
    faqs: z
      .array(
        z.object({
          q: z.string(),
          a: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = { blog };

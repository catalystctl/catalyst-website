// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

import cloudflare from '@astrojs/cloudflare';

// Map each blog slug to its real last-modified date (updatedDate, else pubDate)
// so the sitemap carries honest per-page lastmod instead of a build-time stamp.
const blogDir = new URL('./src/content/blog/', import.meta.url);
const blogLastmod = new Map();
try {
  for (const file of readdirSync(blogDir)) {
    if (!file.endsWith('.md')) continue;
    const raw = readFileSync(new URL(file, blogDir), 'utf8');
    const frontmatter = raw.split('---')[1] || '';
    const updated = frontmatter.match(/^updatedDate:\s*["']?(\d{4}-\d{2}-\d{2})/m);
    const published = frontmatter.match(/^pubDate:\s*["']?(\d{4}-\d{2}-\d{2})/m);
    const date = updated?.[1] ?? published?.[1];
    if (date) blogLastmod.set(file.replace(/\.md$/, ''), new Date(`${date}T00:00:00Z`).toISOString());
  }
} catch {
  // Never let sitemap metadata break a build.
}

// https://astro.build/config
export default defineConfig({
  site: "https://catalystctl.com",
  trailingSlash: "always",
  output: "server",
  compressHTML: true,
  redirects: {
    "/docs/": "https://docs.catalystctl.com/",
    "/screenshots/": "https://demo.catalystctl.com/",
  },

  build: {
    inlineStylesheets: "auto",
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      filter: (page) => !page.includes('/_') && !page.includes('/vs-pterodactyl'),
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
        },
      },
      serialize(item) {
        const url = item.url;
        if (url === 'https://catalystctl.com/' || url === 'https://catalystctl.com') item.priority = 1.0;
        else if (url.includes('/pterodactyl-alternative')) item.priority = 0.9;
        else if (url === 'https://catalystctl.com/blog/' || url === 'https://catalystctl.com/blog') item.priority = 0.85;
        else if (url.includes('/migrate-from-pterodactyl')) item.priority = 0.85;
        else if (url.includes('/about')) item.priority = 0.8;
        else if (url.includes('/blog/')) item.priority = 0.75;
        // Per-post lastmod from the blog frontmatter. Don't set a build-time
        // new Date() here — it stamps every URL identically and kills freshness signals.
        const blogMatch = url.match(/^https:\/\/catalystctl\.com\/blog\/([^/]+)\/$/);
        if (blogMatch && blogLastmod.has(blogMatch[1])) {
          item.lastmod = blogLastmod.get(blogMatch[1]);
        }
        return item;
      },
    }),
  ],

  adapter: cloudflare(),
});

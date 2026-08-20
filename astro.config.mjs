// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: "https://catalystctl.com",
  trailingSlash: "always",
  output: "server",
  compressHTML: true,

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
        else if (url === 'https://catalystctl.com/docs/' || url === 'https://catalystctl.com/docs') item.priority = 0.8;
        else if (url.includes('/blog/')) item.priority = 0.75;
        else if (url.includes('/docs/')) item.priority = 0.7;
        else if (url.includes('/screenshots')) item.priority = 0.6;
        // Per-page lastmod is handled by a custom sitemap reading
        // content collections (blog pubDate/updatedDate). Don't set a build-time
        // new Date() here — it stamps every URL identically and kills freshness signals.
        return item;
      },
    }),
  ],

  adapter: cloudflare(),
});

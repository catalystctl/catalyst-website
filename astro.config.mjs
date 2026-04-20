// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: "https://catalystctl.com",
  base: "/",
  trailingSlash: "always",
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
      lastmod: new Date(),
      filter: (page) => !page.includes('/_'),
      serialize(item) {
        const url = item.url;
        if (url === 'https://catalystctl.com/') item.priority = 1.0;
        else if (url === 'https://catalystctl.com/docs/') item.priority = 0.8;
        else if (url === 'https://catalystctl.com/screenshots/') item.priority = 0.6;
        else if (url.includes('/docs/')) item.priority = 0.7;
        return item;
      },
    }),
  ],
});

// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: "https://catalystctl.github.io",
  base: "/catalyst-website",
  trailingSlash: "always",
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});

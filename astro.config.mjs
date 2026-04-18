// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: "https://catalystctl.github.io",
  base: "/catalyst-website",
  vite: {
    plugins: [tailwindcss()],
  },
});

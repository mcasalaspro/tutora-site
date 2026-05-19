// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tutora-site.pages.dev',
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    preact({ compat: false }),
    sitemap(),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
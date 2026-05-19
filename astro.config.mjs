// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

import { SITE_URL } from './src/config/site.ts';

export default defineConfig({
  site: SITE_URL,
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
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/*
 * Endereço do site.
 * - No GitHub Pages, o workflow (.github/workflows/publicar.yml) preenche
 *   SITE_URL e BASE_PATH sozinho, a partir das configurações do Pages.
 *   Se você ligar um domínio próprio no GitHub, nada precisa mudar aqui.
 * - Rodando no seu PC, vale o endereço abaixo.
 */
const SITE_URL = process.env.SITE_URL || 'https://www.tutoracursos.com.br';
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/+$/, '') + '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  compressHTML: true,
  integrations: [sitemap()],
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  vite: {
    server: { fs: { allow: ['.'] } },
  },
});

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

// Endereços antigos de cursos que mudaram de nome: quem abrir o endereço antigo cai na página nova.
const ENDERECOS_ANTIGOS = {
  '/cursos/filosofia-da-natureza': '/cursos/introducao-a-aristoteles/',
  '/cursos/filosofia-da-natureza/resumo': '/cursos/introducao-a-aristoteles/resumo/',
  '/cursos/literaturas-de-lingua-portuguesa-fuvest': '/cursos/literatura-brasileira-e-de-lingua-portuguesa/',
  '/cursos/literaturas-de-lingua-portuguesa-fuvest/resumo': '/cursos/literatura-brasileira-e-de-lingua-portuguesa/resumo/',
};

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  // (o destino precisa levar o BASE_PATH, que o Astro não acrescenta sozinho nos redirecionamentos)
  redirects: Object.fromEntries(
    Object.entries(ENDERECOS_ANTIGOS).map(([de, para]) => [de, BASE_PATH.replace(/\/+$/, '') + para]),
  ),
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

import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const mapa = site ? new URL(`${base}sitemap-index.xml`, site).toString() : `${base}sitemap-index.xml`;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${mapa}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

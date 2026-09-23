/**
 * Encontra as imagens em conteudo/imagens/ pelo nome do arquivo.
 *
 *   conteudo/imagens/cursos/<slug>-horizontal.jpg   16:9 · 1920×1080  (banner e cards largos)
 *   conteudo/imagens/cursos/<slug>-poster.jpg       2:3  · 1000×1500  (fileiras e catálogo)
 *   conteudo/imagens/professores/<slug>.jpg         1:1  · 1080×1080  (card do professor)
 *   conteudo/imagens/professores/<slug>-cena.jpg    ~6:5 · 940×788    (banner da página do professor)
 *
 * Aceita .jpg, .jpeg, .png, .webp ou .avif. Se a imagem não existir, o site
 * mostra uma capa provisória nas cores da marca.
 */
import type { ImageMetadata } from 'astro';

const arquivos = import.meta.glob<{ default: ImageMetadata }>(
  '/conteudo/imagens/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

const porNome = new Map<string, ImageMetadata>();
for (const [caminho, mod] of Object.entries(arquivos)) {
  const rel = caminho
    .replace(/^.*\/conteudo\/imagens\//, '')
    .toLowerCase()
    .replace(/\.(jpe?g|png|webp|avif)$/i, '');
  porNome.set(rel, mod.default);
}

export function imagemCurso(slug: string, tipo: 'horizontal' | 'poster'): ImageMetadata | undefined {
  return porNome.get(`cursos/${slug}-${tipo}`);
}

export function fotoProfessor(slug: string, tipo: 'quadrada' | 'cena'): ImageMetadata | undefined {
  if (!slug) return undefined;
  return porNome.get(tipo === 'quadrada' ? `professores/${slug}` : `professores/${slug}-cena`);
}

export function imagemMarca(nome: string): ImageMetadata | undefined {
  return porNome.get(`marca/${nome}`);
}

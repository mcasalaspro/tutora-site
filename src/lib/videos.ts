/**
 * Lê conteudo/videos.csv: aulas grátis e apresentações dos cursos no YouTube.
 *
 * Colunas: curso; tipo; titulo; link; observacao
 *   curso: slug do curso, ou "area:<slug-da-área>" para mostrar o vídeo na página de uma área
 *   tipo:  apresentacao | aula-gratis
 *   titulo: o nome do vídeo (aparece embaixo da miniatura)
 *   link:  endereço do vídeo no YouTube (qualquer formato: watch?v=, youtu.be/, embed/)
 *   observacao: só para a equipe; o site ignora
 * Curso sem nenhuma linha aqui não mostra o bloco de vídeos.
 */
import fs from 'node:fs';
import path from 'node:path';
import { lerCsv } from './precos';
import { idYoutube } from './formatar';

export interface Video {
  tipo: 'apresentacao' | 'aula-gratis';
  titulo: string;
  id: string;
  rotulo: string;
}

let cache: Map<string, Omit<Video, 'rotulo'>[]> | null = null;

function tabela(): Map<string, Omit<Video, 'rotulo'>[]> {
  if (cache) return cache;
  cache = new Map();
  const arquivo = path.join(process.cwd(), 'conteudo', 'videos.csv');
  if (!fs.existsSync(arquivo)) return cache;
  for (const r of lerCsv(fs.readFileSync(arquivo, 'utf8'))) {
    const chave = (r.curso ?? '').trim();
    const id = idYoutube(r.link ?? '');
    if (!chave || !id) continue;
    const tipo = (r.tipo ?? '').trim().toLowerCase().startsWith('apres') ? 'apresentacao' : 'aula-gratis';
    const lista = cache.get(chave) ?? [];
    if (!lista.some((v) => v.id === id)) lista.push({ tipo, titulo: (r.titulo ?? '').trim(), id });
    cache.set(chave, lista);
  }
  return cache;
}

/**
 * Vídeos de um curso (ou de "area:<slug>"), com a apresentação primeiro.
 * `trailer` (campo preview_youtube_embed do curso) entra como apresentação quando o CSV não tem uma.
 */
export function videosDe(chave: string, trailer = ''): Video[] {
  const lista = [...(tabela().get(chave) ?? [])];
  const idTrailer = idYoutube(trailer);
  if (idTrailer && !lista.some((v) => v.id === idTrailer || v.tipo === 'apresentacao')) {
    lista.unshift({ tipo: 'apresentacao', titulo: '', id: idTrailer });
  }
  lista.sort((a, b) => Number(a.tipo === 'aula-gratis') - Number(b.tipo === 'aula-gratis'));
  const nAulas = lista.filter((v) => v.tipo === 'aula-gratis').length;
  let k = 0;
  return lista.map((v) => ({
    ...v,
    rotulo:
      v.tipo === 'apresentacao'
        ? chave.startsWith('area:') ? 'Apresentação' : 'Apresentação do curso'
        : nAulas > 1 ? `Aula grátis ${++k}` : 'Aula grátis',
  }));
}

/**
 * Todas as perguntas dos quizzes dos cursos, num arquivo só, para o quiz geral (/quiz/).
 * A página só baixa este arquivo quando a pessoa começa a jogar.
 */
import type { APIRoute } from 'astro';
import { cursos } from '../../lib/catalogo';

export const GET: APIRoute = async () => {
  const lista = await cursos();
  const porCurso: Record<string, { e: string; a: string[]; k: number; x: string; vf: boolean; d: string }[]> = {};
  for (const c of lista) {
    if (c.perguntas.length < 3) continue;
    porCurso[c.slug] = c.perguntas.map((p) => ({
      e: p.enunciado,
      a: p.alternativas,
      k: p.correta,
      x: p.explicacao,
      vf: p.tipo === 'verdadeiro_falso',
      d: p.dificuldade,
    }));
  }
  return new Response(JSON.stringify({ cursos: porCurso }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};

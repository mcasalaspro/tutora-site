/**
 * Coleções de conteúdo do site.
 *
 * Todo o conteúdo editável fica na pasta /conteudo (fora de src/):
 *   conteudo/cursos/<slug>.md        1 arquivo por curso (o nome do arquivo é o slug = endereço da página)
 *   conteudo/professores/<slug>.md   1 arquivo por professor
 *   conteudo/quizzes/<slug>.md       quiz + curiosidades, mesmo slug do curso
 *
 * Os preços e links da Hotmart NÃO ficam aqui: ficam em conteudo/precos.csv.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const texto = z.string().default('');
const lista = z.array(z.string()).default([]);

const parte = z.object({
  titulo: z.string(),
  resumo: texto,
  duracao_min: z.number().nonnegative().optional(),
});

const aula = z.object({
  /** Rótulo + título, no formato "Aula 1 — Título da aula" (o travessão separa os dois). */
  aula: z.string(),
  /** 'aula' (padrão), 'apresentacao' (trailer/introdução curta) ou 'extra' (bônus, conversa final). */
  tipo: z.enum(['aula', 'apresentacao', 'extra']).default('aula'),
  /** Opcional: nome do módulo, para agrupar as aulas em blocos. */
  modulo: texto,
  duracao_min: z.number().nonnegative().optional(),
  descricao: texto,
  comentario: texto,
  topicos: lista,
  autores: lista,
  partes: z.array(parte).default([]),
});

const cursos = defineCollection({
  loader: glob({ pattern: '*.md', base: './conteudo/cursos', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({
    slug: z.string().optional(),
    titulo: z.string(),
    professor: texto,
    professores_convidados: lista,
    area: z.string(),
    frase: texto,
    sinopse_curta: z.string(),
    sinopse_longa: texto,
    formato: texto,
    duracao_aulas: z.number().int().nonnegative().optional(),
    duracao_horas: z.number().nonnegative().optional(),
    preview_youtube_embed: texto,
    para_quem_e: lista,
    o_que_vai_aprender: lista,
    importancia: texto,
    curriculo: z.array(aula).min(1),
    cursos_relacionados: lista,
    destaque_home: z.boolean().default(false),
    lancamento: z.boolean().default(false),
    ordem: z.number().optional(),
  }),
});

const professores = defineCollection({
  loader: glob({ pattern: '*.md', base: './conteudo/professores', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({
    slug: z.string().optional(),
    nome: z.string(),
    mini_bio: texto,
    bio_completa: texto,
    formacao: lista,
    site: texto,
    instagram: texto,
    /** "feminino" troca os rótulos para "professora" ("Conheça sua professora"). */
    genero: z.enum(['masculino', 'feminino']).default('masculino'),
    ordem: z.number().optional(),
  }),
});

const quizzes = defineCollection({
  loader: glob({ pattern: '*.md', base: './conteudo/quizzes', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.looseObject({
    slug: z.string().optional(),
    titulo: texto,
    professor: texto,
  }),
});

export const collections = { cursos, professores, quizzes };

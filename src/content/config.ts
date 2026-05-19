import { defineCollection, z } from 'astro:content';

const AREAS_VALIDAS = [
  'Educação dos Filhos',
  'Família e Casamento',
  'Filosofia e Formação do Juízo',
  'Literatura e Cultura',
  'História e Política',
  'Direito e Vida Pública',
] as const;

// Oferta avulsa — agora aceita 0 a 6 itens em "inclui"
const ofertaAvulsa = z.object({
  titulo: z.string(),
  subtitulo: z.string(),
  preco: z.string(),
  preco_parcelado: z.string(),
  link_hotmart: z.string().url(),
  inclui: z.array(z.string()).max(6),
});

// Oferta combo — mesmo relaxamento
const ofertaCombo = z.object({
  titulo: z.string(),
  subtitulo: z.string(),
  preco: z.string(),
  preco_parcelado: z.string(),
  link_hotmart: z.string().url(),
  cursos_inclusos: z.array(z.string()),
  inclui: z.array(z.string()).max(6),
});

const cursos = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    professor: z.string(),
    area: z.enum(AREAS_VALIDAS),
    capa: z.string(),
    sinopse_curta: z.string(),
    sinopse_longa: z.string(),
    duracao_aulas: z.number().int().positive(),
    duracao_horas: z.number().positive(),
    preview_youtube_embed: z.string().url(),
    // "para quem é": flexível, qualquer quantidade
    para_quem_e: z.array(z.string()).max(8),
    // "o que vai aprender": flexível
    o_que_vai_aprender: z.array(z.string()).max(12),
    importancia: z.string(),
    curriculo: z
      .array(
        z.object({
          aula: z.string(),
          descricao: z.string(),
        })
      )
      .min(1),
    oferta_avulsa: ofertaAvulsa,
    oferta_combo: ofertaCombo,
    cursos_relacionados: z.array(z.string()).default([]),
    destaque_home: z.boolean().default(false),
    lancamento: z.boolean().default(false),
  }),
});

const professores = defineCollection({
  type: 'content',
  schema: z.object({
    nome: z.string(),
    foto: z.string(),
    mini_bio: z.string(),
    bio_completa: z.string(),
    formacao: z.array(z.string()).min(1),
  }),
});

const quizzes = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    professor: z.string(),
  }),
});

export const collections = { cursos, professores, quizzes };
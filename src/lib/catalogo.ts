/**
 * Monta o catálogo a partir das coleções (cursos, professores, quizzes)
 * e do CSV de preços. Todas as páginas usam estas funções.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { config, areaPorNome } from './config';
import { ofertaDe, precos, type OfertaCurso } from './precos';
import { imagemCurso, fotoProfessor } from './imagens';
import { lerQuiz, type Pergunta, type Curiosidade } from './quiz';
import { duracaoTotal, separarAula, slugificar } from './formatar';

export interface Professor {
  slug: string;
  nome: string;
  miniBio: string;
  bioCompleta: string;
  formacao: string[];
  site: string;
  instagram: string;
  foto?: ImageMetadata;
  cena?: ImageMetadata;
  ordem: number;
  cursos: string[];
}

export interface Parte {
  titulo: string;
  resumo: string;
  duracaoMin?: number;
}

export interface Aula {
  rotulo: string;
  titulo: string;
  tipo: 'aula' | 'apresentacao' | 'extra';
  modulo: string;
  duracaoMin?: number;
  descricao: string;
  comentario: string;
  topicos: string[];
  autores: string[];
  partes: Parte[];
}

export interface Curso {
  slug: string;
  titulo: string;
  area: string;
  areaSlug: string;
  professorSlug: string;
  professor?: Professor;
  convidados: Professor[];
  frase: string;
  sinopseCurta: string;
  sinopseLonga: string;
  formato: string;
  paraQuemE: string[];
  oQueVaiAprender: string[];
  importancia: string;
  aulas: Aula[];
  nAulas: number;
  minutos: number;
  duracaoTexto: string;
  trailer: string;
  relacionadosSlugs: string[];
  destaque: boolean;
  lancamento: boolean;
  ordem: number;
  horizontal?: ImageMetadata;
  poster?: ImageMetadata;
  oferta: OfertaCurso;
  perguntas: Pergunta[];
  curiosidades: Curiosidade[];
  topicos: string[];
  entry: CollectionEntry<'cursos'>;
}

let cacheCursos: Curso[] | null = null;
let cacheProfs: Map<string, Professor> | null = null;

async function carregarProfessores(): Promise<Map<string, Professor>> {
  if (cacheProfs) return cacheProfs;
  const lista = await getCollection('professores');
  cacheProfs = new Map();
  for (const p of lista) {
    cacheProfs.set(p.id, {
      slug: p.id,
      nome: p.data.nome,
      miniBio: p.data.mini_bio,
      bioCompleta: p.data.bio_completa || p.body?.trim() || '',
      formacao: p.data.formacao,
      site: p.data.site,
      instagram: p.data.instagram,
      foto: fotoProfessor(p.id, 'quadrada'),
      cena: fotoProfessor(p.id, 'cena'),
      ordem: p.data.ordem ?? 999,
      cursos: [],
    });
  }
  return cacheProfs;
}

export async function cursos(): Promise<Curso[]> {
  if (cacheCursos) return cacheCursos;
  const profs = await carregarProfessores();
  const quizzes = new Map((await getCollection('quizzes')).map((q) => [q.id, q]));
  const tabela = precos();
  const lista: Curso[] = [];

  for (const e of await getCollection('cursos')) {
    const slug = e.id;
    if (tabela.get(slug)?.status === 'oculto') continue;
    const d = e.data;
    const aulas: Aula[] = d.curriculo.map((a) => {
      const { rotulo, titulo } = separarAula(a.aula);
      const partes = a.partes.map((p) => ({ titulo: p.titulo, resumo: p.resumo, duracaoMin: p.duracao_min }));
      const dur = a.duracao_min ?? (partes.length ? partes.reduce((s, p) => s + (p.duracaoMin ?? 0), 0) : undefined);
      return {
        rotulo,
        titulo,
        tipo: a.tipo,
        modulo: a.modulo,
        duracaoMin: dur,
        descricao: a.descricao,
        comentario: a.comentario,
        topicos: a.topicos,
        autores: a.autores,
        partes,
      };
    });
    const minutosAulas = aulas.reduce((s, a) => s + (a.duracaoMin ?? 0), 0);
    const minutos = minutosAulas > 0 ? minutosAulas : (d.duracao_horas ?? 0) * 60;
    const nAulas = d.duracao_aulas ?? aulas.filter((a) => a.tipo === 'aula').length;
    const q = quizzes.get(slug);
    const { perguntas, curiosidades } = q ? lerQuiz(q.body ?? '') : { perguntas: [], curiosidades: [] };
    const area = areaPorNome(d.area);
    const topicos = [...new Set(aulas.flatMap((a) => a.topicos))];
    const professor = profs.get(d.professor);
    const curso: Curso = {
      slug,
      titulo: d.titulo,
      area: d.area,
      areaSlug: area?.slug ?? slugificar(d.area),
      professorSlug: d.professor,
      professor,
      convidados: d.professores_convidados.map((s) => profs.get(s)).filter((p): p is Professor => Boolean(p)),
      frase: d.frase || d.sinopse_curta,
      sinopseCurta: d.sinopse_curta,
      sinopseLonga: d.sinopse_longa,
      formato: d.formato,
      paraQuemE: d.para_quem_e,
      oQueVaiAprender: d.o_que_vai_aprender,
      importancia: d.importancia,
      aulas,
      nAulas,
      minutos,
      duracaoTexto: duracaoTotal(minutos),
      trailer: d.preview_youtube_embed,
      relacionadosSlugs: d.cursos_relacionados,
      destaque: d.destaque_home,
      lancamento: d.lancamento,
      ordem: d.ordem ?? 999,
      horizontal: imagemCurso(slug, 'horizontal'),
      poster: imagemCurso(slug, 'poster'),
      oferta: ofertaDe(slug),
      perguntas,
      curiosidades,
      topicos,
      entry: e,
    };
    lista.push(curso);
    if (professor) professor.cursos.push(slug);
    for (const c of curso.convidados) c.cursos.push(slug);
  }
  lista.sort((a, b) => a.ordem - b.ordem || a.titulo.localeCompare(b.titulo, 'pt-BR'));
  cacheCursos = lista;
  return lista;
}

export async function professores(): Promise<Professor[]> {
  await cursos();
  const profs = await carregarProfessores();
  return [...profs.values()].sort(
    (a, b) =>
      a.ordem - b.ordem ||
      Number(Boolean(b.foto)) - Number(Boolean(a.foto)) ||
      b.cursos.length - a.cursos.length ||
      a.nome.localeCompare(b.nome, 'pt-BR'),
  );
}

export async function professor(slug: string): Promise<Professor | undefined> {
  await cursos();
  return (await carregarProfessores()).get(slug);
}

export async function cursoPorSlug(slug: string): Promise<Curso | undefined> {
  return (await cursos()).find((c) => c.slug === slug);
}

/**
 * Relacionados: primeiro os escolhidos no .md, depois trilha, mesma área e tópicos em comum.
 * `excluir` tira da lista cursos que já aparecem em outra fileira da página (ex.: os do mesmo professor).
 */
export async function relacionados(curso: Curso, limite = 8, excluir: string[] = []): Promise<Curso[]> {
  const todos = await cursos();
  const porSlug = new Map(todos.map((c) => [c.slug, c]));
  const escolhidos: Curso[] = [];
  const add = (c?: Curso) => {
    if (c && c.slug !== curso.slug && !excluir.includes(c.slug) && !escolhidos.includes(c)) escolhidos.push(c);
  };
  curso.relacionadosSlugs.forEach((s) => add(porSlug.get(s)));
  for (const t of config().trilhas) {
    const i = t.cursos.indexOf(curso.slug);
    if (i >= 0) {
      add(porSlug.get(t.cursos[i + 1]));
      add(porSlug.get(t.cursos[i - 1]));
    }
  }
  const meusTopicos = new Set(curso.topicos.map((t) => t.toLowerCase()));
  const candidatos = todos
    .filter((c) => c.slug !== curso.slug && c.professorSlug !== curso.professorSlug)
    .map((c) => ({
      c,
      pontos: (c.area === curso.area ? 3 : 0) + c.topicos.filter((t) => meusTopicos.has(t.toLowerCase())).length,
    }))
    .filter((x) => x.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos);
  candidatos.forEach((x) => add(x.c));
  return escolhidos.slice(0, limite);
}

/** O professor ganha página quando tem curso no catálogo ou biografia escrita. */
export function temPagina(p: Professor): boolean {
  return p.cursos.length > 0 || Boolean(p.miniBio || p.bioCompleta);
}

export async function doMesmoProfessor(curso: Curso): Promise<Curso[]> {
  if (!curso.professorSlug) return [];
  return (await cursos()).filter((c) => c.slug !== curso.slug && c.professorSlug === curso.professorSlug);
}

export async function totais() {
  const cs = await cursos();
  const ps = (await professores()).filter((p) => p.cursos.length > 0);
  return {
    cursos: cs.length,
    aulas: cs.reduce((s, c) => s + c.nAulas, 0),
    horas: Math.round(cs.reduce((s, c) => s + c.minutos, 0) / 60),
    professores: ps.length,
  };
}

/** Nome(s) do(s) professor(es) para exibir: "Marcus Boeira e Mauro Keller" */
export function nomesProfessores(c: Curso): string {
  const nomes = [c.professor?.nome, ...c.convidados.map((p) => p.nome)].filter(Boolean) as string[];
  if (nomes.length <= 1) return nomes[0] ?? '';
  return nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1];
}

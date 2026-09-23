/**
 * Lê os arquivos de configuração das páginas extras:
 *   conteudo/quiz-geral.md  → temas do quiz geral (/quiz/)
 *   conteudo/descubra.md    → perguntas, pesos e trilhas do "Descubra seu curso" (/descubra/)
 * Os dois são .md com um bloco YAML entre as linhas ---; o texto abaixo é só para a equipe.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

function lerFrontmatter(nome: string): Record<string, any> {
  const arquivo = path.join(process.cwd(), 'conteudo', nome);
  if (!fs.existsSync(arquivo)) return {};
  const texto = fs.readFileSync(arquivo, 'utf8').replace(/^﻿/, '');
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? parse(m[1]) ?? {} : {};
}

// ── Quiz geral ───────────────────────────────────────────────────────────

export interface TemaQuiz {
  nome: string;
  slug: string;
  descricao: string;
  /** slugs dos cursos, ou ['*'] para todos */
  cursos: string[];
}

export interface QuizGeral {
  titulo: string;
  subtitulo: string;
  quantidades: number[];
  temas: TemaQuiz[];
}

export function quizGeral(): QuizGeral {
  const d = lerFrontmatter('quiz-geral.md');
  const temas: TemaQuiz[] = (d.temas ?? [])
    .filter((t: any) => t && t.nome && t.slug)
    .map((t: any) => ({
      nome: String(t.nome),
      slug: String(t.slug),
      descricao: String(t.descricao ?? ''),
      cursos: t.cursos === 'todos' || t.cursos === '*' ? ['*'] : (t.cursos ?? []).map(String),
    }));
  const quantidades = (Array.isArray(d.quantidades) ? d.quantidades : [5, 10, 20])
    .map(Number)
    .filter((n: number) => n > 0);
  return {
    titulo: d.titulo ?? 'Teste seu conhecimento',
    subtitulo: d.subtitulo ?? '',
    quantidades: quantidades.length ? quantidades : [5, 10, 20],
    temas,
  };
}

// ── Descubra seu curso ───────────────────────────────────────────────────

export interface OpcaoDescubra {
  texto: string;
  pontos: Record<string, number>;
  marca?: string;
  /** desmarca as outras respostas da pergunta (ex.: "Não tenho filhos") */
  exclusiva?: boolean;
}

export interface PerguntaDescubra {
  id: string;
  pergunta: string;
  ajuda: string;
  tipo: 'uma' | 'varias';
  maximo: number;
  mostrarSe: string;
  opcoes: OpcaoDescubra[];
}

export interface TrilhaDescubra {
  nome: string;
  descricao: string;
  cursos: string[];
}

export interface Descubra {
  titulo: string;
  subtitulo: string;
  perguntas: PerguntaDescubra[];
  motivos: Record<string, string>;
  cursos: Record<string, Record<string, number>>;
  duracao: { curto_ate_min: number; longo_a_partir_min: number };
  pontoDePartida: string[];
  trilhas: TrilhaDescubra[];
}

function numeros(o: any): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(o ?? {})) {
    const n = Number(v);
    if (k && Number.isFinite(n)) out[String(k)] = n;
  }
  return out;
}

export function descubra(): Descubra {
  const d = lerFrontmatter('descubra.md');
  return {
    titulo: d.titulo ?? 'Descubra o curso certo para você',
    subtitulo: d.subtitulo ?? '',
    perguntas: (d.perguntas ?? [])
      .filter((p: any) => p && p.id && p.pergunta && Array.isArray(p.opcoes))
      .map((p: any) => ({
        id: String(p.id),
        pergunta: String(p.pergunta),
        ajuda: String(p.ajuda ?? ''),
        tipo: p.tipo === 'varias' ? 'varias' : 'uma',
        maximo: Number(p.maximo ?? 0) || 0,
        mostrarSe: String(p.mostrar_se ?? ''),
        opcoes: p.opcoes
          .filter((o: any) => o && o.texto)
          .map((o: any) => ({
            texto: String(o.texto),
            pontos: numeros(o.pontos),
            ...(o.marca ? { marca: String(o.marca) } : {}),
            ...(o.exclusiva ? { exclusiva: true } : {}),
          })),
      })),
    motivos: Object.fromEntries(Object.entries(d.motivos ?? {}).map(([k, v]) => [k, String(v)])),
    cursos: Object.fromEntries(Object.entries(d.cursos ?? {}).map(([k, v]) => [k, numeros(v)])),
    duracao: {
      curto_ate_min: Number(d.duracao?.curto_ate_min ?? 120),
      longo_a_partir_min: Number(d.duracao?.longo_a_partir_min ?? 480),
    },
    pontoDePartida: (d.ponto_de_partida ?? []).map(String),
    trilhas: (d.trilhas ?? [])
      .filter((t: any) => t && t.nome && Array.isArray(t.cursos))
      .map((t: any) => ({ nome: String(t.nome), descricao: String(t.descricao ?? ''), cursos: t.cursos.map(String) })),
  };
}

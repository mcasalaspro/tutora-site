#!/usr/bin/env node
/**
 * Confere a pasta /conteudo antes de montar o site e explica os problemas em português.
 * Roda sozinho antes de cada "npm run build" (e no GitHub) — ou manualmente: npm run verificar
 *
 * ERRO  → o site não é publicado até corrigir.
 * AVISO → o site é publicado, mas vale olhar.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const RAIZ = process.cwd();
const C = (...p) => path.join(RAIZ, 'conteudo', ...p);
const erros = [];
const avisos = [];
const info = [];

function lerFrontmatter(arquivo) {
  const texto = fs.readFileSync(arquivo, 'utf8').replace(/^﻿/, '');
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('não encontrei o bloco entre as linhas "---" no começo do arquivo');
  return { dados: parse(m[1]) ?? {}, corpo: m[2] };
}

function listar(pasta, ext) {
  if (!fs.existsSync(pasta)) return [];
  return fs.readdirSync(pasta).filter((f) => f.toLowerCase().endsWith(ext) && !f.startsWith('_') && !f.startsWith('.'));
}

// ── configurações ────────────────────────────────────────────────────────
let cfg = {};
try {
  cfg = parse(fs.readFileSync(C('configuracoes.yaml'), 'utf8')) ?? {};
} catch (e) {
  erros.push(`configuracoes.yaml: não consegui ler o arquivo (${e.message}). Confira aspas e recuos.`);
}
const areas = new Set((cfg.areas ?? []).map((a) => a.nome));
if (!areas.size) erros.push('configuracoes.yaml: a lista "areas" está vazia.');

// ── professores ──────────────────────────────────────────────────────────
const profs = new Set();
for (const f of listar(C('professores'), '.md')) {
  const slug = f.replace(/\.md$/i, '');
  try {
    const { dados } = lerFrontmatter(C('professores', f));
    if (!dados.nome) erros.push(`professores/${f}: falta o campo "nome".`);
    if (dados.slug && dados.slug !== slug) avisos.push(`professores/${f}: o campo slug ("${dados.slug}") é diferente do nome do arquivo. Vale o nome do arquivo.`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) erros.push(`professores/${f}: use só letras minúsculas, números e hífens no nome do arquivo (sem acentos e espaços).`);
    profs.add(slug);
  } catch (e) {
    erros.push(`professores/${f}: ${e.message}`);
  }
}

// ── cursos ───────────────────────────────────────────────────────────────
const cursos = new Map();
for (const f of listar(C('cursos'), '.md')) {
  const slug = f.replace(/\.md$/i, '');
  const onde = `cursos/${f}`;
  try {
    const { dados } = lerFrontmatter(C('cursos', f));
    cursos.set(slug, dados);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) erros.push(`${onde}: use só letras minúsculas, números e hífens no nome do arquivo (ele vira o endereço da página).`);
    if (dados.slug && dados.slug !== slug) avisos.push(`${onde}: o campo slug ("${dados.slug}") é diferente do nome do arquivo. O endereço usa o nome do arquivo.`);
    for (const campo of ['titulo', 'area', 'sinopse_curta']) {
      if (!dados[campo]) erros.push(`${onde}: falta o campo "${campo}".`);
    }
    if (dados.area && areas.size && !areas.has(dados.area)) {
      erros.push(`${onde}: a área "${dados.area}" não existe em configuracoes.yaml. Áreas válidas: ${[...areas].join(' | ')}.`);
    }
    if (dados.professor && !profs.has(dados.professor)) {
      erros.push(`${onde}: o professor "${dados.professor}" não tem arquivo em conteudo/professores/${dados.professor}.md.`);
    }
    if (!dados.professor) avisos.push(`${onde}: sem professor definido (a página não mostra professor).`);
    for (const p of dados.professores_convidados ?? []) {
      if (!profs.has(p)) erros.push(`${onde}: o professor convidado "${p}" não tem arquivo em conteudo/professores/.`);
    }
    if (!Array.isArray(dados.curriculo) || !dados.curriculo.length) {
      erros.push(`${onde}: o currículo (lista "curriculo") está vazio.`);
    } else {
      dados.curriculo.forEach((a, i) => {
        if (!a || typeof a.aula !== 'string' || !a.aula.trim()) erros.push(`${onde}: a aula nº ${i + 1} do currículo está sem o campo "aula".`);
      });
    }
    if ((dados.sinopse_curta ?? '').length > 200) avisos.push(`${onde}: sinopse_curta com mais de 200 caracteres (fica cortada nos cards e no Google).`);
  } catch (e) {
    erros.push(`${onde}: ${e.message}`);
  }
}
for (const [slug, d] of cursos) {
  for (const r of d.cursos_relacionados ?? []) {
    if (!cursos.has(r)) avisos.push(`cursos/${slug}.md: o curso relacionado "${r}" não existe (será ignorado).`);
  }
}
const trilhas = cfg.trilhas ?? [];
for (const t of trilhas) {
  for (const s of t.cursos ?? []) if (!cursos.has(s)) avisos.push(`configuracoes.yaml: a trilha "${t.titulo}" cita o curso "${s}", que não existe.`);
}

// ── quizzes ──────────────────────────────────────────────────────────────
for (const f of listar(C('quizzes'), '.md')) {
  const slug = f.replace(/\.md$/i, '');
  if (!cursos.has(slug)) avisos.push(`quizzes/${f}: não existe curso com esse nome de arquivo (o quiz não aparece).`);
  const texto = fs.readFileSync(C('quizzes', f), 'utf8');
  const n = (texto.match(/^###\s+\d+\./gm) ?? []).length;
  if (n < 3) avisos.push(`quizzes/${f}: encontrei só ${n} pergunta(s).`);
}
const semQuiz = [...cursos.keys()].filter((s) => !fs.existsSync(C('quizzes', `${s}.md`)));
if (semQuiz.length) info.push(`${semQuiz.length} curso(s) sem quiz: ${semQuiz.join(', ')}.`);

// ── preços ───────────────────────────────────────────────────────────────
const csv = C('precos.csv');
if (!fs.existsSync(csv)) {
  avisos.push('precos.csv não existe: todos os cursos aparecem como "Inscrições em breve".');
} else {
  const linhas = fs.readFileSync(csv, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  const sep = (linhas[0].match(/;/g)?.length ?? 0) >= (linhas[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const cab = linhas[0].split(sep).map((s) => s.trim().toLowerCase().replace(/^"|"$/g, ''));
  for (const col of ['slug', 'preco', 'link_hotmart']) {
    if (!cab.includes(col)) erros.push(`precos.csv: falta a coluna "${col}" na primeira linha.`);
  }
  const iSlug = cab.indexOf('slug');
  const iLink = cab.indexOf('link_hotmart');
  const iStatus = cab.indexOf('status');
  const vistos = new Set();
  linhas.slice(1).forEach((l, k) => {
    const v = l.split(sep).map((s) => s.trim().replace(/^"|"$/g, ''));
    const slug = v[iSlug];
    if (!slug) return;
    if (vistos.has(slug)) avisos.push(`precos.csv linha ${k + 2}: o slug "${slug}" aparece mais de uma vez (vale a última).`);
    vistos.add(slug);
    if (slug !== 'assinatura' && !cursos.has(slug)) avisos.push(`precos.csv linha ${k + 2}: não existe curso "${slug}".`);
    const link = v[iLink] ?? '';
    if (link && !/^https?:\/\//i.test(link)) avisos.push(`precos.csv linha ${k + 2}: o link de "${slug}" não começa com https://`);
    const st = (v[iStatus] ?? '').toLowerCase();
    if (st && !['ativo', 'em-breve', 'em breve', 'oculto'].includes(st)) avisos.push(`precos.csv linha ${k + 2}: status "${st}" desconhecido (use ativo, em-breve ou oculto).`);
  });
  const semPreco = [...cursos.keys()].filter((s) => !vistos.has(s));
  if (semPreco.length) info.push(`${semPreco.length} curso(s) sem linha no precos.csv (aparecem como "Inscrições em breve").`);
}

// ── vídeos (YouTube) ─────────────────────────────────────────────────────
const csvVideos = C('videos.csv');
if (fs.existsSync(csvVideos)) {
  const linhas = fs.readFileSync(csvVideos, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  const sep = (linhas[0].match(/;/g)?.length ?? 0) >= (linhas[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const cab = linhas[0].split(sep).map((s) => s.trim().toLowerCase().replace(/^"|"$/g, ''));
  for (const col of ['curso', 'tipo', 'link']) {
    if (!cab.includes(col)) erros.push(`videos.csv: falta a coluna "${col}" na primeira linha.`);
  }
  const slugsArea = new Set((cfg.areas ?? []).map((a) => a.slug));
  const comVideo = new Set();
  linhas.slice(1).forEach((l, k) => {
    const v = l.split(sep).map((s) => s.trim().replace(/^"|"$/g, ''));
    const curso = v[cab.indexOf('curso')] ?? '';
    const tipo = (v[cab.indexOf('tipo')] ?? '').toLowerCase();
    const link = v[cab.indexOf('link')] ?? '';
    if (!curso && !link) return;
    const onde = `videos.csv linha ${k + 2}`;
    if (curso.startsWith('area:')) {
      if (!slugsArea.has(curso.slice(5))) avisos.push(`${onde}: não existe a área "${curso.slice(5)}" (use o slug de uma área de configuracoes.yaml).`);
    } else if (!cursos.has(curso)) {
      avisos.push(`${onde}: não existe curso "${curso}" (o vídeo não aparece).`);
    } else comVideo.add(curso);
    if (!/(youtube(-nocookie)?\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]{11}/.test(link)) avisos.push(`${onde}: o link "${link}" não parece um vídeo do YouTube.`);
    if (tipo && !tipo.startsWith('apres') && !tipo.startsWith('aula')) avisos.push(`${onde}: tipo "${tipo}" desconhecido (use apresentacao ou aula-gratis).`);
  });
  info.push(`${comVideo.size} curso(s) com vídeo no YouTube (videos.csv).`);
}

// ── quiz geral (conteudo/quiz-geral.md) ─────────────────────────────────
if (fs.existsSync(C('quiz-geral.md'))) {
  try {
    const { dados } = lerFrontmatter(C('quiz-geral.md'));
    const vistos = new Set();
    for (const t of dados.temas ?? []) {
      if (!t?.nome || !t?.slug) {
        erros.push('quiz-geral.md: todo tema precisa de "nome" e "slug".');
        continue;
      }
      if (vistos.has(t.slug)) erros.push(`quiz-geral.md: o slug de tema "${t.slug}" aparece duas vezes.`);
      vistos.add(t.slug);
      if (t.cursos === 'todos' || t.cursos === '*') continue;
      for (const s of t.cursos ?? []) {
        if (!cursos.has(s)) avisos.push(`quiz-geral.md: o tema "${t.nome}" cita o curso "${s}", que não existe.`);
        else if (!fs.existsSync(C('quizzes', `${s}.md`))) avisos.push(`quiz-geral.md: o curso "${s}" (tema "${t.nome}") não tem quiz.`);
      }
    }
  } catch (e) {
    erros.push(`quiz-geral.md: ${e.message}`);
  }
}

// ── descubra seu curso (conteudo/descubra.md) ───────────────────────────
if (fs.existsSync(C('descubra.md'))) {
  try {
    const { dados } = lerFrontmatter(C('descubra.md'));
    const motivos = new Set(Object.keys(dados.motivos ?? {}));
    const auto = new Set(['curto', 'medio', 'longo']);
    const ids = new Set();
    const marcas = new Set();
    const etiquetasRespostas = new Set();
    for (const p of dados.perguntas ?? []) {
      if (!p?.id || !p?.pergunta) {
        erros.push('descubra.md: toda pergunta precisa de "id" e "pergunta".');
        continue;
      }
      if (ids.has(p.id)) erros.push(`descubra.md: o id de pergunta "${p.id}" aparece duas vezes.`);
      ids.add(p.id);
      if (!Array.isArray(p.opcoes) || p.opcoes.length < 2) erros.push(`descubra.md: a pergunta "${p.id}" precisa de pelo menos duas opções.`);
      for (const o of p.opcoes ?? []) {
        if (o?.marca) marcas.add(o.marca);
        for (const t of Object.keys(o?.pontos ?? {})) etiquetasRespostas.add(t);
      }
    }
    for (const p of dados.perguntas ?? []) {
      if (p?.mostrar_se && !marcas.has(p.mostrar_se)) avisos.push(`descubra.md: a pergunta "${p.id}" só aparece depois da marca "${p.mostrar_se}", mas nenhuma resposta tem essa marca.`);
    }
    const etiquetasCursos = new Set();
    for (const [slug, tags] of Object.entries(dados.cursos ?? {})) {
      if (!cursos.has(slug)) avisos.push(`descubra.md: o curso "${slug}" não existe (será ignorado).`);
      for (const t of Object.keys(tags ?? {})) {
        etiquetasCursos.add(t);
        if (!motivos.has(t) && !auto.has(t)) avisos.push(`descubra.md: a etiqueta "${t}" (curso ${slug}) não tem frase em "motivos".`);
      }
    }
    for (const t of etiquetasRespostas) {
      if (!etiquetasCursos.has(t) && !auto.has(t)) avisos.push(`descubra.md: a etiqueta "${t}" aparece nas respostas, mas nenhum curso a tem (não muda nada).`);
    }
    for (const t of dados.trilhas ?? []) {
      for (const s of t?.cursos ?? []) if (!cursos.has(s)) avisos.push(`descubra.md: a trilha "${t.nome}" cita o curso "${s}", que não existe.`);
    }
    for (const s of dados.ponto_de_partida ?? []) if (!cursos.has(s)) avisos.push(`descubra.md: ponto_de_partida cita o curso "${s}", que não existe.`);
    const fora = [...cursos.keys()].filter((s) => !(s in (dados.cursos ?? {})));
    if (fora.length) info.push(`${fora.length} curso(s) fora do "Descubra seu curso" (nunca são sugeridos): ${fora.join(', ')}.`);
  } catch (e) {
    erros.push(`descubra.md: ${e.message}`);
  }
}

// ── imagens ──────────────────────────────────────────────────────────────
const imgs = new Set(
  (fs.existsSync(C('imagens', 'cursos')) ? fs.readdirSync(C('imagens', 'cursos')) : []).map((f) =>
    f.toLowerCase().replace(/\.(jpe?g|png|webp|avif)$/, ''),
  ),
);
const semH = [...cursos.keys()].filter((s) => !imgs.has(`${s}-horizontal`));
const semP = [...cursos.keys()].filter((s) => !imgs.has(`${s}-poster`));
if (semH.length) info.push(`${semH.length} de ${cursos.size} cursos ainda sem imagem horizontal (usam a foto do professor ou uma capa provisória).`);
if (semP.length) info.push(`${semP.length} de ${cursos.size} cursos ainda sem pôster (usam a capa tipográfica provisória).`);
for (const f of fs.existsSync(C('imagens', 'cursos')) ? fs.readdirSync(C('imagens', 'cursos')) : []) {
  const base = f.toLowerCase().replace(/\.(jpe?g|png|webp|avif)$/, '');
  if (f.startsWith('.') || f.toLowerCase().endsWith('.txt') || f.toLowerCase().endsWith('.md')) continue;
  const m = base.match(/^(.*)-(horizontal|poster)$/);
  if (!m) avisos.push(`imagens/cursos/${f}: nome fora do padrão. Use <slug>-horizontal.jpg ou <slug>-poster.jpg.`);
  else if (!cursos.has(m[1])) avisos.push(`imagens/cursos/${f}: não existe curso "${m[1]}".`);
}

// ── relatório ────────────────────────────────────────────────────────────
const cor = (n, s) => (process.stdout.isTTY ? `\x1b[${n}m${s}\x1b[0m` : s);
console.log(`\nConferindo o conteúdo: ${cursos.size} cursos, ${profs.size} professores.`);
for (const i of info) console.log(cor(36, '  • ') + i);
for (const a of avisos) console.log(cor(33, '  AVISO ') + a);
for (const e of erros) console.log(cor(31, '  ERRO  ') + e);
if (erros.length) {
  console.log(cor(31, `\n${erros.length} erro(s): corrija antes de publicar.\n`));
  process.exit(1);
}
console.log(cor(32, `\nTudo certo${avisos.length ? ` (${avisos.length} aviso(s))` : ''}.\n`));

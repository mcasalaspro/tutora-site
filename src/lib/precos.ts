/**
 * Lê conteudo/precos.csv — a tabela central de preços e links da Hotmart.
 *
 * Aceita separador ";" (padrão do Excel em português) ou ",".
 * Colunas: slug; titulo; preco; preco_parcelado; link_hotmart; status; observacao
 *   status: ativo (padrão) | em-breve | oculto (esconde o curso do site)
 * A linha com slug "assinatura" define o plano de acesso a todos os cursos.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface Preco {
  slug: string;
  titulo: string;
  preco: string;
  preco_parcelado: string;
  link_hotmart: string;
  status: 'ativo' | 'em-breve' | 'oculto';
  observacao: string;
}

function dividirLinha(linha: string, sep: string): string[] {
  const campos: string[] = [];
  let atual = '';
  let aspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (aspas) {
      if (c === '"' && linha[i + 1] === '"') {
        atual += '"';
        i++;
      } else if (c === '"') aspas = false;
      else atual += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) {
      campos.push(atual);
      atual = '';
    } else atual += c;
  }
  campos.push(atual);
  return campos.map((s) => s.trim());
}

export function lerCsv(texto: string): Record<string, string>[] {
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (!linhas.length) return [];
  const sep = (linhas[0].match(/;/g)?.length ?? 0) >= (linhas[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const cab = dividirLinha(linhas[0], sep).map((h) => h.toLowerCase());
  return linhas.slice(1).map((l) => {
    const v = dividirLinha(l, sep);
    const o: Record<string, string> = {};
    cab.forEach((h, i) => (o[h] = v[i] ?? ''));
    return o;
  });
}

let cache: Map<string, Preco> | null = null;

export function precos(): Map<string, Preco> {
  if (cache) return cache;
  const arquivo = path.join(process.cwd(), 'conteudo', 'precos.csv');
  cache = new Map();
  if (!fs.existsSync(arquivo)) return cache;
  for (const r of lerCsv(fs.readFileSync(arquivo, 'utf8'))) {
    const slug = (r.slug ?? '').trim();
    if (!slug) continue;
    const st = (r.status ?? '').trim().toLowerCase();
    cache.set(slug, {
      slug,
      titulo: r.titulo ?? '',
      preco: r.preco ?? '',
      preco_parcelado: r.preco_parcelado ?? '',
      link_hotmart: r.link_hotmart ?? '',
      status: st === 'oculto' ? 'oculto' : st === 'em-breve' || st === 'em breve' ? 'em-breve' : 'ativo',
      observacao: r.observacao ?? '',
    });
  }
  return cache;
}

/** Link utilizável? (vazio ou "em-breve" contam como sem link) */
export function linkValido(link: string | undefined): boolean {
  if (!link) return false;
  if (/em-breve|embreve|exemplo|example/i.test(link)) return false;
  return /^https?:\/\//i.test(link.trim());
}

/** "297" / "297,00" / "R$ 297,00" → "R$ 297,00"; outros textos passam como estão. */
export function formatarPreco(valor: string | undefined): string {
  const v = (valor ?? '').trim();
  if (!v) return '';
  const limpo = v.replace(/R\$\s*/i, '').trim();
  if (/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$|^\d+(\.\d{1,2})?$/.test(limpo)) {
    let n: number;
    if (limpo.includes(',')) n = Number(limpo.replace(/\./g, '').replace(',', '.'));
    else if (/^\d+\.\d{1,2}$/.test(limpo)) n = Number(limpo);
    else n = Number(limpo.replace(/\./g, ''));
    if (!Number.isNaN(n)) return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return v;
}

export interface OfertaCurso {
  preco: string;
  parcelado: string;
  link: string;
  disponivel: boolean;
  status: Preco['status'];
}

export function ofertaDe(slug: string): OfertaCurso {
  const p = precos().get(slug);
  const link = p?.link_hotmart ?? '';
  const status = p?.status ?? 'ativo';
  return {
    preco: formatarPreco(p?.preco),
    parcelado: (p?.preco_parcelado ?? '').trim(),
    link: linkValido(link) ? link.trim() : '',
    disponivel: linkValido(link) && status === 'ativo',
    status,
  };
}

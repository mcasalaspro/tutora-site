/** Utilidades de texto, números e endereços. */

/** Junta o "base" do site (ex.: /tutora-site/) com um caminho interno. */
export function url(caminho = '/'): string {
  const base = import.meta.env.BASE_URL || '/';
  const b = base.endsWith('/') ? base : base + '/';
  const c = caminho.replace(/^\/+/, '');
  return b + c;
}

/** Endereço absoluto (para Open Graph, JSON-LD, canonical). */
export function urlAbsoluta(caminho: string, site: URL | undefined): string {
  const rel = url(caminho);
  return site ? new URL(rel, site).toString() : rel;
}

/** Remove acentos e baixa a caixa (para busca e comparação). */
export function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function slugificar(s: string): string {
  return normalizar(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** 95 → "1h35"; 45 → "45 min"; 120 → "2h" */
export function duracaoCurta(minutos: number | undefined): string {
  if (!minutos || minutos <= 0) return '';
  const m = Math.round(minutos);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h${String(r).padStart(2, '0')}` : `${h}h`;
}

/** 13.4 horas → "13 horas"; 1.5 → "1h30"; 0.6 → "36 min" */
export function duracaoTotal(minutos: number): string {
  if (minutos <= 0) return '';
  if (minutos < 60) return `${Math.round(minutos)} min`;
  const horas = minutos / 60;
  if (horas >= 10) return `${Math.round(horas)} horas`;
  return duracaoCurta(minutos);
}

/** "Aula 3 — Título" → { rotulo: "Aula 3", titulo: "Título" } */
export function separarAula(aula: string): { rotulo: string; titulo: string } {
  const m = aula.match(/^(.*?)\s+[—–-]\s+(.*)$/);
  if (m) return { rotulo: m[1].trim(), titulo: m[2].trim() };
  return { rotulo: '', titulo: aula.trim() };
}

export function plural(n: number, singular: string, pluralForma?: string): string {
  return `${n} ${n === 1 ? singular : pluralForma ?? singular + 's'}`;
}

/** Iniciais para avatar sem foto: "Mauro Keller" → "MK" */
export function iniciais(nome: string): string {
  const partes = nome.split(/\s+/).filter((p) => p && !/^(de|da|do|dos|das|e)$/i.test(p));
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

/** Hash estável de uma string (para escolher cores de capa provisória). */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Separa um texto longo em parágrafos (linha em branco = novo parágrafo). */
export function paragrafos(texto: string): string[] {
  return (texto ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

/** Aceita links do YouTube em vários formatos e devolve o ID do vídeo (ou ''). */
export function idYoutube(link: string): string {
  if (!link) return '';
  const m =
    link.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/) ||
    link.match(/youtu\.be\/([\w-]{11})/) ||
    link.match(/[?&]v=([\w-]{11})/);
  return m ? m[1] : '';
}

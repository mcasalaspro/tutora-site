/**
 * Interesses de quem visita o site, guardados SÓ no navegador da pessoa (localStorage).
 * Servem para a vitrine da home sugerir cursos parecidos com o que ela já viu.
 * Nada disto é enviado para a Tutora nem para ninguém. A página /privacidade/ explica e tem o botão de apagar.
 *
 * Formato (chave "tutora-interesses"). O sorteio da vitrine (src/scripts/vitrine-sorteio.js) lê o mesmo formato:
 * {
 *   "versao": 1,
 *   "cursos":      { "<slug>": { "vezes": 3, "forte": 1, "em": 1727200000000 } },
 *   "areas":       { "<slug>": { "vezes": 1, "em": 1727200000000 } },
 *   "professores": { "<slug>": { "vezes": 1, "em": 1727200000000 } },
 *   "descubra":    { "cursos": ["<slug>", "..."], "em": 1727200000000 },
 *   "vitrine":     { "primeiro": "<slug>", "em": 1727200000000 }
 * }
 *   vezes    = páginas abertas (cada página conta uma vez por sessão; recarregar não soma)
 *   forte    = cliques em comprar, "avise-me" ou no vídeo do curso
 *   em       = quando foi a última vez (milissegundos)
 *   descubra = resultado do "Descubra seu curso", do mais indicado para o menos
 *   vitrine  = o 1º destaque mostrado na última visita à home (a próxima começa por outro)
 */
export const CHAVE = 'tutora-interesses';
const CHAVE_SESSAO = 'tutora-interesses-sessao';
const UM_ANO = 365 * 24 * 60 * 60 * 1000;
const MAX_POR_TIPO = 120;

export type Tipo = 'cursos' | 'areas' | 'professores';
interface Registro {
  vezes: number;
  forte?: number;
  em: number;
}
export interface Perfil {
  versao: 1;
  cursos: Record<string, Registro>;
  areas: Record<string, Registro>;
  professores: Record<string, Registro>;
  descubra?: { cursos: string[]; em: number };
  vitrine?: { primeiro: string; em: number };
}

const vazio = (): Perfil => ({ versao: 1, cursos: {}, areas: {}, professores: {} });

export function lerPerfil(): Perfil {
  try {
    const p = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    if (p && p.versao === 1) return { ...vazio(), ...p };
  } catch {
    /* navegador sem armazenamento (ou dado corrompido): segue sem histórico */
  }
  return vazio();
}

/** Esquece o que tem mais de um ano e limita o tamanho. */
function podar(p: Perfil) {
  const limite = Date.now() - UM_ANO;
  for (const tipo of ['cursos', 'areas', 'professores'] as Tipo[]) {
    const entradas = Object.entries(p[tipo] ?? {})
      .filter(([, r]) => r && typeof r.em === 'number' && r.em > limite)
      .sort((a, b) => b[1].em - a[1].em)
      .slice(0, MAX_POR_TIPO);
    p[tipo] = Object.fromEntries(entradas);
  }
  if (p.descubra && !(p.descubra.em > limite)) delete p.descubra;
}

function salvar(p: Perfil) {
  try {
    podar(p);
    localStorage.setItem(CHAVE, JSON.stringify(p));
  } catch {
    /* sem armazenamento: não guarda */
  }
}

/** Cada página conta uma vez por sessão do navegador. */
function primeiraVezNaSessao(chave: string): boolean {
  try {
    const vistos: string[] = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || '[]');
    if (vistos.includes(chave)) return false;
    vistos.push(chave);
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(vistos.slice(-200)));
  } catch {
    /* sem sessionStorage: conta sempre */
  }
  return true;
}

export function registrarVisita(tipo: Tipo, slug: string) {
  if (!slug) return;
  const p = lerPerfil();
  const r = p[tipo][slug] ?? { vezes: 0, em: 0 };
  if (primeiraVezNaSessao(`${tipo}:${slug}`)) r.vezes = Math.min((r.vezes || 0) + 1, 50);
  r.em = Date.now();
  p[tipo][slug] = r;
  salvar(p);
}

/** Comprar, "avise-me" ou dar play no vídeo: interesse forte no curso (uma vez por sessão). */
export function registrarForte(slug: string) {
  if (!slug || !primeiraVezNaSessao(`forte:${slug}`)) return;
  const p = lerPerfil();
  const r = p.cursos[slug] ?? { vezes: 0, em: 0 };
  r.forte = Math.min((r.forte ?? 0) + 1, 20);
  r.em = Date.now();
  p.cursos[slug] = r;
  salvar(p);
}

/** Resultado do "Descubra seu curso", do mais indicado para o menos. */
export function lembrarDescubra(slugs: string[]) {
  const lista = [...new Set(slugs.filter(Boolean))].slice(0, 8);
  if (!lista.length) return;
  const p = lerPerfil();
  p.descubra = { cursos: lista, em: Date.now() };
  salvar(p);
}

/** Apaga tudo o que o site guardou neste navegador. */
export function apagarPerfil(): boolean {
  try {
    localStorage.removeItem(CHAVE);
    sessionStorage.removeItem(CHAVE_SESSAO);
    return true;
  } catch {
    return false;
  }
}

/** Há algo guardado? (para a página de privacidade) */
export function temPerfil(): boolean {
  try {
    return Boolean(localStorage.getItem(CHAVE));
  } catch {
    return false;
  }
}

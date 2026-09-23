/**
 * Lê o corpo dos arquivos conteudo/quizzes/<slug>.md.
 *
 * Formato (tolerante: blocos quebrados são ignorados):
 *
 *   ## quiz
 *
 *   ### 1. Enunciado da pergunta?
 *   - tipo: multipla_escolha | verdadeiro_falso
 *   - dificuldade: facil | media | dificil
 *   - fonte: transcricao | externo
 *   - alternativas:              (só em multipla_escolha)
 *     - "Alternativa A"
 *     - "Alternativa B"
 *   - resposta_correta: B        (letra, ou verdadeiro/falso)
 *   - explicacao: "Por que a resposta é essa."
 *
 *   ## curiosidades
 *
 *   ### 1.
 *   - categoria: historica | cotidiano | provocativa | referencia
 *   - fonte: transcricao | externo
 *   - texto: "Texto da curiosidade."
 */

export interface Pergunta {
  enunciado: string;
  tipo: 'multipla_escolha' | 'verdadeiro_falso';
  dificuldade: 'facil' | 'media' | 'dificil';
  alternativas: string[];
  correta: number;
  explicacao: string;
}

export interface Curiosidade {
  categoria: string;
  texto: string;
}

/**
 * Aspas retas usadas para citar viram aspas curvas (“ ”), como no resto do site.
 * Apóstrofos dentro de palavras (d'Arc, O'Neill) ficam como estão.
 */
export function aspasCurvas(s: string): string {
  return s
    .replace(/\\"/g, '"')
    .replace(/(^|[\s([{—–\-/])"(?=\S)/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(^|[\s([{—–\-/])'(?=\S)([^'\n]*?\S)'(?=$|[\s.,;:!?)\]}—–\-…])/g, '$1“$2”');
}

function tirarAspas(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith('“') && t.endsWith('”'))) return t.slice(1, -1).trim();
  return t;
}

function secoes(corpo: string): Record<string, string> {
  const out: Record<string, string> = {};
  const partes = corpo.split(/^##\s+(?!#)/m);
  for (const p of partes) {
    const nl = p.indexOf('\n');
    if (nl < 0) continue;
    const nome = p.slice(0, nl).trim().toLowerCase();
    out[nome] = p.slice(nl + 1);
  }
  return out;
}

function blocos(texto: string): { titulo: string; linhas: string[] }[] {
  return texto
    .split(/^###\s+/m)
    .slice(1)
    .map((b) => {
      const [primeira, ...resto] = b.split('\n');
      return { titulo: primeira.trim(), linhas: resto };
    });
}

function campo(linhas: string[], nome: string): string {
  const re = new RegExp(`^\\s*-\\s*${nome}\\s*:\\s*(.*)$`, 'i');
  for (const l of linhas) {
    const m = l.match(re);
    if (m) return tirarAspas(m[1]);
  }
  return '';
}

function alternativas(linhas: string[]): string[] {
  const i = linhas.findIndex((l) => /^\s*-\s*alternativas\s*:/i.test(l));
  if (i < 0) return [];
  const alts: string[] = [];
  for (const l of linhas.slice(i + 1)) {
    const m = l.match(/^\s{2,}-\s*(.+)$/);
    if (m) alts.push(tirarAspas(m[1]));
    else if (/^\s*-\s*\w+\s*:/.test(l)) break;
  }
  return alts;
}

export function lerQuiz(corpo: string): { perguntas: Pergunta[]; curiosidades: Curiosidade[] } {
  const s = secoes(corpo ?? '');
  const perguntas: Pergunta[] = [];
  for (const b of blocos(s['quiz'] ?? '')) {
    try {
      const enunciado = b.titulo.replace(/^\d+\.\s*/, '').trim();
      const tipo = campo(b.linhas, 'tipo').toLowerCase().includes('verdadeiro') ? 'verdadeiro_falso' : 'multipla_escolha';
      const dif = campo(b.linhas, 'dificuldade').toLowerCase();
      const dificuldade = (['facil', 'media', 'dificil'].includes(dif) ? dif : 'media') as Pergunta['dificuldade'];
      const resp = campo(b.linhas, 'resposta_correta').trim().toLowerCase();
      const explicacao = campo(b.linhas, 'explicacao');
      let alts: string[];
      let correta: number;
      if (tipo === 'verdadeiro_falso') {
        alts = ['Verdadeiro', 'Falso'];
        correta = resp.startsWith('v') ? 0 : resp.startsWith('f') ? 1 : -1;
      } else {
        alts = alternativas(b.linhas);
        correta = /^[a-f]$/.test(resp) ? resp.charCodeAt(0) - 97 : -1;
      }
      if (!enunciado || correta < 0 || correta >= alts.length || alts.length < 2) continue;
      perguntas.push({
        enunciado: aspasCurvas(enunciado),
        tipo,
        dificuldade,
        alternativas: alts.map(aspasCurvas),
        correta,
        explicacao: aspasCurvas(explicacao),
      });
    } catch {
      /* bloco ignorado */
    }
  }
  const curiosidades: Curiosidade[] = [];
  for (const b of blocos(s['curiosidades'] ?? '')) {
    const texto = campo(b.linhas, 'texto');
    if (texto) curiosidades.push({ categoria: campo(b.linhas, 'categoria').toLowerCase(), texto: aspasCurvas(texto) });
  }
  return { perguntas, curiosidades };
}

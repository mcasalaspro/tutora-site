/**
 * parseQuiz.ts
 * -----------------------------------------------------------------------------
 * Parser do corpo dos arquivos em `src/content/quizzes/*.md`.
 *
 * O frontmatter do arquivo é tratado pelo Astro Content Collections (schema em
 * src/content/config.ts). Este parser olha apenas o conteúdo Markdown depois
 * do frontmatter — a `body` retornada por `getEntry('quizzes', slug)`.
 *
 * Formato esperado (parser é TOLERANTE: erros silenciosos, ignora bloco quebrado):
 *
 *   ## quiz
 *
 *   ### 1. [Enunciado]
 *   - tipo: multipla_escolha | verdadeiro_falso
 *   - dificuldade: facil | media | dificil
 *   - fonte: transcricao | externo
 *   - alternativas:                      # apenas se multipla_escolha
 *     - "Alternativa A"
 *     - "Alternativa B"
 *     - "Alternativa C"
 *     - "Alternativa D"
 *   - resposta_correta: A | B | C | D | verdadeiro | falso
 *   - explicacao: "Texto da explicação..."
 *
 *   ### 2. [...]   (até 30)
 *
 *   ## curiosidades
 *
 *   ### 1.
 *   - categoria: provocativa | historica | cotidiano | referencia
 *   - fonte: transcricao | externo
 *   - texto: "Texto da curiosidade..."
 *
 *   ### 2.   (até 20)
 *
 * Observação: os valores das listas podem estar entre aspas ou não. O parser
 * aceita ambos os formatos e remove aspas de abertura/fechamento.
 */

export type TipoPergunta = 'multipla_escolha' | 'verdadeiro_falso';
export type Dificuldade = 'facil' | 'media' | 'dificil';
export type Fonte = 'transcricao' | 'externo';
export type CategoriaCuriosidade = 'provocativa' | 'historica' | 'cotidiano' | 'referencia';

export interface Pergunta {
  numero: number;
  enunciado: string;
  tipo: TipoPergunta;
  dificuldade: Dificuldade;
  fonte: Fonte;
  alternativas: string[]; // vazio se verdadeiro_falso
  resposta_correta: string; // "A"|"B"|"C"|"D" ou "verdadeiro"|"falso"
  explicacao: string;
}

export interface Curiosidade {
  numero: number;
  categoria: CategoriaCuriosidade;
  fonte: Fonte;
  texto: string;
}

export interface QuizParsed {
  perguntas: Pergunta[];
  curiosidades: Curiosidade[];
}

/** Remove aspas duplas/simples envolvendo um valor, se houver. */
function unquote(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/** Extrai o valor após `chave:` em uma linha do tipo `- chave: valor` ou `chave: valor`. */
function parseField(line: string): { key: string; value: string } | null {
  // Remove o hífen inicial e espaços (lista markdown)
  const cleaned = line.replace(/^\s*-\s+/, '').trim();
  const idx = cleaned.indexOf(':');
  if (idx < 0) return null;
  return {
    key: cleaned.slice(0, idx).trim().toLowerCase(),
    value: unquote(cleaned.slice(idx + 1).trim()),
  };
}

/** Garante que um valor seja um dos esperados, com fallback. */
function safeEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  const v = value.toLowerCase().trim() as T;
  return allowed.includes(v) ? v : fallback;
}

/** Divide o corpo nas duas seções principais. */
function splitSections(body: string): { quizSection: string; curiosidadesSection: string } {
  // Normaliza quebras de linha
  const normalized = body.replace(/\r\n/g, '\n');

  // Localiza headings ## quiz e ## curiosidades (case-insensitive, tolerante a acentos)
  const quizMatch = normalized.match(/^##\s+quiz\s*$/im);
  const curiosidadesMatch = normalized.match(/^##\s+curiosidades\s*$/im);

  if (!quizMatch) return { quizSection: '', curiosidadesSection: '' };

  const quizStart = (quizMatch.index ?? 0) + quizMatch[0].length;

  if (!curiosidadesMatch) {
    return { quizSection: normalized.slice(quizStart), curiosidadesSection: '' };
  }

  const curStart = (curiosidadesMatch.index ?? 0) + curiosidadesMatch[0].length;
  return {
    quizSection: normalized.slice(quizStart, curiosidadesMatch.index),
    curiosidadesSection: normalized.slice(curStart),
  };
}

/** Divide uma seção em blocos `### N. ...`. */
function splitItems(section: string): string[] {
  const items: string[] = [];
  const regex = /^###\s+\d+\.?[^\n]*$/gm;
  const matches: { index: number; text: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(section)) !== null) {
    matches.push({ index: m.index, text: m[0] });
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : section.length;
    items.push(section.slice(start, end).trim());
  }
  return items;
}

function parsePergunta(block: string, numero: number): Pergunta | null {
  const lines = block.split('\n');
  if (lines.length === 0) return null;

  // Primeira linha: ### N. Enunciado
  const headMatch = lines[0].match(/^###\s+\d+\.?\s*(.*)$/);
  if (!headMatch) return null;
  const enunciado = headMatch[1].trim();
  if (!enunciado) return null;

  let tipo: TipoPergunta = 'multipla_escolha';
  let dificuldade: Dificuldade = 'media';
  let fonte: Fonte = 'transcricao';
  const alternativas: string[] = [];
  let resposta_correta = '';
  let explicacao = '';
  let dentroAlternativas = false;

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;

    // Item de alternativa (linha que começa com indentação seguida de `- "..."`)
    if (dentroAlternativas && /^\s{2,}-\s+/.test(raw)) {
      const v = raw.replace(/^\s+-\s+/, '').trim();
      alternativas.push(unquote(v));
      continue;
    } else if (dentroAlternativas) {
      // Sai da lista de alternativas quando aparece outro campo (sem indentação extra)
      dentroAlternativas = false;
    }

    const parsed = parseField(raw);
    if (!parsed) continue;
    const { key, value } = parsed;

    switch (key) {
      case 'tipo':
        tipo = safeEnum(value, ['multipla_escolha', 'verdadeiro_falso'] as const, 'multipla_escolha');
        break;
      case 'dificuldade':
        dificuldade = safeEnum(value, ['facil', 'media', 'dificil'] as const, 'media');
        break;
      case 'fonte':
        fonte = safeEnum(value, ['transcricao', 'externo'] as const, 'transcricao');
        break;
      case 'alternativas':
        dentroAlternativas = true;
        break;
      case 'resposta_correta':
        resposta_correta = value.toLowerCase();
        break;
      case 'explicacao':
        explicacao = value;
        break;
    }
  }

  // Validações mínimas
  if (!resposta_correta) return null;
  if (tipo === 'multipla_escolha' && alternativas.length < 2) return null;
  if (tipo === 'verdadeiro_falso' && !['verdadeiro', 'falso'].includes(resposta_correta)) return null;

  return {
    numero,
    enunciado,
    tipo,
    dificuldade,
    fonte,
    alternativas,
    resposta_correta: tipo === 'multipla_escolha' ? resposta_correta.toUpperCase() : resposta_correta,
    explicacao,
  };
}

function parseCuriosidade(block: string, numero: number): Curiosidade | null {
  const lines = block.split('\n');
  let categoria: CategoriaCuriosidade = 'cotidiano';
  let fonte: Fonte = 'transcricao';
  let texto = '';

  for (let i = 1; i < lines.length; i++) {
    const parsed = parseField(lines[i]);
    if (!parsed) continue;
    const { key, value } = parsed;
    switch (key) {
      case 'categoria':
        categoria = safeEnum(
          value,
          ['provocativa', 'historica', 'cotidiano', 'referencia'] as const,
          'cotidiano'
        );
        break;
      case 'fonte':
        fonte = safeEnum(value, ['transcricao', 'externo'] as const, 'transcricao');
        break;
      case 'texto':
        texto = value;
        break;
    }
  }

  if (!texto) return null;
  return { numero, categoria, fonte, texto };
}

/**
 * Função principal. Recebe o corpo bruto do arquivo de quiz e devolve a estrutura
 * parseada. Em caso de erro de parsing (ou arquivo vazio), retorna listas vazias.
 */
export function parseQuiz(body: string): QuizParsed {
  if (!body || typeof body !== 'string') {
    return { perguntas: [], curiosidades: [] };
  }

  try {
    const { quizSection, curiosidadesSection } = splitSections(body);

    const perguntas: Pergunta[] = [];
    const quizItems = splitItems(quizSection);
    quizItems.forEach((bloco, i) => {
      const p = parsePergunta(bloco, i + 1);
      if (p) perguntas.push(p);
    });

    const curiosidades: Curiosidade[] = [];
    const curItems = splitItems(curiosidadesSection);
    curItems.forEach((bloco, i) => {
      const c = parseCuriosidade(bloco, i + 1);
      if (c) curiosidades.push(c);
    });

    return { perguntas, curiosidades };
  } catch (err) {
    // Em modo dev, mostrar o erro mas não quebrar o build
    if (typeof console !== 'undefined') {
      console.warn('[parseQuiz] erro ao parsear quiz:', err);
    }
    return { perguntas: [], curiosidades: [] };
  }
}

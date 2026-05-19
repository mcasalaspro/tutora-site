/** @jsxImportSource preact */
import { useMemo, useState } from 'preact/hooks';
import type { Pergunta } from '~/lib/parseQuiz';

interface Props {
  perguntas: Pergunta[];
  tituloTema: string;
  linkOferta: string;
}

type Estado = 'em_andamento' | 'finalizado';

/**
 * QuizCurso — quiz interativo, uma pergunta por vez, feedback imediato, barra
 * de progresso, tela final com pontuação + CTA. Não renderiza nada se a lista
 * vier vazia (caller controla, mas defendemos aqui também).
 */
export default function QuizCurso({ perguntas, tituloTema, linkOferta }: Props) {
  if (!perguntas || perguntas.length === 0) return null;

  const total = perguntas.length;
  const [estado, setEstado] = useState<Estado>('em_andamento');
  const [idx, setIdx] = useState(0);
  const [resposta, setResposta] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);

  const pergunta = perguntas[idx];
  const respondida = resposta !== null;

  const acertou = useMemo(() => {
    if (!respondida) return false;
    if (pergunta.tipo === 'multipla_escolha') {
      return resposta === pergunta.resposta_correta;
    }
    return resposta === pergunta.resposta_correta;
  }, [resposta, pergunta, respondida]);

  const responder = (valor: string) => {
    if (respondida) return; // não permite mudar depois de marcar
    setResposta(valor);
    const certo =
      pergunta.tipo === 'multipla_escolha'
        ? valor === pergunta.resposta_correta
        : valor === pergunta.resposta_correta;
    if (certo) setAcertos((a) => a + 1);
  };

  const proxima = () => {
    if (idx + 1 >= total) {
      setEstado('finalizado');
    } else {
      setIdx(idx + 1);
      setResposta(null);
    }
  };

  const refazer = () => {
    setEstado('em_andamento');
    setIdx(0);
    setResposta(null);
    setAcertos(0);
  };

  // -----------------------------------------------------------------
  // Tela final
  if (estado === 'finalizado') {
    const pct = Math.round((acertos / total) * 100);
    const msg =
      pct >= 80
        ? 'Excelente! Você tem boa base no tema.'
        : pct >= 50
        ? 'Bom! Mas há terreno a explorar.'
        : 'Há muito o que descobrir — comece pelo curso.';
    return (
      <section class="container-tutora py-10">
        <h2 class="font-display font-extrabold text-display-md mb-6 text-white">
          Teste seu conhecimento sobre {tituloTema}
        </h2>
        <div class="max-w-2xl bg-tutora-azul-secundario rounded-xl p-8 sm:p-10 border border-tutora-sutil text-center">
          <p class="font-sans text-sm uppercase tracking-wide text-tutora-verde-agua mb-3">
            Resultado
          </p>
          <p class="font-display font-extrabold text-5xl sm:text-6xl text-white">
            {acertos} <span class="text-white/40">/ {total}</span>
          </p>
          <p class="mt-2 font-display font-semibold text-2xl text-tutora-laranja">{pct}%</p>
          <p class="mt-5 font-sans text-base text-white/80 max-w-md mx-auto">{msg}</p>

          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button type="button" onClick={refazer} class="btn-ghost">
              Refazer quiz
            </button>
            <a
              href={linkOferta}
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary"
            >
              Comprar o curso
            </a>
          </div>
        </div>
      </section>
    );
  }

  // -----------------------------------------------------------------
  // Tela em andamento
  const pct = ((idx + (respondida ? 1 : 0)) / total) * 100;

  return (
    <section class="container-tutora py-10">
      <h2 class="font-display font-extrabold text-display-md mb-6 text-white">
        Teste seu conhecimento sobre {tituloTema}
      </h2>

      <div class="max-w-3xl bg-tutora-azul-secundario rounded-xl p-6 sm:p-8 border border-tutora-sutil">
        {/* Barra de progresso */}
        <div class="flex items-center justify-between mb-4 text-sm font-sans">
          <span class="text-white/65">
            Pergunta <strong class="text-white">{idx + 1}</strong> de {total}
          </span>
          <span class="text-tutora-verde-agua font-semibold">
            {acertos} {acertos === 1 ? 'acerto' : 'acertos'}
          </span>
        </div>
        <div class="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-7">
          <div
            class="h-full bg-tutora-laranja transition-all duration-300"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>

        {/* Enunciado */}
        <p class="font-display font-semibold text-lg sm:text-xl text-white leading-snug mb-6">
          {pergunta.enunciado}
        </p>

        {/* Alternativas */}
        {pergunta.tipo === 'multipla_escolha' ? (
          <div class="space-y-2.5">
            {pergunta.alternativas.map((alt, i) => {
              const letra = String.fromCharCode(65 + i); // A, B, C, D
              const isEscolhida = resposta === letra;
              const isCorreta = pergunta.resposta_correta === letra;

              let classes =
                'w-full text-left p-4 rounded-lg border font-sans text-sm sm:text-base transition-colors flex items-center gap-3';

              if (!respondida) {
                classes += ' border-tutora-sutil bg-tutora-azul-escuro/40 hover:bg-tutora-azul-escuro/70 hover:border-white/30 cursor-pointer text-white/90';
              } else if (isCorreta) {
                classes += ' border-tutora-verde-agua bg-tutora-verde-agua/15 text-white';
              } else if (isEscolhida) {
                classes += ' border-tutora-vermelho bg-tutora-vermelho/15 text-white';
              } else {
                classes += ' border-tutora-sutil bg-tutora-azul-escuro/30 text-white/40';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={respondida}
                  onClick={() => responder(letra)}
                  class={classes}
                >
                  <span class={`flex-shrink-0 w-7 h-7 rounded-full font-display font-bold text-sm flex items-center justify-center
                    ${respondida && isCorreta ? 'bg-tutora-verde-agua text-tutora-azul-escuro' : ''}
                    ${respondida && isEscolhida && !isCorreta ? 'bg-tutora-vermelho text-white' : ''}
                    ${!respondida ? 'bg-white/10 text-white/80' : ''}
                    ${respondida && !isCorreta && !isEscolhida ? 'bg-white/5 text-white/40' : ''}
                  `}>
                    {letra}
                  </span>
                  <span class="flex-1">{alt}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div class="grid grid-cols-2 gap-3">
            {['verdadeiro', 'falso'].map((v) => {
              const isEscolhida = resposta === v;
              const isCorreta = pergunta.resposta_correta === v;
              let classes =
                'p-4 rounded-lg border font-display font-bold text-base sm:text-lg transition-colors capitalize';
              if (!respondida) {
                classes += ' border-tutora-sutil bg-tutora-azul-escuro/40 hover:bg-tutora-azul-escuro/70 hover:border-white/30 cursor-pointer text-white/90';
              } else if (isCorreta) {
                classes += ' border-tutora-verde-agua bg-tutora-verde-agua/15 text-white';
              } else if (isEscolhida) {
                classes += ' border-tutora-vermelho bg-tutora-vermelho/15 text-white';
              } else {
                classes += ' border-tutora-sutil bg-tutora-azul-escuro/30 text-white/40';
              }
              return (
                <button
                  key={v}
                  type="button"
                  disabled={respondida}
                  onClick={() => responder(v)}
                  class={classes}
                >
                  {v}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback / próxima */}
        {respondida && (
          <div class="mt-6 animate-fade-in">
            <div
              class={`p-4 rounded-lg border-l-4 ${
                acertou
                  ? 'bg-tutora-verde-agua/10 border-tutora-verde-agua'
                  : 'bg-tutora-vermelho/10 border-tutora-vermelho'
              }`}
            >
              <p class="font-display font-bold text-base text-white mb-1">
                {acertou ? 'Resposta correta ✓' : 'Resposta incorreta'}
              </p>
              {pergunta.explicacao && (
                <p class="font-sans text-sm text-white/85 leading-relaxed">
                  {pergunta.explicacao}
                </p>
              )}
            </div>
            <div class="mt-5 flex justify-end">
              <button type="button" onClick={proxima} class="btn-primary">
                {idx + 1 >= total ? 'Ver resultado' : 'Próxima pergunta →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

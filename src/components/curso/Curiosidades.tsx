/** @jsxImportSource preact */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Curiosidade } from '~/lib/parseQuiz';

interface Props {
  curiosidades: Curiosidade[];
}

const ROTACAO_MS = 7000;

const LABEL_CATEGORIA: Record<Curiosidade['categoria'], string> = {
  provocativa: 'Provocativa',
  historica: 'Histórica',
  cotidiano: 'Cotidiano',
  referencia: 'Referência',
};

/**
 * Curiosidades — caixa visual destacada, uma curiosidade por vez, rotação
 * automática a cada 7s, controles manuais avançar/voltar/pausar.
 */
export default function Curiosidades({ curiosidades }: Props) {
  if (!curiosidades || curiosidades.length === 0) return null;

  const [idx, setIdx] = useState(0);
  const [pausado, setPausado] = useState(false);
  const timerRef = useRef<number | null>(null);

  const total = curiosidades.length;
  const atual = curiosidades[idx];

  // Rotação automática
  useEffect(() => {
    if (pausado) return;
    timerRef.current = window.setTimeout(() => {
      setIdx((i) => (i + 1) % total);
    }, ROTACAO_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [idx, pausado, total]);

  const proxima = () => setIdx((i) => (i + 1) % total);
  const anterior = () => setIdx((i) => (i - 1 + total) % total);

  return (
    <section class="container-tutora py-10">
      <h2 class="font-display font-extrabold text-display-md mb-6 text-white">
        Curiosidades que despertam o interesse
      </h2>

      <div
        class="max-w-3xl bg-tutora-azul-secundario rounded-xl border p-7 sm:p-10 relative"
        style={{ borderColor: 'rgba(30, 202, 211, 0.3)' }}
        aria-live="polite"
      >
        <span class="inline-block bg-tutora-laranja/15 text-tutora-laranja text-xs font-display font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-5">
          {LABEL_CATEGORIA[atual.categoria]}
        </span>

        <p class="font-display font-semibold text-xl sm:text-2xl text-white leading-relaxed min-h-[3em]">
          {atual.texto}
        </p>

        {/* Controles */}
        <div class="mt-7 flex items-center justify-between gap-4">
          <span class="font-sans text-sm text-white/55 tabular-nums">
            {idx + 1} <span class="text-white/30">/</span> {total}
          </span>

          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={anterior}
              aria-label="Curiosidade anterior"
              class="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/85 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setPausado((p) => !p)}
              aria-label={pausado ? 'Retomar rotação' : 'Pausar rotação'}
              aria-pressed={pausado}
              class="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/85 transition-colors"
            >
              {pausado ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="6 4 20 12 6 20 6 4"></polygon>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={proxima}
              aria-label="Próxima curiosidade"
              class="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/85 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

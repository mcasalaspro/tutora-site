/** @jsxImportSource preact */
import { useState } from 'preact/hooks';

interface Aula {
  aula: string;
  descricao: string;
}

interface Props {
  curriculo: Aula[];
}

export default function Curriculo({ curriculo }: Props) {
  const [aberto, setAberto] = useState<Set<number>>(new Set());

  const todasAbertas = aberto.size === curriculo.length;

  const toggleUma = (i: number) => {
    const next = new Set(aberto);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setAberto(next);
  };

  const toggleTodas = () => {
    if (todasAbertas) setAberto(new Set());
    else setAberto(new Set(curriculo.map((_, i) => i)));
  };

  return (
    <section class="container-tutora py-10">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <h2 class="font-display font-extrabold text-display-md text-white">
          Currículo do curso
        </h2>
        <button
          type="button"
          onClick={toggleTodas}
          class="self-start sm:self-auto font-sans text-sm text-tutora-verde-agua hover:underline underline-offset-4 decoration-tutora-verde-agua/40 font-semibold"
        >
          {todasAbertas ? 'Recolher todas' : 'Expandir todas'}
        </button>
      </div>

      <ol class="space-y-2 max-w-4xl">
        {curriculo.map((item, i) => {
          const isAberto = aberto.has(i);
          return (
            <li
              key={i}
              class={`rounded-lg border transition-colors ${
                isAberto
                  ? 'border-tutora-verde-agua/40 bg-tutora-azul-secundario/60'
                  : 'border-tutora-sutil bg-tutora-azul-secundario/25 hover:bg-tutora-azul-secundario/40'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleUma(i)}
                aria-expanded={isAberto}
                aria-controls={`aula-desc-${i}`}
                class="w-full flex items-center gap-4 text-left p-4 sm:p-5"
              >
                <span class="flex-shrink-0 w-9 h-9 rounded-full bg-tutora-laranja/15 text-tutora-laranja font-display font-bold text-sm flex items-center justify-center">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span class="flex-1 font-display font-semibold text-base sm:text-lg text-white">
                  {item.aula}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class={`flex-shrink-0 transition-transform duration-200 text-white/60 ${
                    isAberto ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div
                id={`aula-desc-${i}`}
                hidden={!isAberto}
                class="px-5 pb-5 pl-[3.75rem] font-sans text-sm sm:text-base text-white/75 leading-relaxed"
              >
                {item.descricao}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

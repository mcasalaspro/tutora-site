/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from 'preact/hooks';

/**
 * Tipos serializáveis que vêm do servidor (não dá pra mandar CollectionEntry).
 */
export interface CursoLite {
  slug: string;
  titulo: string;
  professor: string; // slug
  professorNome: string;
  area: string;
  capa: string;
  sinopse_curta: string;
  duracao_aulas: number;
  duracao_horas: number;
  lancamento: boolean;
}

interface ProfessorLite {
  slug: string;
  nome: string;
}

interface Props {
  cursos: CursoLite[];
  areas: { nome: string; slug: string }[];
  professores: ProfessorLite[];
}

/**
 * BuscaFiltros — busca por texto + chips de área + dropdown de professor.
 * Aceita `?area=slug` no carregamento inicial para pré-selecionar uma área.
 */
export default function BuscaFiltros({ cursos, areas, professores }: Props) {
  const [busca, setBusca] = useState('');
  const [areasSel, setAreasSel] = useState<Set<string>>(new Set());
  const [professorSel, setProfessorSel] = useState<string>(''); // slug do professor

  // Inicialização: aceita ?area=slug da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const areaParam = params.get('area');
    if (!areaParam) return;
    const area = areas.find((a) => a.slug === areaParam);
    if (area) setAreasSel(new Set([area.nome]));
  }, [areas]);

  const filtrados = useMemo(() => {
    const buscaLower = busca.trim().toLowerCase();
    return cursos.filter((c) => {
      if (areasSel.size > 0 && !areasSel.has(c.area)) return false;
      if (professorSel && c.professor !== professorSel) return false;
      if (buscaLower) {
        const hay = (c.titulo + ' ' + c.sinopse_curta + ' ' + c.professorNome).toLowerCase();
        if (!hay.includes(buscaLower)) return false;
      }
      return true;
    });
  }, [cursos, busca, areasSel, professorSel]);

  const toggleArea = (nome: string) => {
    const next = new Set(areasSel);
    if (next.has(nome)) next.delete(nome);
    else next.add(nome);
    setAreasSel(next);
  };

  const limpar = () => {
    setBusca('');
    setAreasSel(new Set());
    setProfessorSel('');
  };

  const temFiltro = busca || areasSel.size > 0 || professorSel;

  return (
    <div>
      {/* Controles */}
      <div class="bg-tutora-azul-secundario/40 border border-tutora-sutil rounded-xl p-5 sm:p-6 mb-8 space-y-5">
        {/* Busca */}
        <div>
          <label class="block font-display font-semibold text-sm text-white/80 mb-2" for="busca-input">
            Buscar curso
          </label>
          <div class="relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              id="busca-input"
              type="search"
              value={busca}
              onInput={(e) => setBusca((e.target as HTMLInputElement).value)}
              placeholder="Título, professor, tema..."
              class="w-full bg-tutora-azul-escuro/60 border border-tutora-sutil rounded-md pl-10 pr-4 py-2.5 font-sans text-sm sm:text-base text-white placeholder:text-white/40 focus:outline-none focus:border-tutora-verde-agua transition-colors"
            />
          </div>
        </div>

        {/* Chips de áreas */}
        <div>
          <p class="font-display font-semibold text-sm text-white/80 mb-2">Áreas</p>
          <div class="flex flex-wrap gap-2">
            {areas.map((area) => {
              const ativo = areasSel.has(area.nome);
              return (
                <button
                  key={area.slug}
                  type="button"
                  onClick={() => toggleArea(area.nome)}
                  aria-pressed={ativo}
                  class={`px-3 py-1.5 rounded-full font-sans text-xs sm:text-sm font-medium transition-colors border ${
                    ativo
                      ? 'bg-tutora-laranja border-tutora-laranja text-white'
                      : 'bg-transparent border-tutora-sutil text-white/75 hover:border-white/40 hover:text-white'
                  }`}
                >
                  {area.nome}
                </button>
              );
            })}
          </div>
        </div>

        {/* Professor (dropdown nativo, simples e acessível) */}
        <div class="flex flex-col sm:flex-row sm:items-end gap-4">
          <div class="flex-1">
            <label class="block font-display font-semibold text-sm text-white/80 mb-2" for="prof-select">
              Professor
            </label>
            <select
              id="prof-select"
              value={professorSel}
              onChange={(e) => setProfessorSel((e.target as HTMLSelectElement).value)}
              class="w-full bg-tutora-azul-escuro/60 border border-tutora-sutil rounded-md px-4 py-2.5 font-sans text-sm sm:text-base text-white focus:outline-none focus:border-tutora-verde-agua transition-colors"
            >
              <option value="">Todos os professores</option>
              {professores.map((p) => (
                <option key={p.slug} value={p.slug}>{p.nome}</option>
              ))}
            </select>
          </div>
          {temFiltro && (
            <button
              type="button"
              onClick={limpar}
              class="font-sans text-sm text-tutora-verde-agua hover:underline self-start sm:self-end"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Contador */}
        <p class="font-sans text-sm text-white/55 pt-1 border-t border-white/10">
          <strong class="text-white">{filtrados.length}</strong>{' '}
          {filtrados.length === 1 ? 'curso' : 'cursos'} {temFiltro ? 'encontrado(s)' : 'no catálogo'}
        </p>
      </div>

      {/* Grid de resultados */}
      {filtrados.length === 0 ? (
        <div class="text-center py-20 bg-tutora-azul-secundario/20 rounded-xl border border-dashed border-tutora-sutil">
          <p class="font-display font-semibold text-lg text-white/80">Nenhum curso encontrado</p>
          <p class="mt-2 font-sans text-sm text-white/55">Tente outros termos ou limpe os filtros.</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtrados.map((c) => (
            <a
              key={c.slug}
              href={`/cursos/${c.slug}/`}
              class="card-tutora group flex flex-col h-full"
            >
              <div class="relative aspect-[4/3] overflow-hidden bg-tutora-azul-secundario">
                <img
                  src={c.capa}
                  alt={`Capa do curso ${c.titulo}`}
                  loading="lazy"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                {c.lancamento && (
                  <span class="absolute top-3 left-3 bg-tutora-vermelho text-white text-xs font-display font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Novo
                  </span>
                )}
                <span class="absolute top-3 right-3 bg-tutora-laranja text-white text-xs font-display font-semibold px-2.5 py-1 rounded-full">
                  {c.area}
                </span>
              </div>
              <div class="flex-1 flex flex-col p-5">
                <h3 class="font-display font-extrabold text-lg sm:text-xl leading-snug clamp-2 group-hover:text-tutora-verde-agua transition-colors text-white">
                  {c.titulo}
                </h3>
                <p class="mt-1.5 text-sm font-sans text-tutora-verde-agua">
                  {c.professorNome}
                </p>
                <p class="mt-3 text-sm font-sans text-white/70 clamp-3 leading-relaxed">
                  {c.sinopse_curta}
                </p>
                <div class="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 text-xs font-sans text-white/60">
                  <span>{c.duracao_aulas} aulas</span>
                  <span>{c.duracao_horas}h</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

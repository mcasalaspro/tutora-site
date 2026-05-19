/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';

interface Props {
  titulo: string;
  precoAvulso: string;
  linkAvulso: string;
  precoCombo: string;
  linkCombo: string;
  /**
   * ID do elemento "âncora" (a seção de oferta principal). Quando o usuário
   * rola até ele, a sticky bar some.
   */
  ancoraId?: string;
}

/**
 * StickyBar — fixa no rodapé, some quando o usuário chega à seção de oferta.
 */
export default function StickyBar({
  titulo,
  precoAvulso,
  linkAvulso,
  precoCombo,
  linkCombo,
  ancoraId = 'oferta',
}: Props) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Mostra após o usuário rolar um pouco (>= 350px)
    const onScroll = () => {
      const passouHero = window.scrollY > 350;
      // Quando a oferta entra na viewport, esconde
      const ancora = document.getElementById(ancoraId);
      if (!ancora) {
        setVisivel(passouHero);
        return;
      }
      const rect = ancora.getBoundingClientRect();
      const ofertaVisivel = rect.top < window.innerHeight && rect.bottom > 0;
      setVisivel(passouHero && !ofertaVisivel);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ancoraId]);

  return (
    <div
      class={`fixed bottom-0 left-0 right-0 z-30 bg-white shadow-sticky-up border-t border-tutora-cinza-claro transition-transform duration-300 ${
        visivel ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="region"
      aria-label="Comprar este curso"
      aria-hidden={!visivel}
    >
      <div class="container-tutora-wide py-3 flex items-center gap-3 sm:gap-5">
        <p class="hidden sm:block flex-1 font-display font-semibold text-base text-tutora-azul-escuro truncate min-w-0">
          {titulo}
        </p>
        <div class="flex-1 sm:flex-none flex gap-2 sm:gap-3 w-full sm:w-auto">
          <a
            href={linkAvulso}
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-5 py-2.5 rounded-md bg-tutora-verde-agua text-tutora-azul-escuro font-display font-bold text-sm hover:bg-tutora-verde-agua/90 transition-colors whitespace-nowrap"
          >
            Avulso {precoAvulso}
          </a>
          <a
            href={linkCombo}
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-5 py-2.5 rounded-md bg-tutora-laranja text-white font-display font-bold text-sm hover:bg-tutora-laranja/90 transition-colors whitespace-nowrap"
          >
            Combo {precoCombo}
          </a>
        </div>
      </div>
    </div>
  );
}

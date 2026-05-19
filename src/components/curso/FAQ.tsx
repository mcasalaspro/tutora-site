/** @jsxImportSource preact */
import { useState } from 'preact/hooks';

/**
 * FAQ accordion. As 4 perguntas e respostas vêm do prompt — texto exato.
 */

const FAQS = [
  {
    pergunta: 'Por quanto tempo eu posso acessar o conteúdo?',
    resposta:
      'A compra de cursos avulsos e assinatura oferecem acesso pelo prazo de 01 (um) ano a partir da data da compra.',
  },
  {
    pergunta: 'Se eu não gostar, posso desistir da compra?',
    resposta:
      'Se por acaso você não gostar de nosso conteúdo, pode desistir de sua assinatura e reaver seu investimento na íntegra no período de uma semana (7 dias úteis) após o início de seu plano escrevendo para suporte@tutoracursos.com.br.',
  },
  {
    pergunta: 'Onde posso assistir ao conteúdo?',
    resposta:
      'Os cursos da Tutora estão hospedados na Hotmart, que pode ser acessada via aplicativo em celular e tablets (disponível na App Store e Google Play), no navegador de seu computador, e também via Smart TVs – para verificar se o seu dispositivo possui compatibilidade com o aplicativo da plataforma, e veja as alternativas de assistir na TV utilizando aplicativos portáteis.',
  },
  {
    pergunta: 'Quais são as opções de pagamento deste produto?',
    resposta:
      'Há opção de pagamento via PIX, boleto bancário, cartão de crédito (podendo ser dividido em até dois cartões) e PayPal.',
  },
];

export default function FAQ() {
  const [aberto, setAberto] = useState<number | null>(0);

  return (
    <section class="container-tutora py-10">
      <h2 class="font-display font-extrabold text-display-md mb-6 text-white">Perguntas frequentes</h2>
      <div class="max-w-3xl space-y-3">
        {FAQS.map((faq, i) => {
          const isAberto = aberto === i;
          return (
            <div
              key={i}
              class={`rounded-lg border transition-colors ${
                isAberto ? 'border-tutora-verde-agua/40 bg-tutora-azul-secundario/60' : 'border-tutora-sutil bg-tutora-azul-secundario/30'
              }`}
            >
              <button
                type="button"
                onClick={() => setAberto(isAberto ? null : i)}
                aria-expanded={isAberto}
                aria-controls={`faq-resposta-${i}`}
                class="w-full flex items-center justify-between gap-4 text-left p-5 font-display font-semibold text-base sm:text-lg hover:text-tutora-verde-agua transition-colors"
              >
                <span>{faq.pergunta}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class={`flex-shrink-0 transition-transform duration-200 ${isAberto ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div
                id={`faq-resposta-${i}`}
                hidden={!isAberto}
                class="px-5 pb-5 -mt-1 font-sans text-sm sm:text-base text-white/80 leading-relaxed"
              >
                {faq.resposta}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

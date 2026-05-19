/**
 * Configuração centralizada do site Tutora Cursos.
 *
 * Tudo que pode mudar (e-mails, links de redes sociais, link da assinatura,
 * URL canônica) fica aqui. Os componentes consomem deste arquivo.
 */

export const SITE_NAME = 'Tutora Cursos';
export const SITE_DESCRIPTION =
  'Cursos de formação humana com professores de referência. Filosofia, literatura, família, educação dos filhos, história e direito.';
export const SITE_URL = 'https://www.tutoracursos.com.br';

export const CONTATO = {
  email: 'contato@tutoracursos.com.br',
  emailSuporte: 'suporte@tutoracursos.com.br',
};

export const REDES_SOCIAIS = {
  instagram: 'https://instagram.com/tutoracursos',
  youtube: 'https://youtube.com/@tutoracursos',
  facebook: 'https://facebook.com/tutoracursos',
};

export const LINKS = {
  // Link da assinatura na Hotmart (usado no CTA principal da home).
  // Substituir pelo link real ao colocar em produção.
  assinaturaHotmart: 'https://hotmart.com/tutora-assinatura',
  politicaPrivacidade: '/politica-de-privacidade',
  termos: '/termos-de-uso',
  mapaSite: '/sitemap-index.xml',
  codigoEtica: '/codigo-de-etica',
};

/**
 * Áreas fixas (não acrescentar fora desta lista — também replicado no schema Zod).
 * O `slug` é usado em filtros de URL (`/cursos?area=filosofia-formacao-juizo`).
 */
export const AREAS = [
  { nome: 'Educação dos Filhos', slug: 'educacao-dos-filhos' },
  { nome: 'Família e Casamento', slug: 'familia-e-casamento' },
  { nome: 'Filosofia e Formação do Juízo', slug: 'filosofia-formacao-juizo' },
  { nome: 'Literatura e Cultura', slug: 'literatura-cultura' },
  { nome: 'História e Política', slug: 'historia-politica' },
  { nome: 'Direito e Vida Pública', slug: 'direito-vida-publica' },
] as const;

export type AreaNome = (typeof AREAS)[number]['nome'];

/** Helpers de lookup. */
export function slugDaArea(nome: string): string | undefined {
  return AREAS.find((a) => a.nome === nome)?.slug;
}

export function nomeDaArea(slug: string): string | undefined {
  return AREAS.find((a) => a.slug === slug)?.nome;
}

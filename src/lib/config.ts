/**
 * Lê conteudo/configuracoes.yaml (textos gerais, contato, áreas, trilhas, oferta, leads).
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export interface Area {
  nome: string;
  slug: string;
  descricao?: string;
}

export interface Trilha {
  titulo: string;
  descricao?: string;
  cursos: string[];
}

export interface Config {
  nome: string;
  slogan: string;
  descricao: string;
  contato: { email?: string; instagram?: string; youtube?: string; facebook?: string };
  home: { titulo_regular: string; titulo_destaque: string; subtitulo: string };
  areas: Area[];
  trilhas: Trilha[];
  oferta: {
    avulso_titulo: string;
    avulso_itens: string[];
    combo_itens: string[];
    acesso_titulo: string;
    acesso_itens: string[];
    texto_sem_link: string;
    texto_espera: string;
    texto_aviso: string;
    link_aviso: string;
  };
  /** Planilha "Meus leads": para onde o "Descubra seu curso" manda as respostas (vazio = não pede contato nem envia nada) */
  leads: {
    link_planilha: string;
    titulo: string;
    texto: string;
    aviso: string;
  };
}

let cache: Config | null = null;

export function config(): Config {
  if (cache) return cache;
  const arquivo = path.join(process.cwd(), 'conteudo', 'configuracoes.yaml');
  const bruto = parse(fs.readFileSync(arquivo, 'utf8')) ?? {};
  cache = {
    nome: bruto.nome ?? 'Tutora',
    slogan: bruto.slogan ?? 'cursos de formação humana',
    descricao: bruto.descricao ?? '',
    contato: bruto.contato ?? {},
    home: {
      titulo_regular: bruto.home?.titulo_regular ?? 'Cursos de',
      titulo_destaque: bruto.home?.titulo_destaque ?? 'formação humana.',
      subtitulo: bruto.home?.subtitulo ?? '',
    },
    areas: (bruto.areas ?? []) as Area[],
    trilhas: (bruto.trilhas ?? []) as Trilha[],
    oferta: {
      avulso_titulo: bruto.oferta?.avulso_titulo ?? 'Curso avulso',
      avulso_itens: bruto.oferta?.avulso_itens ?? [],
      combo_itens: bruto.oferta?.combo_itens ?? [],
      // (os nomes antigos "assinatura_*" continuam valendo)
      acesso_titulo: bruto.oferta?.acesso_titulo ?? bruto.oferta?.assinatura_titulo ?? 'Acesso Completo',
      acesso_itens: bruto.oferta?.acesso_itens ?? bruto.oferta?.assinatura_itens ?? [],
      texto_sem_link: bruto.oferta?.texto_sem_link ?? 'Inscrições em breve',
      texto_espera: bruto.oferta?.texto_espera ?? 'As inscrições abrem em breve.',
      texto_aviso: bruto.oferta?.texto_aviso ?? 'Avise-me quando abrir',
      link_aviso: bruto.oferta?.link_aviso ?? '',
    },
    leads: {
      link_planilha: String(bruto.leads?.link_planilha ?? '').trim(),
      titulo: bruto.leads?.titulo ?? 'Quer receber novidades da Tutora?',
      texto:
        bruto.leads?.texto ??
        'Opcional: deixe seu nome e e-mail para receber sugestões de cursos e novidades. Dá para cancelar quando quiser.',
      aviso: bruto.leads?.aviso ?? 'Usamos seus dados só para falar com você sobre os cursos da Tutora.',
    },
  };
  return cache;
}

export function areaPorNome(nome: string): Area | undefined {
  return config().areas.find((a) => a.nome === nome);
}

/**
 * Link do botão "Avise-me quando abrir", usado enquanto não há link de compra:
 * o `link_aviso` das configurações (WhatsApp, formulário...) ou, na falta dele, um e-mail para o contato.
 */
export function linkAviso(assunto: string): string {
  const cfg = config();
  if (cfg.oferta.link_aviso) return cfg.oferta.link_aviso;
  if (cfg.contato.email) return `mailto:${cfg.contato.email}?subject=${encodeURIComponent(assunto)}`;
  return '';
}

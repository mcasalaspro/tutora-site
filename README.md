# Tutora Cursos — Site

Site estático da **Tutora Cursos**: catálogo de cerca de 30 cursos de formação
humana de diversos professores. O site não processa pagamentos — apresenta o
conteúdo e direciona o visitante para a Hotmart.

Construído em **Astro** com **Tailwind CSS** e **Preact** (Islands).

---

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:4321
```

Build de produção:

```bash
npm run build
npm run preview
```

---

## Estrutura

```
src/
  config/site.ts             # tudo que pode mudar (e-mails, redes, link assinatura, áreas)
  content/
    config.ts                # schemas Zod das 3 collections
    cursos/*.md              # 1 arquivo por curso (gerado pelo prompt 02)
    professores/*.md         # 1 arquivo por professor (preenchido manualmente)
    quizzes/*.md             # 1 arquivo por quiz (gerado pelo prompt 03), nome = slug do curso
  components/                # Astro estático + Islands Preact
  layouts/Layout.astro       # shell de todas as páginas
  lib/
    parseQuiz.ts             # parser dos arquivos de quiz
    relacionados.ts          # helper para cursos relacionados
  pages/                     # rotas
  styles/global.css          # Tailwind + tokens + utilitários
public/
  images/
    brand/                   # logos
    cursos/                  # capas dos cursos (.webp)
    professores/             # fotos dos professores (.webp)
```

---

## Adicionar um curso novo

1. Criar `src/content/cursos/[slug].md` (use os exemplos como modelo).
2. (Opcional, recomendado) Criar `src/content/quizzes/[slug].md` com o **mesmo slug**.
3. Colocar a imagem em `public/images/cursos/[slug].webp` (proporção 4:3, idealmente 1200×900).
4. Rodar `npm run dev` — a rota `/cursos/[slug]` aparece automaticamente.

O schema em `src/content/config.ts` valida o frontmatter na hora do build — se algo estiver fora do contrato, o build falha com mensagem útil.

### Gerar os arquivos via prompts (workflow recomendado)

O sistema foi pensado para que os arquivos `.md` de curso e quiz sejam gerados a
partir de transcrições, usando dois prompts auxiliares (prompts 02 e 03), que
não fazem parte deste repositório. O fluxo previsto é:

1. Colher transcrições de aulas do curso.
2. Rodar o **prompt 02** (extração de metadados) com a transcrição — saída: o
   conteúdo de `src/content/cursos/[slug].md`.
3. Rodar o **prompt 03** (geração de quiz e curiosidades) com a mesma
   transcrição — saída: o conteúdo de `src/content/quizzes/[slug].md`.
4. Salvar os arquivos nas pastas correspondentes.

Os schemas em `src/content/config.ts` e a estrutura semântica do quiz (parser em
`src/lib/parseQuiz.ts`) são contratos rígidos — qualquer mudança aqui quebra os
prompts. O parser de quiz é tolerante: se um arquivo de quiz não existir para um
curso, o build não quebra; a página apenas omite a seção de quiz/curiosidades.

---

## Adicionar um professor novo

1. Criar `src/content/professores/[slug].md` (use os exemplos como modelo).
2. Colocar a foto em `public/images/professores/[slug].webp` (idealmente 600×600
   ou maior, será cortada em círculo na UI).
3. O `slug` do professor é o que vai no campo `professor:` de cada curso desse
   professor.

---

## Trocar links, e-mails, redes sociais, áreas

Tudo está em **`src/config/site.ts`**:

- `SITE_URL` — URL canônica usada em sitemap e tags OG.
- `CONTATO.email`, `CONTATO.emailSuporte` — exibidos em rodapé e selo de garantia.
- `REDES_SOCIAIS.instagram` / `youtube` / `facebook` — ícones do rodapé.
- `LINKS.assinaturaHotmart` — botão "Assinar agora" da home e header.
- `AREAS` — lista das 6 áreas. **Sincronizada com o enum em
  `src/content/config.ts`** (alterar nas duas).

Links da Hotmart dos cursos avulsos e combos ficam no frontmatter de cada curso
(`oferta_avulsa.link_hotmart`, `oferta_combo.link_hotmart`).

---

## Trocar o vídeo de preview do YouTube

No frontmatter do curso, campo `preview_youtube_embed`. Use a URL de embed (não
a do navegador comum). Exemplo:

```yaml
preview_youtube_embed: "https://www.youtube.com/embed/VIDEO_ID"
```

---

## Quiz: como funciona o arquivo

Veja o exemplo em `src/content/quizzes/filosofia-para-a-vida-cotidiana.md`. O
parser está em `src/lib/parseQuiz.ts` e há documentação completa do formato no
topo desse arquivo.

Cada pergunta vira um item interativo na página do curso: o aluno responde,
recebe feedback imediato com explicação, e ao fim de todas vê a pontuação e um
CTA para a Hotmart.

---

## Deploy

Build estático puro. Funciona em qualquer host de site estático.

### Netlify

1. Conecte o repositório.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Pronto.

### Vercel

1. Importe o repositório.
2. Framework: **Astro** (detecção automática).
3. Pronto.

### Cloudflare Pages

1. Conecte o repositório.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Pronto.

---

## Decisões e notas

- **Sem CMS, sem banco.** Todo conteúdo vem dos `.md` em `src/content/`.
- **Islands Preact** apenas onde há interatividade real (FAQ, currículo,
  quiz, curiosidades, sticky bar, busca/filtros).
- **Tipografia:** Baloo 2 (display) + Montserrat (corpo), via Google Fonts com
  `display=swap`.
- **Paleta oficial** declarada em `tailwind.config.cjs` em
  `theme.extend.colors.tutora`.
- **Imagens:** PNG/WEBP em `public/images/` (não otimização em build para
  manter simples — basta jogar a imagem do tamanho certo).
- **Logo:** versão branca oficial em `public/images/brand/tutora-logo-branco.png`,
  aplicada sobre o fundo azul-escuro do header. Área de proteção respeitada via
  padding generoso. Manter o asset alternativo (azul-escuro) para fundos claros
  ao colocar em produção.
- **Sticky bar do curso** some quando o usuário rola até a seção `#oferta`,
  controlada por scroll handler (mais leve e confiável que IntersectionObserver
  em alguns Safari).
- **404** customizada (`/404.astro`) — a maioria dos hosts estáticos serve
  automaticamente.

---

## Convenções de slug

- `kebab-case` em tudo: `filosofia-para-a-vida-cotidiana`, `joao-batista-de-oliveira`.
- Sem acentos. Sem espaços. Sem maiúsculas.
- O slug aparece **três vezes** e precisa ser idêntico:
  1. Nome do arquivo (`xxx.md`)
  2. Campo `slug:` no frontmatter
  3. Nome da imagem de capa em `public/images/cursos/xxx.webp`

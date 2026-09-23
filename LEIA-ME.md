# Site do catálogo da Tutora

Site estático feito em **Astro**, guardado no **GitHub** e publicado de graça no **GitHub Pages**.
Todo o conteúdo fica na pasta `conteudo/`, em arquivos que você edita no Bloco de Notas ou no VS Code.
Três arquivos `.bat` fazem o resto.

```
tutora-site/
├── 1-CONFIGURAR-PRIMEIRA-VEZ.bat   liga esta pasta ao GitHub (só uma vez)
├── 2-PUBLICAR.bat                  envia as alterações; o site se atualiza em 1–2 min
├── 3-VER-NO-MEU-PC.bat             abre o site no seu computador antes de publicar (opcional)
├── conteudo/                       ← TUDO o que você edita está aqui
│   ├── cursos/<slug>.md            1 arquivo por curso (vira a página /cursos/<slug>/)
│   ├── professores/<slug>.md       1 arquivo por professor
│   ├── quizzes/<slug>.md           quiz e curiosidades de cada curso (mesmo slug do curso)
│   ├── precos.csv                  preço, parcelamento e link da Hotmart de cada curso + assinatura
│   ├── configuracoes.yaml          contatos, redes, áreas, trilhas, textos da home
│   └── imagens/
│       ├── cursos/                 capas dos cursos (2 formatos por curso)
│       ├── professores/            fotos dos professores (2 formatos)
│       └── _modelos/               gabaritos com as áreas de segurança
├── _interno/                       anotações da equipe; NÃO vai para o GitHub (o repositório é público)
│   └── REVISAO-DO-CONTEUDO.md      pontos para conferir: professores, aulas faltando, grafia de nomes
└── src/, public/, scripts/         o "motor" do site (não precisa mexer)
```

---

## 1. Primeira vez: colocar o site no ar

O repositório é o **<https://github.com/mcasalaspro/tutora-site>**. Ele já tem um site antigo, e o `.bat`
abaixo substitui tudo pelo site novo, guardando antes uma cópia do antigo.

1. Instale o **Git para Windows**: <https://git-scm.com/download/win> (opções padrão).
2. Dê dois cliques em **`1-CONFIGURAR-PRIMEIRA-VEZ.bat`** e siga as mensagens:
   - o endereço do repositório já vem preenchido: aperte **Enter**;
   - se o GitHub pedir login, entre com a conta dona do repositório;
   - como o repositório já tem outro site, o `.bat` avisa e pede que você digite **SIM**. Ele guarda o conteúdo
     atual num ramo chamado `site-antigo-DATA` (no próprio GitHub) e põe o site novo no lugar;
   - ele abre **Settings → Pages**: em **Build and deployment → Source**, escolha **GitHub Actions** (se estiver
     "Deploy from a branch", troque). Se o site antigo tinha domínio próprio, deixe-o em **Custom domain**.
     Volte à janela do `.bat` e aperte uma tecla;
   - se o ramo principal do repositório não for `main`, ele pede para trocar em **Settings → General → Default
     branch** e reenvia sozinho.
3. Pronto. A aba **Actions** do repositório mostra a publicação; em 1–2 minutos o site novo está no ar, no endereço
   que aparece em Settings → Pages (algo como `https://mcasalaspro.github.io/tutora-site/`, ou o domínio próprio).

**Se algo der errado**

- *X vermelho com "Branch main is not allowed to deploy to github-pages"*: em **Settings → Environments →
  github-pages → Deployment branches**, permita o ramo `main`. Depois, em **Actions → Publicar site**, clique em
  **Run workflow**.
- *O `.bat` diz que o GitHub recusou o envio*: confira se o login foi feito com a conta dona do repositório e se o
  ramo `main` não tem uma regra que bloqueia "force push" (**Settings → Branches**).
- *Repositório privado*: no plano gratuito do GitHub, o Pages só publica repositórios públicos
  (**Settings → General → Danger Zone → Change visibility**).
- *Precisa de algo do site antigo*: está no ramo `site-antigo-DATA` (menu de ramos, na página do repositório).
  Quando não precisar mais, apague esse ramo em **Branches**.

### Domínio próprio (opcional)

Em **Settings → Pages → Custom domain**, digite o domínio (ex.: `cursos.tutoracursos.com.br`) e crie no seu
provedor de DNS um registro **CNAME** apontando para `mcasalaspro.github.io`. O site se ajusta sozinho ao novo
endereço na próxima publicação.

## 2. No dia a dia: editar e publicar

1. Edite os arquivos em `conteudo/` (veja abaixo o que vai em cada um).
2. (Opcional) Dê dois cliques em **`3-VER-NO-MEU-PC.bat`** para ver o resultado antes. Precisa do
   **Node.js LTS** (<https://nodejs.org/pt>) instalado uma vez.
3. Dê dois cliques em **`2-PUBLICAR.bat`**. Ele envia tudo ao GitHub e abre a página que mostra a publicação.
   - Bolinha **verde**: publicado.
   - **X vermelho**: abra o item e leia a etapa **"Conferir o conteúdo e montar o site"**. O verificador diz,
     em português, qual arquivo e qual linha corrigir. O site anterior continua no ar até você corrigir.

---

## 3. O que vai em cada arquivo

### Cursos: `conteudo/cursos/<slug>.md`

O **nome do arquivo é o endereço** da página: `dante-e-a-literatura.md` → `/cursos/dante-e-a-literatura/`.
Use só letras minúsculas, números e hífens. Todos os cursos têm a mesma estrutura:

| Campo | O que é |
|---|---|
| `titulo` | Nome do curso. |
| `professor` | Slug do professor (nome do arquivo em `conteudo/professores/`, sem `.md`). Vazio esconde o professor. |
| `professores_convidados` | Lista de outros professores que dão o curso junto. |
| `area` | Uma das áreas de `configuracoes.yaml`, escrita igual. |
| `frase` | Uma linha que aparece embaixo do título. |
| `sinopse_curta` | Até 160 caracteres. Vai nos cards e no Google. |
| `sinopse_longa` | Parágrafos da seção "Do que trata o curso" (linha em branco separa parágrafos). |
| `formato` | Uma linha: aulas, formato, duração. |
| `para_quem_e`, `o_que_vai_aprender` | Listas (cada item começa com `- `). |
| `importancia` | Texto do bloco laranja "Por que estudar isso hoje". |
| `curriculo` | As aulas, na ordem em que aparecem. Cada uma tem `aula` ("Aula 3 — Título"), `descricao`, `comentario`, `duracao_min`, `topicos`, `autores` e, quando a aula tem várias partes, `partes`. `tipo: apresentacao` marca uma apresentação curta (não conta como aula); `modulo` agrupa as aulas sob um título ("Módulo 1 · Tema"). |
| `cursos_relacionados` | Slugs de cursos para a fileira "Cursos relacionados". O site completa com a mesma área. |
| `destaque_home` | `true` põe o curso no carrossel do topo da home. |
| `lancamento` | `true` mostra o selo "Novo". |
| `preview_youtube_embed` | Link do trailer no YouTube (opcional). Aparece o botão "Assistir trailer". |

Abaixo da segunda linha `---` fica o **resumo detalhado** (texto livre), que aparece na página
"Resumo completo do curso" (`/cursos/<slug>/resumo/`, pronta para imprimir ou salvar em PDF).

**Curso novo:** copie um `.md` existente, renomeie e troque o conteúdo. Crie também uma linha no `precos.csv`
e, se quiser, o quiz em `conteudo/quizzes/` com o mesmo nome de arquivo.

### Preços: `conteudo/precos.csv`

Abra no Excel ou no Google Planilhas e salve de novo como **CSV** (separado por `;`). Colunas:

| Coluna | Exemplo | Observação |
|---|---|---|
| `slug` | `roma` | Igual ao nome do arquivo do curso. |
| `titulo` | `Roma` | Só para você se orientar. O site usa o título do `.md`. |
| `preco` | `297,00` ou `R$ 297,00` | Vazio mostra "Em breve". |
| `preco_parcelado` | `ou 12x de R$ 29,70` | Texto livre. |
| `link_hotmart` | `https://pay.hotmart.com/...` | Enquanto for `https://hotmart.com/em-breve`, a página mostra "Inscrições em breve" e o botão "Avise-me quando abrir". |
| `status` | `ativo` | `ativo`, `em-breve` ou `oculto` (**oculto tira o curso do site** sem apagar o arquivo). |

A linha com slug **`assinatura`** é o plano de acesso a todos os cursos (botão "Assinar" do topo, bloco laranja
da home e cartão de assinatura em cada curso).

### Professores: `conteudo/professores/<slug>.md`

`nome`, `mini_bio` (1 ou 2 frases, aparece no bloco "Quem dá o curso" e no topo da página do professor) e,
abaixo das linhas `---`, a biografia completa. `formacao` é uma lista opcional. Enquanto um campo está vazio,
o site simplesmente não mostra aquele trecho (nada de "em breve").

As biografias atuais são **provisórias**: foram escritas só com o que cada professor diz de si nas aulas e com os
cursos que ele dá. Cada arquivo traz um aviso no topo. Quando chegarem as oficiais, substitua o texto, apague as
linhas de aviso e publique.

Um professor ganha página própria quando tem pelo menos um curso ou uma biografia. Sem nenhum dos dois,
ele aparece em "Também na Tutora" (página Professores) só com a foto, sem link.

### Quiz: `conteudo/quizzes/<slug>.md`

Perguntas de múltipla escolha ou verdadeiro/falso e curiosidades. A página sorteia 5 perguntas por rodada,
misturando os níveis fácil, média e difícil, e embaralha as alternativas (a posição da resposta certa no arquivo
não importa). Mantenha o formato dos arquivos existentes
(`### N.`, `- tipo:`, `- alternativas:`, `- resposta_correta:`, `- explicacao:`).

### Configurações: `conteudo/configuracoes.yaml`

E-mail e redes do rodapé, textos da home, **áreas** do catálogo e **trilhas** (sequências de cursos que
aparecem como fileiras numeradas na home; nas páginas de área, os cursos da trilha seguem essa ordem).

No bloco `oferta` ficam os textos dos cartões de compra e o que aparece enquanto não há link de compra:
`texto_sem_link` ("Inscrições em breve"), `texto_espera` (a frase explicativa), `texto_aviso` (o botão
"Avise-me quando abrir") e `link_aviso`: um link de WhatsApp ou de formulário para esse botão. Se `link_aviso`
ficar vazio, o botão abre um e-mail para o endereço de `contato`. **Confira o e-mail e as redes:** os que estão
lá são provisórios.

---

## 4. Imagens (padrão streaming)

Cada curso usa **duas imagens**. Enquanto elas não existem, o site mostra uma capa provisória tipográfica
(fundo azul da marca, título e área do curso) e, no topo da página, a foto do professor com filtro azul.

| Arquivo | Tamanho | Onde aparece |
|---|---|---|
| `conteudo/imagens/cursos/<slug>-horizontal.jpg` | **1920 × 1080** (16:9) | Topo da página do curso e carrossel da home no computador e no tablet, prévia no WhatsApp/Facebook |
| `conteudo/imagens/cursos/<slug>-poster.jpg` | **1000 × 1500** (2:3) | Fileiras, catálogo, páginas de área e de professor, e o topo do curso e o carrossel da home no celular |
| `conteudo/imagens/professores/<slug>.jpg` | 1080 × 1080 | Card do professor (a foto já traz o nome gravado) |
| `conteudo/imagens/professores/<slug>-cena.jpg` | 940 × 788 | Topo da página do professor e bloco "Quem dá o curso" |

- Mande sempre as duas imagens do curso. No celular em pé, o topo usa o pôster, porque a horizontal
  cortada numa tela estreita mostraria só a metade escura da ilustração. Sem a horizontal, o topo
  continua com a foto do professor.
- JPG, PNG ou WebP (o site gera sozinho versões menores e mais leves). Os PNGs que saem dos geradores
  de imagem costumam ter 2 a 3 MB: funcionam, mas pesam no repositório; em JPG ficam com ~200 KB.
- **Não escreva o título na imagem**: o site escreve por cima. Veja os gabaritos em
  `conteudo/imagens/_modelos/`, que mostram onde fica o texto e onde pôr o assunto principal.
- O nome do arquivo precisa seguir o padrão exato (`<slug>-horizontal.jpg`, `<slug>-poster.jpg`).

---

## 5. Cores e letras (Brandbook Tutora)

- Primárias: azul-escuro `#303454`, cinza `#E5E1E6`, laranja `#FF6C37`, verde-água `#1ECAD3`.
- Secundárias: vermelho `#CE0E2D` (selo "Novo"), azul mais escuro `#171726` (fundos profundos).
- Títulos em **Baloo 2** (Regular e ExtraBold), textos em **Montserrat** (Regular a Bold), hospedadas no próprio site.
- Logo em branco sobre fundos escuros e em azul-escuro sobre fundos claros, como pede o brandbook.
- Sem o padrão de vitrais/blocos.

As cores ficam em `src/styles/global.css` (bloco `:root`, no começo do arquivo).

---

## 6. Para quem mexe no código

```bash
npm install          # uma vez
npm run dev          # http://localhost:4321
npm run verificar    # confere a pasta conteudo/
npm run build        # gera a pasta dist/ (o verificador roda antes)
```

Astro 7 · coleções de conteúdo com o loader `glob` apontando para `conteudo/` · imagens otimizadas por `astro:assets`
(localizadas por `import.meta.glob`) · JavaScript mínimo, sem framework · publicação por
`.github/workflows/publicar.yml` (GitHub Pages; `SITE_URL` e `BASE_PATH` vêm do `actions/configure-pages`).

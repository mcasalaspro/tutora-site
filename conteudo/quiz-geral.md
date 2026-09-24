---
# ─────────────────────────────────────────────────────────────────────────────
#  QUIZ GERAL (página /quiz/): "Teste seu conhecimento"
#  As perguntas vêm dos quizzes de cada curso (conteudo/quizzes/<slug>.md).
#  Aqui você só organiza os TEMAS: nome, descrição e quais cursos entram em cada um.
#  Um curso pode estar em vários temas. O tema com  cursos: todos  usa o catálogo inteiro.
# ─────────────────────────────────────────────────────────────────────────────
titulo: "Teste seu conhecimento"
subtitulo: "Escolha um tema, decida quantas perguntas quer responder e veja, a cada pergunta, qual curso trata do assunto."

# Quantas perguntas a pessoa pode escolher por rodada.
quantidades: [5, 10, 20]

temas:
  - nome: "Tudo misturado"
    slug: tudo
    descricao: "Perguntas de todos os cursos do catálogo."
    cursos: todos

  - nome: "Grécia e Roma"
    slug: grecia-e-roma
    descricao: "Mitos, epopeias, tragédia, filósofos gregos e o direito romano."
    cursos:
      - gregos-fundamento-do-ocidente
      - roma
      - grandes-epopeias-da-antiguidade
      - teatro-grego-tragedia
      - tecnica-ciencia-religiao
      - historia-direito-romano

  - nome: "Idade Média"
    slug: idade-media
    descricao: "Dos francos a Dante: Bizâncio, feudos, catedrais e os Padres da Igreja."
    cursos:
      - os-francos-e-o-nascimento-da-cristandade
      - imperio-bizantino
      - alta-idade-media
      - baixa-idade-media
      - patristica-agostinho-dionisio
      - dante-e-a-literatura

  - nome: "Do Renascimento a Napoleão"
    slug: renascimento-e-revolucoes
    descricao: "Humanismo, navegações, mercantilismo, revoluções e o Império napoleônico."
    cursos:
      - renascimento
      - mercantilismo
      - revolucoes-burguesas
      - revolucao-francesa
      - era-napoleonica

  - nome: "Séculos XIX e XX"
    slug: seculos-xix-e-xx
    descricao: "Nações, impérios, a Primeira Guerra e a Revolução Russa."
    cursos:
      - o-grande-seculo-xix
      - inicio-seculo-xx-guerra-e-revolucao

  - nome: "Brasil"
    slug: brasil
    descricao: "A formação do país nas cartas e mapas e as obras de língua portuguesa."
    cursos:
      - brasil-mapas-cartas
      - literatura-brasileira-e-de-lingua-portuguesa

  - nome: "Filosofia"
    slug: filosofia
    descricao: "O ato de filosofar, as virtudes, a ética e os grandes pensadores."
    cursos:
      - o-que-e-filosofar
      - virtudes-fundamentais
      - historia-do-pensamento-etico
      - introducao-a-aristoteles
      - tecnica-ciencia-religiao
      - patristica-agostinho-dionisio

  - nome: "Literatura"
    slug: literatura
    descricao: "Epopeias, tragédias, Dante, os clássicos em português e as histórias de Natal."
    cursos:
      - grandes-epopeias-da-antiguidade
      - teatro-grego-tragedia
      - dante-e-a-literatura
      - literatura-brasileira-e-de-lingua-portuguesa
      - musicas-contos-e-lendas-de-natal

  - nome: "Direito"
    slug: direito
    descricao: "O que é o direito, suas raízes romanas, a justiça e o ensino domiciliar."
    cursos:
      - brevissima-introducao-ao-direito
      - filosofia-do-direito
      - historia-direito-romano
      - homeschooling-aspectos-juridicos

  - nome: "Educação e família"
    slug: educacao-e-familia
    descricao: "Educar os filhos, a escola, o imaginário infantil e os fins da educação."
    cursos:
      - harmonia-familiar
      - educacao-personalizada
      - imaginario-crianca-moderna
      - filosofia-da-educacao
      - o-fim-da-educacao
      - homeschooling-aspectos-juridicos

  - nome: "Estudar e pensar a história"
    slug: estudar-historia
    descricao: "O método do historiador e o modo como cada época via o mundo."
    cursos:
      - como-estudar-historia
      - historia-das-mentalidades

  - nome: "Oratória"
    slug: oratoria
    descricao: "Falar em público com ordem, clareza e naturalidade."
    cursos:
      - arte-de-falar-bem
---

Como funciona:

- Cada rodada sorteia perguntas dos cursos do tema, alternando os cursos e os níveis (fácil, média, difícil).
- Ao lado de cada pergunta aparece o cartão do curso de onde ela veio, com o link para a página do curso.
- No fim, a pessoa vê o placar por área do catálogo e duas sugestões: um curso da área em que foi melhor e um
  curso para aprofundar o tema em que mais errou.

Para mudar os temas, edite a lista acima: o nome aparece nos botões, a descrição embaixo dele, e os cursos são os
nomes dos arquivos em conteudo/cursos/ (sem .md). O slug de cada tema precisa ser único, sem acentos e sem espaços.

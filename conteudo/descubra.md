---
# ─────────────────────────────────────────────────────────────────────────────
#  DESCUBRA SEU CURSO (página /descubra/)
#  Perguntas, respostas, pesos e trilhas do questionário que sugere cursos.
#  Como funciona está explicado no fim deste arquivo, abaixo da segunda linha ---.
# ─────────────────────────────────────────────────────────────────────────────
titulo: "Descubra o curso certo para você"
subtitulo: "Responda a algumas perguntas rápidas. No fim, sugerimos os cursos que mais combinam com você e uma trilha para seguir."

# ── PERGUNTAS ────────────────────────────────────────────────────────────────
# tipo: uma (a pessoa escolhe uma resposta) | varias (escolhe várias; "maximo" limita quantas)
# pontos: as etiquetas que a resposta soma ao perfil da pessoa, com o peso (1 = pouco, 3 = muito)
# marca: um nome qualquer; outra pergunta pode usar  mostrar_se: <marca>  para só aparecer depois dela
# exclusiva: true  faz a resposta desmarcar as outras (ex.: "Não tenho filhos")
perguntas:
  - id: objetivo
    pergunta: "O que você busca agora?"
    ajuda: "Escolha até duas opções."
    tipo: varias
    maximo: 2
    opcoes:
      - texto: "Entender a história e o mundo em que vivo"
        pontos: { historia: 3 }
      - texto: "Pensar melhor e refletir sobre as grandes perguntas"
        pontos: { filosofia: 3, etica: 1 }
      - texto: "Ler e entender as grandes obras da literatura"
        pontos: { literatura: 3, poesia: 1 }
      - texto: "Educar melhor meus filhos"
        pontos: { filhos: 3 }
      - texto: "Entender o direito e a vida em sociedade"
        pontos: { direito: 3 }
      - texto: "Me formar como professor ou educador"
        pontos: { educador: 3 }
      - texto: "Me preparar para o vestibular"
        pontos: { vestibular: 3 }
      - texto: "Falar melhor em público"
        pontos: { oratoria: 3 }

  - id: temas
    pergunta: "Quais destes temas despertam sua curiosidade?"
    ajuda: "Escolha até três."
    tipo: varias
    maximo: 3
    opcoes:
      - texto: "Grécia e Roma"
        pontos: { antiguidade: 2 }
      - texto: "Idade Média"
        pontos: { medieval: 2 }
      - texto: "Renascimento e revoluções"
        pontos: { moderna: 2 }
      - texto: "Os séculos XIX e XX"
        pontos: { contemporanea: 2 }
      - texto: "A história do Brasil"
        pontos: { brasil: 2 }
      - texto: "Fé cristã e pensamento"
        pontos: { fe: 2 }
      - texto: "Ética e virtudes"
        pontos: { etica: 2 }
      - texto: "Mitos, epopeias e poesia"
        pontos: { poesia: 2, antiguidade: 1 }
      - texto: "Infância e imaginação"
        pontos: { imaginacao: 2, filhos: 1 }
      - texto: "Justiça e leis"
        pontos: { direito: 2 }

  - id: filhos
    pergunta: "Você tem filhos? De que idade?"
    ajuda: "Pode marcar mais de uma faixa."
    tipo: varias
    opcoes:
      - texto: "Pequenos, até 6 anos"
        pontos: { filhos: 2, primeira-infancia: 3 }
        marca: pais
      - texto: "Entre 7 e 12 anos"
        pontos: { filhos: 2, escolar: 3 }
        marca: pais
      - texto: "Adolescentes"
        pontos: { filhos: 2, adolescentes: 3 }
        marca: pais
      - texto: "Já adultos"
        pontos: {}
      - texto: "Não tenho filhos"
        pontos: {}
        exclusiva: true

  - id: homeschooling
    pergunta: "Vocês educam os filhos em casa, ou pensam nisso?"
    tipo: uma
    mostrar_se: pais
    opcoes:
      - texto: "Sim, já educamos em casa"
        pontos: { homeschooling: 4, educador: 1 }
      - texto: "Estamos pensando nisso"
        pontos: { homeschooling: 3 }
      - texto: "Não"
        pontos: {}

  - id: trabalho
    pergunta: "Você trabalha com educação?"
    tipo: uma
    opcoes:
      - texto: "Sim, sou professor ou professora"
        pontos: { educador: 3 }
      - texto: "Sou tutor, coordenador ou educo em casa"
        pontos: { educador: 2, homeschooling: 1 }
      - texto: "Não"
        pontos: {}

  - id: nivel
    pergunta: "Quanto você já estudou desses assuntos?"
    tipo: uma
    opcoes:
      - texto: "Estou começando agora"
        pontos: { iniciante: 3 }
      - texto: "Já li e estudei um pouco"
        pontos: { intermediario: 2 }
      - texto: "Estudo há anos e quero ir mais fundo"
        pontos: { aprofundado: 3 }

  - id: tempo
    pergunta: "Quanto tempo você quer dedicar a um curso?"
    tipo: uma
    opcoes:
      - texto: "Pouco: algo para começar, em até 2 horas"
        pontos: { curto: 3 }
      - texto: "Algumas horas, com calma"
        pontos: { medio: 3 }
      - texto: "Quero um mergulho longo"
        pontos: { longo: 3 }

  - id: estilo
    pergunta: "Como você prefere aprender?"
    tipo: uma
    opcoes:
      - texto: "Com um panorama claro, que dê a visão de conjunto"
        pontos: { panorama: 3 }
      - texto: "Lendo obras e autores de perto, com comentário"
        pontos: { leitura: 3 }
      - texto: "Com orientações práticas para o dia a dia"
        pontos: { pratico: 3 }

# ── MOTIVOS ──────────────────────────────────────────────────────────────────
# A frase que aparece em "Por que este curso" quando a etiqueta pesa na sugestão.
motivos:
  historia: "você quer entender a história"
  filosofia: "você quer pensar as grandes perguntas"
  literatura: "você gosta das grandes obras"
  filhos: "você quer educar melhor seus filhos"
  direito: "você se interessa por direito"
  educador: "você trabalha ou quer trabalhar com educação"
  vestibular: "você vai prestar vestibular"
  oratoria: "você quer falar melhor em público"
  antiguidade: "Grécia e Roma despertam sua curiosidade"
  medieval: "a Idade Média desperta sua curiosidade"
  moderna: "o Renascimento e as revoluções te interessam"
  contemporanea: "os séculos XIX e XX te interessam"
  brasil: "você quer conhecer melhor o Brasil"
  fe: "a fé cristã e o pensamento te interessam"
  etica: "ética e virtudes te interessam"
  poesia: "mitos, epopeias e poesia te atraem"
  imaginacao: "infância e imaginação te interessam"
  primeira-infancia: "você tem filhos pequenos"
  escolar: "você tem filhos em idade escolar"
  adolescentes: "você tem filhos adolescentes"
  homeschooling: "vocês educam em casa ou pensam nisso"
  iniciante: "é um bom ponto de partida"
  intermediario: "combina com quem já estudou um pouco"
  aprofundado: "vai fundo, como você quer"
  panorama: "dá uma visão de conjunto"
  leitura: "lê obras e autores de perto"
  pratico: "traz orientações práticas"
  curto: "é curto, cabe no tempo que você tem"
  medio: "tem algumas horas, no ritmo que você quer"
  longo: "é um mergulho longo, como você quer"

# ── DURAÇÃO ──────────────────────────────────────────────────────────────────
# O site marca cada curso como curto, medio ou longo pela soma das aulas (não precisa pôr nas etiquetas abaixo).
duracao:
  curto_ate_min: 120
  longo_a_partir_min: 480

# ── CURSOS ───────────────────────────────────────────────────────────────────
# Etiquetas de cada curso, com peso de 1 a 4. Quanto maior o peso, mais o curso aparece para quem
# marcou respostas com aquela etiqueta. Curso que não estiver aqui nunca é sugerido.
cursos:
  alta-idade-media: { historia: 3, medieval: 3, panorama: 2, iniciante: 2 }
  arte-de-falar-bem: { oratoria: 4, pratico: 3, iniciante: 2, educador: 1, vestibular: 1 }
  baixa-idade-media: { historia: 3, medieval: 3, fe: 1, panorama: 2, iniciante: 2 }
  brasil-mapas-cartas: { historia: 3, brasil: 3, leitura: 2, intermediario: 2, vestibular: 1 }
  brevissima-introducao-ao-direito: { direito: 3, iniciante: 3, panorama: 2 }
  como-estudar-historia: { historia: 2, iniciante: 2, pratico: 2, vestibular: 2, educador: 1 }
  dante-e-a-literatura: { literatura: 3, poesia: 3, medieval: 2, fe: 2, leitura: 3, intermediario: 1 }
  educacao-personalizada: { filhos: 3, educador: 3, escolar: 2, adolescentes: 1, filosofia: 1, homeschooling: 1, pratico: 1 }
  era-napoleonica: { historia: 3, moderna: 2, contemporanea: 1, panorama: 2, iniciante: 2 }
  filosofia-da-educacao: { educador: 3, filosofia: 3, filhos: 1, homeschooling: 1, aprofundado: 2, panorama: 1 }
  filosofia-da-natureza: { filosofia: 3, antiguidade: 2, iniciante: 1, intermediario: 1, leitura: 1 }
  filosofia-do-direito: { direito: 3, filosofia: 2, etica: 2, fe: 1, intermediario: 2 }
  grandes-epopeias-da-antiguidade: { literatura: 3, poesia: 3, antiguidade: 3, leitura: 3, aprofundado: 2 }
  gregos-fundamento-do-ocidente: { historia: 3, antiguidade: 3, panorama: 2, iniciante: 2 }
  harmonia-familiar: { filhos: 3, primeira-infancia: 3, escolar: 2, adolescentes: 1, pratico: 3 }
  historia-das-mentalidades: { historia: 3, brasil: 2, medieval: 1, imaginacao: 1, literatura: 1, leitura: 1, aprofundado: 1 }
  historia-direito-romano: { direito: 3, historia: 2, antiguidade: 2, aprofundado: 2 }
  historia-do-pensamento-etico: { filosofia: 3, etica: 3, panorama: 2, intermediario: 2 }
  homeschooling-aspectos-juridicos: { homeschooling: 4, filhos: 2, direito: 2, pratico: 3 }
  imaginario-crianca-moderna: { filhos: 3, imaginacao: 3, escolar: 2, primeira-infancia: 1, adolescentes: 1, pratico: 2 }
  imperio-bizantino: { historia: 3, medieval: 2, fe: 2, panorama: 2, iniciante: 2 }
  inicio-seculo-xx-guerra-e-revolucao: { historia: 3, contemporanea: 3, panorama: 2, iniciante: 1 }
  literaturas-de-lingua-portuguesa-fuvest: { vestibular: 4, literatura: 3, brasil: 3, leitura: 3, poesia: 1 }
  mercantilismo: { historia: 3, moderna: 3, panorama: 2, iniciante: 2 }
  musicas-contos-e-lendas-de-natal: { literatura: 2, fe: 3, imaginacao: 2, filhos: 1, poesia: 1, iniciante: 2 }
  o-fim-da-educacao: { educador: 3, filosofia: 2, filhos: 1, literatura: 2, medieval: 1, aprofundado: 2 }
  o-grande-seculo-xix: { historia: 3, contemporanea: 3, panorama: 2, iniciante: 1 }
  o-que-e-filosofar: { filosofia: 3, iniciante: 3, panorama: 1 }
  os-francos-e-o-nascimento-da-cristandade: { historia: 3, medieval: 3, fe: 3, panorama: 2, iniciante: 1 }
  patristica-agostinho-dionisio: { filosofia: 3, fe: 3, medieval: 2, antiguidade: 1, aprofundado: 3, leitura: 2 }
  renascimento: { historia: 3, moderna: 3, panorama: 2, iniciante: 1, fe: 1 }
  revolucao-francesa: { historia: 3, moderna: 3, panorama: 1, intermediario: 2 }
  revolucoes-burguesas: { historia: 3, moderna: 3, panorama: 2, intermediario: 1 }
  roma: { historia: 3, antiguidade: 3, fe: 1, panorama: 2, iniciante: 2 }
  teatro-grego-tragedia: { literatura: 3, antiguidade: 3, poesia: 2, etica: 1, leitura: 3, intermediario: 1 }
  tecnica-ciencia-religiao: { filosofia: 3, antiguidade: 3, fe: 1, aprofundado: 3 }
  virtudes-fundamentais: { filosofia: 3, etica: 3, iniciante: 2, educador: 1, filhos: 1, pratico: 1 }

# Quando as respostas não apontam para nada (ex.: a pessoa pulou tudo), sugerimos estes.
ponto_de_partida:
  - o-que-e-filosofar
  - como-estudar-historia
  - harmonia-familiar

# ── TRILHAS ──────────────────────────────────────────────────────────────────
# Sequências de cursos em ordem. O site sugere a trilha cujos cursos, em média, mais combinam com as respostas.
trilhas:
  - nome: "Trilha de História: da Grécia ao século XX"
    descricao: "Treze cursos curtos, em ordem cronológica, para enxergar a história do Ocidente de ponta a ponta."
    cursos:
      - gregos-fundamento-do-ocidente
      - roma
      - imperio-bizantino
      - os-francos-e-o-nascimento-da-cristandade
      - alta-idade-media
      - baixa-idade-media
      - renascimento
      - mercantilismo
      - revolucoes-burguesas
      - revolucao-francesa
      - era-napoleonica
      - o-grande-seculo-xix
      - inicio-seculo-xx-guerra-e-revolucao

  - nome: "Primeiros passos na filosofia"
    descricao: "Do espanto que dá início à filosofia às virtudes, à ética e a Aristóteles."
    cursos:
      - o-que-e-filosofar
      - virtudes-fundamentais
      - historia-do-pensamento-etico
      - filosofia-da-natureza

  - nome: "Fé e razão: o pensamento cristão"
    descricao: "Dos Padres da Igreja a Dante, passando pelo nascimento da cristandade."
    cursos:
      - patristica-agostinho-dionisio
      - os-francos-e-o-nascimento-da-cristandade
      - baixa-idade-media
      - dante-e-a-literatura
      - virtudes-fundamentais

  - nome: "O mundo grego"
    descricao: "História, epopeias, tragédia e filosofia: a Grécia de ponta a ponta."
    cursos:
      - gregos-fundamento-do-ocidente
      - grandes-epopeias-da-antiguidade
      - teatro-grego-tragedia
      - filosofia-da-natureza
      - tecnica-ciencia-religiao

  - nome: "Educar os filhos"
    descricao: "Do dia a dia da primeira infância ao imaginário e às virtudes."
    cursos:
      - harmonia-familiar
      - educacao-personalizada
      - imaginario-crianca-moderna
      - virtudes-fundamentais

  - nome: "Educação em casa"
    descricao: "A segurança jurídica do ensino domiciliar e os fundamentos para educar bem."
    cursos:
      - homeschooling-aspectos-juridicos
      - educacao-personalizada
      - harmonia-familiar
      - filosofia-da-educacao

  - nome: "Formação do educador"
    descricao: "Para professores e educadores: os fins da educação, a escola e o ofício de ensinar."
    cursos:
      - filosofia-da-educacao
      - o-fim-da-educacao
      - educacao-personalizada
      - como-estudar-historia
      - arte-de-falar-bem

  - nome: "Grandes obras da literatura"
    descricao: "Das epopeias e tragédias gregas a Dante e aos clássicos em português."
    cursos:
      - grandes-epopeias-da-antiguidade
      - teatro-grego-tragedia
      - dante-e-a-literatura
      - literaturas-de-lingua-portuguesa-fuvest

  - nome: "Direito para começar"
    descricao: "O que é o direito, a visão clássica da justiça e as raízes romanas."
    cursos:
      - brevissima-introducao-ao-direito
      - filosofia-do-direito
      - historia-direito-romano

  - nome: "Rumo ao vestibular"
    descricao: "As obras da FUVEST, método de estudo, a história do Brasil nas fontes e a arte de se expressar."
    cursos:
      - literaturas-de-lingua-portuguesa-fuvest
      - como-estudar-historia
      - brasil-mapas-cartas
      - arte-de-falar-bem

  - nome: "Brasil: história e letras"
    descricao: "A formação do país nas cartas e mapas, a mentalidade brasileira e os clássicos da língua."
    cursos:
      - brasil-mapas-cartas
      - historia-das-mentalidades
      - literaturas-de-lingua-portuguesa-fuvest
---

Como a sugestão é calculada:

1. Cada resposta soma pontos a algumas etiquetas (por exemplo, "Educar melhor meus filhos" soma 3 em filhos).
   No fim, a pessoa tem um perfil: a soma dos pontos de todas as respostas.
2. Cada curso tem suas etiquetas, com peso de 1 a 4 (lista "cursos"). O site também marca sozinho cada curso como
   curto (até 2 horas), medio ou longo (8 horas ou mais), conforme a duração das aulas.
3. A nota de um curso é a soma, etiqueta por etiqueta, de (pontos da pessoa × peso do curso).
   Os três cursos com as maiores notas são sugeridos (no máximo dois do mesmo professor).
4. "Por que este curso" mostra as frases (lista "motivos") das etiquetas que mais pesaram na nota.
5. A trilha sugerida é a que tem a maior nota média entre os seus cursos.

Para calibrar:

- Um curso aparece pouco para quem deveria? Aumente o peso da etiqueta certa nele (ex.: filhos: 2 → 3).
- Uma resposta pesa demais? Diminua os pontos dela.
- Pergunta nova: copie um bloco de pergunta, troque o id (sem acentos, sem espaços), o texto e as opções.
  As etiquetas podem ser novas; nesse caso, ponha também a frase delas em "motivos" e o peso nos cursos.
- Curso novo no catálogo: acrescente uma linha em "cursos" com as etiquetas dele.

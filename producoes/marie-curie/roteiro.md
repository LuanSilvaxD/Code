# Roteiro v1: Quem foi ela? (Marie Curie, com o nome em mistério até o fim)

> Status: **AGUARDANDO APROVAÇÃO** — implementação e renderização não iniciadas.
> Convenção: timestamps MM:SS:FF a 30 fps (FF 00–29); frames em intervalo semiaberto [início, fim).
> Os tempos são estimativas. Depois de gravar a narração, os cortes passam a seguir a voz real.

## 1. Briefing de produção

- **Tema:** biografia de Marie Curie (1867–1934) contada como mistério. O nome dela **só aparece aos ~2:30**.
  Antes disso ela é sempre "ela", uma silhueta com um "?".
  - **Gancho:** os cadernos dela ainda são radioativos.
  - **Fio da história:** cada obstáculo que ela venceu (problema → solução):
    1. proibida de estudar;
    2. sem dinheiro;
    3. o mistério dos raios do urânio;
    4. a pedra radioativa demais;
    5. os químicos que queriam ver para crer;
    6. quase ficar de fora do Nobel;
    7. a perda do marido.
  - **Fecho:** o preço que ela pagou explica o gancho, e então vem a revelação do nome.
- **Para não entregar o nome antes da hora:**
  - nada de "Curie" na fala, nos textos ou no apelido dos carros de raio X ("petites Curies");
  - o marido é só "o físico com quem se casou";
  - o descobridor dos raios do urânio fica sem nome;
  - o rosto não aparece antes da revelação.
- **Público e objetivo:** leigo. A pessoa sai sabendo quem foi ela, o que ela descobriu e por que isso importa.
  A parte de ciência (radioatividade vem de dentro do átomo; novos elementos) é explicada com uma "prova"
  visual em cada passo.
- **Duração: 2:50** (170 s, 5100 frames). Você pediu 2 min e liberou aumentar.
  - Com 2 min, a história teria que perder ciclos (o trato com a irmã, a prova no galpão, a guerra) e viraria lista de datas.
  - Já cortei o texto de 432 para 402 palavras.
  - Formato: 1080 × 1920, 9:16, 30 fps, pt-BR, tom didático e ágil, com suspense.
- **Mundo 3D: uma linha do tempo em maquete.** Um pedestal comprido (x −16 a +17) com 8 estações, de 1867 (esquerda) até hoje
  (direita):
  1. Varsóvia
  2. o trato
  3. o sótão em Paris
  4. o laboratório
  5. o galpão
  6. o palco do Nobel
  7. a guerra
  8. o cofre da biblioteca

  O vídeo **abre no fim** (cofre), volta para 1867 com um chicote e caminha pela maquete até voltar ao cofre para a revelação.
- **Personagens:** régua 1 m = 0,3 u3d; casa de 6 m = 1,8 u3d; pessoa ≈ 0,51 u3d.
  - **ela:** Person com vestido longo escuro (pequena variação de figurino) em silhueta preta com contorno roxo e "?".
  - **a irmã**, **o físico** e **um soldado:** figurantes variados.
  - **o mascote:** visita as estações e reage.
- **Fundo:** estúdio com tom "história" (`#2e1f3a`). Escurece na cena do preço e acende na revelação.
- **TTS:** edge-tts `pt-BR-AntonioNeural`, **+4%** (gratuito). Grafia fonética só no áudio: "Skłodowska" → "Sklodóvska",
  "Curie" → "Kirí", "Sorbonne" → "Sorbóne", "pechblenda" → conferir na escuta.

## 2. Tabela cronológica

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 – 00:09:15 | 0 – 285 | Os cadernos desta mulher ficam guardados em caixas de chumbo. Mais de cem anos depois, eles ainda são radioativos. Quem foi ela? | Estação HOJE (cofre). Close na caixa (d=3,6) → abre para mostrar a silhueta dela atrás (d=6,5). | Caixa de chumbo com 3 cadernos, contador Geiger, ELA em silhueta com "?", mascote ao lado. | `box.lid` 0→1 ("guardados"); `notebooks.radiation` 0→1 (partículas, "ainda"); `geiger.needle` 0→0,85; `her.spot` 0→1 ("Quem"); mascote pulinho em "radioativos". | ℹ CAIXAS DE CHUMBO; ⚠ AINDA RADIOATIVOS — mais de 100 anos depois; ❓ QUEM FOI ELA? (large) |
| 00:09:15 – 00:17:18 | 285 – 528 | A história começa em Varsóvia, em 1867. A Polônia era dominada pela Rússia, e as universidades não aceitavam mulheres. | Chicote para a ponta esquerda (1867). Plano da estação → portão da universidade. | Casas, universidade com portão de grades, placa 1867, ELA na rua, mascote. | `fx.whipIn`; `year.1867`; `warsaw.shadow` 0→1 ("dominada"); `gate.close` 0→1 + ✖ ("universidades"); mascote pulinho em "mulheres". | ℹ VARSÓVIA, 1867; ✖ PROIBIDO PARA MULHERES — universidades |
| 00:17:18 – 00:24:12 | 528 – 732 | Então ela estudou escondido, numa universidade clandestina que mudava de endereço para não ser descoberta. | Órbita para as janelas das casas. | 3 casas; em cada janela, 4 silhuetas estudando; lanterna de patrulha. | ELA anda até as casas; `windows.hop` 0→3 (a luz "pula" de casa em casa); `lantern.patrol` passa e não acha ninguém. | ℹ UNIVERSIDADE CLANDESTINA — aulas secretas em casas |
| 00:24:12 – 00:37:09 | 732 – 1119 | Para estudar de verdade, precisava ir para Paris, mas não tinha dinheiro. Então fez um trato com a irmã: trabalhou como governanta para pagar a faculdade dela. Depois, seria a sua vez. | Tracking até a estação O TRATO → trilho e trem. (Plano longo: 3 movimentos.) | Casa da família, a irmã, moedas, trem para Paris, seta de volta. | `wallet.empty` ("dinheiro"); `sister.show`; `coins.flow` ela → irmã ("trabalhou"); `train.x` a irmã parte; `arrowBack.show` ("Depois"). | ✖ SEM DINHEIRO; ✔ O TRATO DAS IRMÃS — uma paga o estudo da outra |
| 00:37:09 – 00:46:00 | 1119 – 1380 | Em 1891, aos 24 anos, chegou a Paris. Num quartinho gelado, estudou até se formar em física e, depois, em matemática. | O trem a leva até PARIS; dolly-in no sótão em corte. | Sótão (cama, mesa, vela, gelo na janela), 2 diplomas. | `year.1891`; `attic.frost`; `candle.burn`; `diploma.physics` (spring) e `diploma.math` (spring); mascote acena. | ℹ PARIS, 1891 — 24 anos; ✔ FÍSICA + MATEMÁTICA — dois diplomas |
| 00:46:00 – 00:54:21 | 1380 – 1641 | Em 1896, descobriram que o urânio solta raios invisíveis. Ninguém sabia de onde vinham, e ela escolheu esse mistério para o doutorado. | Tracking até o LABORATÓRIO → amostras. | Bancada, pedra de urânio, chapa fotográfica. | `year.1896`; `uranium.rays` (riscos translúcidos); `plate.fog` (a chapa mancha); `question.uranium` (spring); ELA olha a pedra. | ℹ RAIOS INVISÍVEIS — o urânio emite algo; ❓ DE ONDE VÊM? |
| 00:54:21 – 01:12:03 | 1641 – 2163 | Com um aparelho supersensível, criado pelo físico com quem se casou e pelo irmão dele, ela mediu os raios. Quanto mais urânio, mais radiação, não importa a mistura. Se fosse química, a mistura mudaria isso. Não mudava: os raios vinham de dentro do átomo. | Close no eletrômetro → 3 amostras → sobe para o átomo esquemático. (Plano longo: a prova em 3 passos.) | O físico, eletrômetro, 3 amostras (1/2/3 doses em misturas diferentes), átomo. | `husband.show`; `meter.needle`; `samples.bars` 1→2→3; `samples.mixSwap` troca as misturas e as barras **não mudam**; `chem.cross` risca "química"; `atom.zoom`, `atom.emit`; mascote aponta o medidor. | ✔ MAIS URÂNIO = MAIS RADIAÇÃO — não importa a mistura; ✖ NÃO É QUÍMICA; ✔ VEM DE DENTRO DO ÁTOMO |
| 01:12:03 – 01:20:06 | 2163 – 2406 | Ela batizou isso de radioatividade. Mas um minério, a pechblenda, soltava radiação demais para o urânio que tinha. | Do átomo para a pedra preta. | Pechblenda, eletrômetro com marca tracejada "esperado". | `word.radioactivity` (spring); `ore.show`; `meter.expected`; o ponteiro passa muito da marca; `fx.shake`; mascote pulinho. | ℹ RADIOATIVIDADE — nome criado por ela; ⚠ RADIAÇÃO DEMAIS! — mais do que o urânio explica |
| 01:20:06 – 01:30:00 | 2406 – 2700 | Só podia ter algo desconhecido ali. Em 1898, ela e o marido anunciaram dois elementos novos: o polônio, com o nome do país dela, e o rádio. | Sobe para os cartões que saem da pedra. | Pedra em corte com 2 brilhos; cartões Po (84) e Ra (88); bandeirinha da Polônia. | `ore.crack`; `year.1898`; `card.po` (spring); `flag.pl`; `card.ra` (spring) + `fx.burst`; mascote comemora. | ✔ 2 ELEMENTOS NOVOS — 1898 |
| 01:30:00 – 01:43:27 | 2700 – 3117 | Só que os químicos queriam ver para crer. Num galpão com goteiras, ela processou toneladas de minério por quase quatro anos, até separar um décimo de grama de sal de rádio. Pesou, mediu, e ninguém mais duvidou. | Tracking até O GALPÃO → frasquinho e balança. (Plano longo: a prova.) | Galpão com goteiras, caldeirão, monte de minério, frasco brilhante, balança, "?" sobre químicos. | `doubt.show`; `shed.drips`; `ore.pile` 1→0,08; contador ANO 1…4; `vial.glow` (spring); `scale.weigh`; os "?" somem. | ❓ VER PARA CRER; ℹ TONELADAS → 0,1 GRAMA — quase 4 anos; ✔ PROVA: ISOLOU E PESOU — o rádio existe |
| 01:43:27 – 01:56:12 | 3117 – 3492 | Em 1903, ganhou o Nobel de Física, com o marido e o descobridor dos raios do urânio. Quase ficou de fora da indicação, mas o marido insistiu. Foi a primeira mulher a ganhar um Nobel. | O PALCO → close na medalha. | Pódio de 3 lugares, medalha 1903, cartão de indicação 2D (linhas sem nomes legíveis). | `medal.1903` (spring); `nomination.show` (2 linhas, falta a dela); `nomination.add` (o marido acrescenta); `fx.flash`; mascote comemora. | ✔ NOBEL DE FÍSICA, 1903 — dividido em três; ✖ QUASE FICOU DE FORA; ✔ 1ª MULHER COM UM NOBEL (large) |
| 01:56:12 – 02:06:18 | 3492 – 3798 | Em 1906, o marido morreu atropelado. Ela assumiu as aulas dele e virou a primeira mulher professora da Sorbonne. Em 1911, ganhou sozinha o Nobel de Química. | Palco → púlpito → medalha. | Púlpito + quadro-negro; medalha QUÍMICA 1911. | `husband.fade` (vira silhueta e some, **sem cena de acidente**); `stage.dim`; ELA vai ao púlpito; `chalk.write`; `medal.1911` (spring). | ✔ 1ª PROFESSORA DA SORBONNE; ✔ NOBEL DE QUÍMICA, 1911 — sozinha |
| 02:06:18 – 02:15:21 | 3798 – 4071 | É a única pessoa com Nobel em duas ciências diferentes. Na Primeira Guerra, ainda criou carros de raio X para achar balas nos soldados feridos. | Medalhas lado a lado → A GUERRA → tela do raio X. | Carro com raio X, soldado na maca, tela com ossos e bala. | `medals.pair`; `year.1914`; `car.x` chega; `xray.beam`; `xray.screen` (spring); `bullet.mark`. | ✔ NOBEL EM 2 CIÊNCIAS — única pessoa até hoje; ℹ RAIO X SOBRE RODAS — Primeira Guerra |
| 02:15:21 – 02:30:21 | 4071 – 4521 | Mas ninguém conhecia o perigo da radiação. Ela manipulou rádio por décadas, quase sem proteção, e morreu em 1934 de uma doença no sangue, provavelmente causada pela radiação. O rádio ficou até nos cadernos dela. | Volta ao COFRE; a luz sobre ela diminui; close nos cadernos. (Plano longo: fecha o laço do gancho + pausa.) | Frasco nas mãos dela soltando partículas, caixa de chumbo, Geiger. | `her.glowHands`; `year.1934`; `her.spot` →0,15 (respeitoso); `notebooks.radiation` e `geiger.needle` sobem de novo. | ⚠ PERIGO DESCONHECIDO; ℹ 1934 — provável efeito da radiação; ⚠ RÁDIO NOS CADERNOS — metade some só em ~1.600 anos |
| 02:30:21 – 02:37:24 | 4521 – 4734 | Ela nasceu Maria Skłodowska. Mas o mundo a conhece como Marie Curie. | Escuro por um instante; close lento na silhueta. | Placa 2D com o nome de nascimento → MARIE CURIE (1867–1934). | `name.birth` (spring); `her.mystery` →0 (o "?" se desfaz); `her.reveal` 0→1 (luz, cores, cabelo preso); `name.known` (spring); `fx.flash` + `fx.punch` + `fx.burst`; mascote comemora. | ✔ MARIE CURIE (large) — 1867–1934 |
| 02:37:24 – 02:50:00 | 4734 – 5100 | Pronto: agora você sabe quem é a mulher dos cadernos radioativos. | Dolly-out até a linha do tempo inteira (d=46); **encerramento fixo da marca** nos últimos ~4,7 s. | As 8 estações acendem da esquerda para a direita. | `timeline.lightUp` 0→1; mascote acena. | ℹ 2 NOBEIS · 2 ELEMENTOS — e a palavra "radioatividade" |

Soma: 285+243+204+387+261+261+522+243+294+417+375+306+273+450+213+366 = **5100 frames** (170 s), contíguos.

Quatro planos passam de 8 s (4, 7, 10 e 14). Cada um tem 2–3 movimentos de câmera internos, porque são as "provas" ou
viradas que precisam de tempo para ser entendidas.

## 3. Estrutura de State / Props

O contrato completo está em `scene-plan.ts`: 16 cenas, tipos e helpers do template, mesmos `fx.*` e `mascot.*`.
- **Objetos de id estável:** `backdrop`, `timeline`, `stations`, `her` (trilhas `her.x/walk/spot/mystery/reveal`), `mascot`,
  mais os extras por cena.
- **Checagens:** `tsc --strict` sem erros; linha do tempo contígua somando 5100; âncoras de palavra presas ao fim de cada cena.
- **Determinismo:** tudo é função do frame; partículas com `random(seed)`.
- **3D:** maquete, personagens, objetos, partículas, átomo.
- **2D:** badges, legendas, placas de ano, cartão de indicação, tela do raio X, contador de anos, placa do nome.

## 4. Áudio e montagem

**Narração** (402 palavras, fora o encerramento):

Os cadernos desta mulher ficam guardados em caixas de chumbo. Mais de cem anos depois, eles ainda são radioativos. Quem
foi ela? A história começa em Varsóvia, em 1867. A Polônia era dominada pela Rússia, e as universidades não aceitavam
mulheres. Então ela estudou escondido, numa universidade clandestina que mudava de endereço para não ser descoberta. Para
estudar de verdade, precisava ir para Paris, mas não tinha dinheiro. Então fez um trato com a irmã: trabalhou como
governanta para pagar a faculdade dela. Depois, seria a sua vez. Em 1891, aos 24 anos, chegou a Paris. Num quartinho
gelado, estudou até se formar em física e, depois, em matemática. Em 1896, descobriram que o urânio solta raios
invisíveis. Ninguém sabia de onde vinham, e ela escolheu esse mistério para o doutorado. Com um aparelho supersensível,
criado pelo físico com quem se casou e pelo irmão dele, ela mediu os raios. Quanto mais urânio, mais radiação, não importa
a mistura. Se fosse química, a mistura mudaria isso. Não mudava: os raios vinham de dentro do átomo. Ela batizou isso de
radioatividade. Mas um minério, a pechblenda, soltava radiação demais para o urânio que tinha. Só podia ter algo
desconhecido ali. Em 1898, ela e o marido anunciaram dois elementos novos: o polônio, com o nome do país dela, e o rádio.
Só que os químicos queriam ver para crer. Num galpão com goteiras, ela processou toneladas de minério por quase quatro
anos, até separar um décimo de grama de sal de rádio. Pesou, mediu, e ninguém mais duvidou. Em 1903, ganhou o Nobel de
Física, com o marido e o descobridor dos raios do urânio. Quase ficou de fora da indicação, mas o marido insistiu. Foi a
primeira mulher a ganhar um Nobel. Em 1906, o marido morreu atropelado. Ela assumiu as aulas dele e virou a primeira
mulher professora da Sorbonne. Em 1911, ganhou sozinha o Nobel de Química. É a única pessoa com Nobel em duas ciências
diferentes. Na Primeira Guerra, ainda criou carros de raio X para achar balas nos soldados feridos. Mas ninguém conhecia
o perigo da radiação. Ela manipulou rádio por décadas, quase sem proteção, e morreu em 1934 de uma doença no sangue,
provavelmente causada pela radiação. O rádio ficou até nos cadernos dela. Ela nasceu Maria Skłodowska. Mas o mundo a
conhece como Marie Curie. Pronto: agora você sabe quem é a mulher dos cadernos radioativos.

**Encerramento fixo da marca:** "Segue a Fenda Umbra e compartilha pra mais vídeos assim!" (~3,3 s).

- **Orçamento (`vo_budget.py`):**
  - estimativa de 153,7 s de fala a +0%, que fica ≈148 s a +4%;
  - somando pausas, abertura e encerramento, dá ≈163 s, com **folga de ~7 s**;
  - a folga vai para a pausa antes do nome (2,6 s) e antes do preço (2,2 s).
  - Reajusto com a voz real.
- **Efeitos:**
  - Geiger (clique novo, a sintetizar), tampa de chumbo, portão, cliques das janelas, moedas, trem;
  - brilhos no átomo e no rádio, tremor na pechblenda, sinos nos Nobel, chuva fraca no galpão;
  - silêncio + grave antes do nome, acorde de revelação.
- **Trilha (`INTENTS`):**

  | Cenas | Intenção |
  | --- | --- |
  | 1 | tense (mistério) |
  | 2–3 | calm |
  | 4–5 | curious |
  | 6–9 | curious, com reveal em 9 |
  | 10 | build |
  | 11–13 | reveal / curious |
  | 14 | tense |
  | 15 | reveal |
  | 16 | resolve |

## 5. Critérios de aceite e notas de verificação

- [x] Gancho forte (cadernos radioativos + "Quem foi ela?"). O nome só aparece aos 2:30, sem "Curie" antes em lugar nenhum.
- [x] 7 ciclos de obstáculo → solução, com a ciência explicada antes do termo ("radioatividade" depois da medição).
- [x] Provas com a lógica dita em voz alta:
  - "se fosse química, a mistura mudaria isso; não mudava";
  - "radiação demais para o urânio que tinha → algo desconhecido";
  - "pesou, mediu, e ninguém mais duvidou".
- [x] O fim fecha o laço do começo (rádio nos cadernos) e a revelação é o clímax.
- [x] Tabela completa, 16 planos, frames contíguos, soma 5100.
- [ ] Ainda não verificado, fica para a Fase 2: leitura no celular, pronúncia de Skłodowska/Curie/Sorbonne, enquadramento e áudio.

**Verificação dos fatos.** Pesquisei cada um. O que tem divergência entre fontes eu suavizei ou deixei de fora:
- **Confirmado:**
  - nascimento em Varsóvia (1867), sob domínio russo, e universidades que não aceitavam mulheres;
  - universidade clandestina ("Universidade Volante");
  - trato com a irmã Bronisława, trabalhando como governanta;
  - Paris em 1891, aos 24 anos;
  - diplomas em física (1893) e matemática (1894);
  - eletrômetro de Pierre e Jacques Curie;
  - termo "radioatividade" (1898);
  - polônio (julho de 1898, nome da Polônia) e rádio (dezembro de 1898);
  - ~0,1 g de cloreto de rádio em 1902, depois de anos num galpão;
  - Nobel de Física 1903 dividido com Pierre e Becquerel, sendo a primeira mulher Nobel;
  - a indicação francesa original citava só Pierre e Becquerel, e Pierre insistiu (avisado por Mittag-Leffler);
  - morte de Pierre em 1906, atropelado por uma carroça;
  - primeira professora da Universidade de Paris;
  - Nobel de Química 1911, sozinha;
  - única pessoa premiada em duas ciências;
  - carros de raio X na Primeira Guerra (cerca de 20);
  - morte em 1934 de doença no sangue (anemia aplástica), ligada à radiação;
  - cadernos contaminados com rádio-226, que tem meia-vida de ~1.600 anos.
- **Suavizado ou fora do roteiro:**
  - "primeira da turma em física": as fontes divergem, por isso tirei;
  - quantidade de minério: as fontes vão de "várias" a ~8 toneladas, por isso ficou só "toneladas";
  - "mais de 1 milhão de soldados examinados": é estimativa, por isso não citei número;
  - "caixas de chumbo na Biblioteca Nacional da França": muito noticiado (e o perigo do rádio-226 é real), mas **não achei
    confirmação numa página oficial da BnF**. Mantive porque é amplamente reportado. Se quiser rigor máximo, troco por
    "ficam guardados em caixas especiais".
  - Gravidade da contaminação: o risco de tocar nos cadernos hoje é baixo e as matérias às vezes exageram.
    Por isso o roteiro diz só "ainda são radioativos", que é verdade.
- **Figurino e rosto:** personagem low-poly estilizada, sem tentar retratar o rosto real.

**Fontes consultadas:**
- Nobel Prize — Marie Curie, Women who changed science: https://nobelprize.org/womenwhochangedscience/stories/marie-curie
- Nobel Prize — Física 1903: https://www.nobelprize.org/prizes/physics/1903/summary/
- Nobel Prize — Marie e Pierre Curie e a descoberta do polônio e do rádio: https://www.nobelprize.org/prizes/themes/marie-and-pierre-curie-and-the-discovery-of-polonium-and-radium
- AIP — Curie, reconhecimento e Nobel: https://history.aip.org/exhibits/curie/recdis2.htm
- APS News — Dezembro de 1898, descoberta do rádio: https://www.aps.org/apsnews/2004/12/curies-1898-discover-radium
- Le Moyne (Giunta) — artigos de 1898 anotados: https://web.lemoyne.edu/GIUNTA/ea/CURIEann.HTML
- IEEE Spectrum — Curie e o raio X na Primeira Guerra: https://spectrum.ieee.org/the-institute/ieee-history/how-marie-curie-helped-save-a-million-soldiers-during-world-war-i
- RSC Education — isolamento do rádio: https://edu.rsc.org/resources/hot-gravity-filtration/2020217.article
- CS Monitor — por que os papéis dela ainda são radioativos: https://www.csmonitor.com/Innovation/Horizons/2011/1107/Marie-Curie-Why-her-papers-are-still-radioactive
- Ministério das Relações Exteriores da França — mulheres no Panteão: https://www.diplomatie.gouv.fr/en/coming-to-france/france-facts/great-women-a-grateful-fatherland-portraits-of-celebrated-women-in-the-pantheon

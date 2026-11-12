# Roteiro v1 — Quem foi ela? | Gigantes da Humanidade #2 (Joana d'Arc, com o nome em mistério até o fim)

> Status: **AGUARDANDO APROVAÇÃO**. Implementação e renderização não iniciadas.
>
> Convenções:
> - Timestamps em MM:SS:FF a 30 fps (FF de 00 a 29).
> - Frames em intervalo semiaberto [início, fim).
> - Os tempos são estimativas (`vo_budget.py`). Depois do TTS real, os cortes passam a seguir a voz.

## 1. Briefing de produção

### Tema e formato

- **Tema:** biografia de Joana d'Arc (c. 1412–1431), episódio **EP. 02** do quadro **Gigantes da Humanidade**.
  - O EP. 01 foi Marie Curie (`producoes/marie-curie`).
- **Formato: história / biografia com o mistério do nome**, o formato aprovado do quadro.
  - Até a cena 17, ela é só "ela": uma silhueta com "?".
  - O nome só é dito e mostrado aos ~2:34.
  - Por quê: a vida dela é uma sequência de obstáculos que pareciam impossíveis. Cada um é um "problema → como ela passou".
- **Gancho:** "17 anos, não sabia ler, comandou um exército e, 2 anos depois, foi queimada viva."
- **Fio da história:** a viagem dela pelo mapa da França, com uma fenda de luz roxa traçando o caminho. Obstáculos:
  1. a França dividida, com o herdeiro sem coroa;
  2. ser camponesa: o capitão a manda de volta;
  3. a desconfiança do herdeiro: interrogatório dos teólogos;
  4. o cerco de Orléans;
  5. a coroação em Reims;
  6. a captura;
  7. o julgamento com a pergunta-armadilha (a melhor "solução" do vídeo: a resposta dela);
  8. a morte;
  9. a reviravolta: inocente, depois santa;
  10. o nome que ela nunca usou.

### Para não entregar o nome antes da hora

Fica proibido antes da s17, em qualquer lugar: fala, badges, rótulos, legenda, capa, thumbnail, título e primeira linha das descrições.

- "Joana", "Jeanne", "d'Arc", "Donzela" e "Pucelle";
- "Donzela de Orléans";
- "Domrémy", porque o nome da aldeia é muito ligado a ela (o vilarejo fica sem nome);
- o rosto dela.

"Carlos", "Orléans", "Reims" e "Ruão" podem aparecer: são lugares e pessoas, não o nome dela.

**Aviso honesto:** muita gente vai adivinhar já no gancho ("queimada viva" e "exército"). Isso não estraga o vídeo. No quadro, adivinhar é parte da graça: gera comentário do tipo "eu sabia!", e a reviravolta do nome que ela nunca usou continua sendo novidade para quase todo mundo.

### Público, duração e voz

- **Público e objetivo:** leigo. A pessoa sai sabendo quem foi ela, o contexto (Guerra dos Cem Anos), o que ela conseguiu (Orléans e a coroação), por que foi condenada e como a história a reabilitou.
- **Duração: 2:55** (175 s, 5250 frames).
  - É a regra: o conteúdo decide, com teto de 2:55.
  - Com menos tempo, o julgamento cairia, e a pergunta-armadilha é o melhor momento da história.
  - Texto já cortado de 447 para 412 palavras. A estimativa cabe com 1,9 s de folga, mas a voz real tem saído ~5–9% mais longa. Se estourar, sobe para +8–10%; não corto fato sem te avisar.
- **Formato técnico:** 1080 × 1920, 9:16, 30 fps, pt-BR, tom didático e ágil, com suspense.
- **TTS:** edge-tts `pt-BR-AntonioNeural` (gratuito), +4%. A cta fica em +0%.
  - Grafia fonética só no áudio: "Reims" → "Rãns", "Jeanne" → "Jâne", "d'Arc" → "Dárc", "Orléans" → "Orleãns". Confirmar na escuta (eu não ouço o áudio).
- **Encerramento:** chamada nova falada, ~5,5 s ("Comenta o tema do próximo vídeo…").

### Mundo 3D: um mapa-maquete do norte da França em 1429

O mapa fica sobre o pedestal da marca, com relevo suave, rios Loire e Sena e o mar. Em cada cidade da história há uma **estação** em miniatura.

| Estação | Posição (x, z em u3d) | O que tem |
| --- | --- | --- |
| vilarejo sem nome | (+8, −1) | casas, igreja, árvore, ovelhas |
| Vaucouleurs | (+8,6, −2,2) | portão de castelo, capitão |
| Chinon | (−6, +6) | castelo com salão do trono |
| Orléans | (−1,5, +3,5) | a maior estação: muralha, ponte sobre o Loire, forte das Tourelles, 3 bastilhas inglesas |
| Reims | (+4,5, −4) | catedral estilizada |
| Compiègne | (+1, −5,5) | ponte levadiça |
| Ruão | (−5, −5) | castelo-tribunal e praça do mercado |
| Paris (só no fim) | (−0,5, −3) | estátua equestre dourada |

- **Território (s2–s3):** o chão do mapa ganha manchas.
  - Vermelho-terracota: ingleses e aliados borgonheses.
  - Azul: o lado de Carlos.
  - Selo "MAPA ESQUEMÁTICO" (fronteiras de 1429 aproximadas).
- **Escala (regra do usuário): é esquemática de propósito.**
  - As distâncias do mapa estão comprimidas: o selo diz "DISTÂNCIAS FORA DE ESCALA".
  - Dentro de cada estação, tudo segue UMA régua: **1 m = 0,06 u3d**. Pessoa 1,7 m = 0,10 u3d; torre de 15 m = 0,9 u3d; muralha de Orléans 8 m = 0,48 u3d.
  - Pessoas e mascote só aparecem nas estações, nunca soltos no mapa.
- **Personagens:**
  - **ela:** Person com túnica camponesa. Depois da s7, armadura de placas sem elmo e estandarte branco. Sempre em silhueta escura com contorno roxo e "?" até a revelação.
  - **Carlos:** manto azul, depois coroa.
  - **o capitão**, **os teólogos/juízes** (batina; o bispo de mitra), **soldados franceses** (azul) e **soldados ingleses** (vermelho-terracota): figurantes variados com `crowdLooks`.
  - **cavalos:** já aprovados.
  - **o mascote:** visita as estações e reage.
- **Fundo:** estúdio "história" `#2e1f3a`. Escurece no julgamento e na fogueira; acende no fim.
- **Fogueira (s15):** sem violência gráfica. Mostramos a estaca vazia, as chamas e a fumaça subindo, e a silhueta se apaga em luz. Nada de corpo queimando.

### Designs novos

São o primeiro passo da Fase 2: folha de design para a sua aprovação antes de animar.

1. Mapa-maquete do norte da França (relevo, rios, mar, manchas de território).
2. "Ela" camponesa (túnica, cabelo curto) e "ela" de armadura com estandarte, na silhueta com "?" e na versão revelada (sem rosto realista).
3. Carlos (manto e coroa), capitão, teólogo/juiz, bispo de mitra.
4. Soldado francês e soldado inglês (cota, capacete simples, arco/lança).
5. Castelo medieval modular (torres, muralha, portão, ponte levadiça).
6. Orléans: muralha, ponte, forte das Tourelles e bastilhas de madeira.
7. Catedral de Reims estilizada.
8. Salão do trono e sala do tribunal (bancos, mesa dos juízes).
9. Fogueira estilizada (estaca, lenha, fogo/fumaça).
10. Estátua equestre dourada (para o fim) e flechas.

## 2. Tabela cronológica

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 – 00:13:09 | 0 – 399 | Ela tinha dezessete anos, não sabia ler, e convenceu um príncipe a lhe dar um exército. Dois anos depois, foi queimada viva. Quem foi ela? Este é o Gigantes da Humanidade. | Abre em Orléans, plano médio baixo (d=2,4) na silhueta DELA de armadura com estandarte, à frente de soldados. Em "queimada", corte seco para Ruão: estaca e chamas (d=2,0). Em "Quem", recua para o mapa inteiro (d=26, el=48). | ELA (silhueta + "?"), estandarte branco, 6 soldados franceses, mascote ao lado; estaca, chamas e fumaça em Ruão; mapa completo. | `fx.flash` em W(s1,0) (fenda abre); `banner.wave` 0→1 contínuo; `army.show` stagger em "exército"; mascote acena (`mascot.wave`) em W(s1,4); em "queimada": corte + `fire.level` 0→1 (frames +0..+20) e `fx.desaturate` 0,6; mascote pulinho (`mascot.jump`); "Quem": dolly-out + `her.qmark` pop; cartão do quadro `series.card` entra em W(s1,"Este"), badges recolhidos. | ⚠ 17 ANOS · NÃO SABIA LER; ✖ QUEIMADA VIVA (2 anos depois); ❓ QUEM FOI ELA? (large); cartão GIGANTES DA HUMANIDADE · EP. 02 |
| 00:13:09 – 00:22:17 | 399 – 677 | Tudo começa num vilarejo da França, por volta de 1412, em plena Guerra dos Cem Anos. Os ingleses e seus aliados dominavam metade do país. | Chicote para o vilarejo (leste do mapa), d=3,2, el 18. Em "Guerra", sobe para o mapa (d=20, el=60) e o território se tinge. | Vilarejo: 5 casas, igreja, árvore, ovelhas, ELA menina (silhueta) com o mascote; manchas de território; selo MAPA ESQUEMÁTICO. | `fx.whipIn`; `year.1412` pop; `village.smoke` (fumaça das chaminés); em "Guerra": câmera sobe (interpolate 40 frames, inOut); `territory.english` 0→1 (vermelho cresce do norte, 50 frames) em "ingleses"; `territory.french` 0→1 (azul, sul). | ℹ POR VOLTA DE 1412; ℹ GUERRA DOS CEM ANOS (1337–1453); selo MAPA ESQUEMÁTICO |
| 00:22:17 – 00:30:04 | 677 – 904 | E o herdeiro do trono, Carlos, nem tinha sido coroado: um tratado prometia a coroa ao rei inglês. | Close na estação Chinon: Carlos sem coroa no salão (d=2,2). Em "tratado", um pergaminho surge e a coroa flutua até o lado inglês do mapa. | Carlos (manto azul, sem coroa), trono, pergaminho com selo, coroa dourada. | `crown.float` de Chinon até Ruão (arco, 60 frames) em "coroa"; `charles.slump` 0→1; `fx.shake` leve no selo; mascote coça o capacete (`mascot.look`). | ✖ HERDEIRO SEM COROA; ℹ TRATADO DE TROYES (1420) |
| 00:30:04 – 00:38:23 | 904 – 1163 | Aos treze anos, ela disse ouvir uma voz de Deus. A missão: expulsar os ingleses e levar Carlos para ser coroado. | Volta ao vilarejo, plano baixo (d=2,6) dela ao lado da árvore; raio de luz do alto. Em "missão", a câmera sobe e a fenda de luz desenha no mapa a rota vilarejo → Orléans → Reims. | Raio de luz (cone suave lavanda), ELA menina, rota tracejada roxa. | `voice.beam` 0→1 em "voz"; partículas de luz descendo; `route.draw` 0→1 (90 frames) em "missão"; ícones Orléans/Reims pop em "expulsar" e "coroado". | ℹ AOS 13 ANOS: "UMA VOZ DE DEUS" (relato dela no julgamento); ✔ MISSÃO: EXPULSAR · COROAR |
| 00:38:23 – 00:46:20 | 1163 – 1400 | Só que ela era uma camponesa. Pediu uma escolta ao capitão da cidade vizinha, e ele a mandou de volta para casa. | Estação Vaucouleurs: portão (d=2,4, az 20). Ela chega; o capitão aponta a estrada de volta. | Portão de castelo, capitão (armadura simples), ELA, guarda, mascote. | ELA anda até o portão (`her.walk`); `captain.point` em "mandou"; `gate.close` 0→1 + ✖; `fx.punch` em "volta"; mascote pulinho de surpresa. | ✖ CAMPONESA, SEM ESCOLTA; ✖ "VOLTE PARA CASA" |
| 00:46:20 – 00:55:07 | 1400 – 1657 | Ela voltou e insistiu até ele ceder. Vestida de homem, cruzou terras inimigas com seis soldados até o castelo do herdeiro. | Portão reabre; corte para a estrada noturna no mapa (céu escurece) com 7 cavaleiros em fila, tracking lateral (d=3,0). | 7 cavalos (aprovados), ELA com roupa masculina (silhueta), 6 soldados, lua, rota roxa avançando até Chinon. | `gate.close` 1→0 em "ceder"; `her.outfit` túnica→roupa masculina (troca em "Vestida"); `riders.x` ao longo da rota (linear); `sky.night` 0→1; trecho da rota em território vermelho pisca. | ✔ INSISTIU · ESCOLTA DE 6; ⚠ TERRAS INIMIGAS |
| 00:55:07 – 01:05:28 | 1657 – 1978 | Carlos desconfiou e mandou teólogos interrogarem ela por semanas. Não acharam nada de errado. Ela ganhou armadura, estandarte e um lugar no exército. | Salão de Chinon (d=2,8): teólogos em semicírculo em volta dela. Em "Não acharam", luz quente; em "armadura", órbita 360° curta enquanto a armadura monta peça por peça. | 4 teólogos, Carlos, ELA, armadura (peças), estandarte branco, mascote. | `theologians.ring` aparece em "teólogos"; `?` sobre as cabeças; "Não acharam": `?` → ✔; `armor.assemble` 0→1 (peças voam e encaixam, 60 frames); `banner.raise` 0→1; `fx.flash` leve; mascote comemora (`mascot.cheer`). | ❓ INTERROGADA POR SEMANAS; ✔ ARMADURA · ESTANDARTE · EXÉRCITO |
| 01:05:28 – 01:14:24 | 1978 – 2244 | O alvo era Orléans, cercada pelos ingleses havia meses. Se a cidade caísse, o caminho para o resto da França ficava aberto. | Grande plano de Orléans (d=7, el 40): muralha, ponte no Loire, Tourelles e bastilhas inglesas em volta. Em "caísse", o mapa mostra setas vermelhas descendo ao sul. | Orléans completa, 3 bastilhas, soldados ingleses, bandeiras vermelhas, setas no mapa. | `siege.ring` 0→1 (bastilhas acendem uma a uma, stagger 8 frames); `fx.whipIn`; em "caísse": câmera sobe (d=16) e `arrows.south` 0→1; `territory.english` pulsa. | ✖ ORLÉANS CERCADA (desde out. 1428); ⚠ SE CAIR, O SUL FICA ABERTO |
| 01:14:24 – 01:26:01 | 2244 – 2581 | Ela chegou no fim de abril de 1429. Os franceses tomaram os fortes ingleses um a um. Ela levou uma flechada e voltou para a luta. Em nove dias, o cerco acabou. | Tracking na margem do Loire (d=3,2). Bastilhas caem uma a uma (bandeira vermelha desce, azul sobe). Em "flechada", close (d=1,4) com tremor; depois ela levanta o estandarte nas Tourelles. Em "nove dias", plano aberto com a cidade livre. | Comboio entrando, bastilhas, flecha, Tourelles, contador "DIA 1 → DIA 9", mascote na muralha. | `convoy.enter` em "chegou"; `forts.fall` stagger 0→3 (cada forte: bandeira troca + poeira, `burst`); `arrow.hit` em "flechada" + `fx.shake`; `her.rise` 0→1 em "voltou"; contador `day` 1→9 (interpolate); `fx.flash` + confete azul em "acabou"; mascote comemora. | ℹ FIM DE ABRIL DE 1429; ⚠ FERIDA POR FLECHA; ✔ CERCO ACABOU EM 9 DIAS (8 de maio) |
| 01:26:01 – 01:33:14 | 2581 – 2804 | E ela nem lutava de espada: no julgamento, disse que carregava o estandarte para não matar ninguém. | Close lento (d=1,8) dela com o estandarte; espada embainhada na cintura. Comparação lado a lado: espada (cinza, ✖) × estandarte (✔). | Estandarte branco ondulando, espada embainhada, cartões 2D. | `banner.wave` amplitude ↑; cartões 2D `compare` slide-in em "espada" e "estandarte"; selo "RELATO DELA NO JULGAMENTO"; mascote aponta o estandarte (`mascot.point`). | ℹ ESTANDARTE, NÃO ESPADA; selo: relato dela no processo de 1431 |
| 01:33:14 – 01:43:03 | 2804 – 3093 | Depois, abriu caminho até Reims, a cidade onde os reis franceses eram coroados. Em julho de 1429, Carlos virou rei, com ela ao lado. | Rota roxa avança Orléans → Reims no mapa (d=18). Corte para a catedral (d=3,6, el 8, contra-plongée): Carlos ajoelhado, coroa desce; ela ao lado com o estandarte. | Catedral estilizada, Carlos, coroa, ELA, multidão, sinos, vitral com brilho. | `route.draw` até Reims; `crown.lower` 0→1 em "rei" (40 frames, out); `fx.flash` + confete dourado (`burst`); `bells` (sfx); `territory.french` cresce um pouco; mascote acena da multidão. | ✔ CARLOS COROADO (17 de julho de 1429); ℹ REIMS: CIDADE DAS COROAÇÕES |
| 01:43:03 – 01:49:22 | 3093 – 3292 | Mas a sorte virou. Em maio de 1430, ela foi capturada numa batalha e vendida aos ingleses. | Compiègne: ponte levadiça sobe com ela do lado de fora (d=2,6). Ela é cercada. Moedas e corrente: a silhueta é levada para Ruão no mapa. | Ponte levadiça, soldados borgonheses, moedas, corrente, rota vermelha até Ruão. | `fx.whipOut`; `drawbridge.raise` 0→1 em "virou"; `captors.close` 0→1; `coins.flow` em "vendida"; rota vermelha Compiègne → Ruão; `fx.desaturate` 0,4. | ✖ CAPTURADA (23 de maio de 1430); ✖ VENDIDA AOS INGLESES |
| 01:49:22 – 02:04:17 | 3292 – 3737 | Num tribunal da Igreja, dezenas de homens estudados tentaram provar que as vozes eram mentira. Perguntaram se ela estava na graça de Deus. Se dissesse sim, era arrogância. Se dissesse não, confessava culpa. | Sala do tribunal em Ruão (fundo escurece). Plano alto (d=3,4, el 35): bancos cheios de juízes, ela sozinha no centro. Em "graça", a pergunta vira duas portas: SIM e NÃO, ambas com ✖. | 20+ juízes, o bispo de mitra, mesa, ELA, duas "portas" 2D (armadilha), mascote no canto. | `court.fill` stagger; `bg.dim` 0→0,6; balão da pergunta pop em "graça"; `trap.yes` ✖ em "arrogância"; `trap.no` ✖ em "culpa"; `fx.punch` em cada ✖; câmera aproxima lentamente (dolly-in 3,4→2,4). | ✖ JULGADA POR HERESIA; ❓ "ESTÁ NA GRAÇA DE DEUS?"; ✖ SIM = ARROGÂNCIA · ✖ NÃO = CULPA |
| 02:04:17 – 02:15:10 | 3737 – 4060 | Ela respondeu: se não estou, que Deus me coloque nela. Se estou, que Deus me mantenha. Sem saber ler, deixou os juízes sem saída. | Close nela (d=1,6), luz quente só nela. As duas portas ✖ se fundem numa terceira saída ✔. Contra-plano: juízes paralisados. | Citação 2D em cartão, terceira porta ✔, juízes. | Citação aparece frase a frase (amarrada às palavras); `trap.third` 0→1 com brilho verde; `judges.freeze`; `fx.flash` leve; mascote comemora discretamente. | ✔ "SE NÃO ESTOU, QUE DEUS ME COLOQUE…" (registro do processo); ℹ SEM SABER LER |
| 02:15:10 – 02:25:18 | 4060 – 4368 | Mesmo assim, foi condenada, também por voltar a usar roupas de homem. Em 30 de maio de 1431, foi queimada viva em Ruão. Tinha dezenove anos. | Praça do mercado de Ruão, noite (d=4, el 20). A estaca já está lá; a silhueta some numa coluna de luz enquanto as chamas sobem. Câmera recua devagar. Fumaça sobe e corta para o rio. | Estaca, lenha, chamas, fumaça, multidão de costas, rio Sena; sem corpo queimando. | `bg.dim` 0,8; `verdict.stamp` (✖) em "condenada"; `fire.level` 0→1 (60 frames); `her.ascend` (silhueta vira luz e sobe); `fx.desaturate` 0,7; mascote abaixa a cabeça (`mascot.look` para baixo); música cai para quase silêncio. | ✖ CONDENADA (30 de maio de 1431); ℹ 19 ANOS |
| 02:25:18 – 02:33:27 | 4368 – 4617 | Vinte e cinco anos depois, um novo julgamento a declarou inocente. Em 1920, a Igreja que a condenou a declarou santa. | Volta ao mapa, dia nascendo (d=12). O carimbo "CONDENADA" vira "INOCENTE". Em "santa", a estação de Paris acende com a estátua dourada. | Pergaminho com carimbo, luz nascente, estátua equestre dourada, halo suave. | `fx.whipIn` + `bg.dim` 0,8→0; `stamp.flip` ✖→✔ em "inocente"; `year.1456` e `year.1920` pop; `statue.glow` 0→1 em "santa"; mascote pulinho. | ✔ INOCENTE (1456); ✔ SANTA (1920) |
| 02:33:27 – 02:42:26 | 4617 – 4886 | E ela nunca usou o nome que você conhece: se apresentava como Jeanne, a Donzela. Mas o mundo a conhece como Joana d'Arc. | Close na estátua (d=2,4, el 6). A silhueta com "?" se acende de dentro para fora (luz roxa→branca) e vira a figura colorida de armadura. Placa com o nome. | Placa 1: "JEHANNE · A DONZELA" (assinatura dela); placa 2 grande: "JOANA D'ARC"; confete. | `her.reveal` 0→1 em "conhece" (o "?" sobe e some); placa 1 em "Jeanne"; `fx.flash` + `burst` (confete roxo/dourado) em "Joana"; placa 2 com spring; mascote comemora (`mascot.cheer`). | ❓→✔ JEHANNE, "A DONZELA" (como ela assinava); JOANA D'ARC (large) |
| 02:42:26 – 02:55:00 | 4886 – 5250 | Pronto: agora você sabe quem foi a camponesa que coroou um rei. | Plano final aberto (d=22, el 40) do mapa com a rota completa acesa; deriva lenta. Encerramento da marca: a fenda se fecha (~5,5 s). | Mapa, rota completa, as 8 estações acesas, mascote acenando em Paris; encerramento da marca com logo e chamada. | `route.glow` 0→1; mascote acena (`mascot.wave`); cartão do quadro "GIGANTES DA HUMANIDADE · EP. 02" sai antes do encerramento; `BrandOutro` com a chamada falada `cta`. | ✔ A CAMPONESA QUE COROOU UM REI; encerramento: "Comente o próximo tema · siga e compartilhe" |

## 3. Estrutura de dados

Está completa em `scene-plan.ts`: tipos `VideoConfig` e `ScenePlan`, com as 18 cenas.

- A linha do tempo é determinística e derivada do frame: sem timers, sem `Date.now`, sem `Math.random` não semeado.
- Os componentes usam frames locais dentro de cada `Sequence`.
- A camada 3D (`@remotion/three` + R3F) tem o mapa, as estações e os personagens.
- A camada 2D tem badges, legendas, cartões (comparação, armadilha SIM/NÃO, citação, placas do nome) e o cartão do quadro.

## 4. Áudio e montagem

### Narração integral (412 palavras, ~153 s de fala estimada)

> Ela tinha dezessete anos, não sabia ler, e convenceu um príncipe a lhe dar um exército. Dois anos depois, foi queimada viva. Quem foi ela? Este é o Gigantes da Humanidade.
> Tudo começa num vilarejo da França, por volta de 1412, em plena Guerra dos Cem Anos. Os ingleses e seus aliados dominavam metade do país.
> E o herdeiro do trono, Carlos, nem tinha sido coroado: um tratado prometia a coroa ao rei inglês.
> Aos treze anos, ela disse ouvir uma voz de Deus. A missão: expulsar os ingleses e levar Carlos para ser coroado.
> Só que ela era uma camponesa. Pediu uma escolta ao capitão da cidade vizinha, e ele a mandou de volta para casa.
> Ela voltou e insistiu até ele ceder. Vestida de homem, cruzou terras inimigas com seis soldados até o castelo do herdeiro.
> Carlos desconfiou e mandou teólogos interrogarem ela por semanas. Não acharam nada de errado. Ela ganhou armadura, estandarte e um lugar no exército.
> O alvo era Orléans, cercada pelos ingleses havia meses. Se a cidade caísse, o caminho para o resto da França ficava aberto.
> Ela chegou no fim de abril de 1429. Os franceses tomaram os fortes ingleses um a um. Ela levou uma flechada e voltou para a luta. Em nove dias, o cerco acabou.
> E ela nem lutava de espada: no julgamento, disse que carregava o estandarte para não matar ninguém.
> Depois, abriu caminho até Reims, a cidade onde os reis franceses eram coroados. Em julho de 1429, Carlos virou rei, com ela ao lado.
> Mas a sorte virou. Em maio de 1430, ela foi capturada numa batalha e vendida aos ingleses.
> Num tribunal da Igreja, dezenas de homens estudados tentaram provar que as vozes eram mentira. Perguntaram se ela estava na graça de Deus. Se dissesse sim, era arrogância. Se dissesse não, confessava culpa.
> Ela respondeu: se não estou, que Deus me coloque nela. Se estou, que Deus me mantenha. Sem saber ler, deixou os juízes sem saída.
> Mesmo assim, foi condenada, também por voltar a usar roupas de homem. Em 30 de maio de 1431, foi queimada viva em Ruão. Tinha dezenove anos.
> Vinte e cinco anos depois, um novo julgamento a declarou inocente. Em 1920, a Igreja que a condenou a declarou santa.
> E ela nunca usou o nome que você conhece: se apresentava como Jeanne, a Donzela. Mas o mundo a conhece como Joana d'Arc.
> Pronto: agora você sabe quem foi a camponesa que coroou um rei.

**Encerramento fixo da marca:** "Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha!" (~4,3 s de fala, ~5,5 s de encerramento).

### Orçamento e ajuste

- Orçamento (`vo_budget.py`): fala 153,3 s + pausas 13,6 s + abertura 6,2 s = **173,1 / 175 s**, folga de 1,9 s.
- Depois do TTS real, os cortes seguem a voz (`timing.ts`).
- Se estourar, aplico nesta ordem:
  1. ":" → "," só no texto do TTS;
  2. velocidade da voz até +10%;
  3. pausas menores.

### Trilha e efeitos (gerados por código, sem direitos de terceiros)

**Intenções da trilha, uma por cena:**

| Cena | Intenção |
| --- | --- |
| s1 | tense |
| s2 | calm |
| s3 | curious |
| s4 | curious |
| s5 | tense |
| s6 | build |
| s7 | reveal |
| s8 | tense |
| s9 | build |
| s10 | calm |
| s11 | reveal |
| s12 | tense |
| s13 | tense |
| s14 | reveal |
| s15 | calm (quase silêncio) |
| s16 | build |
| s17 | reveal |
| s18 | resolve |

**HITS (pancadas da trilha):** "queimada" (s1), "acabou" (s9), "rei" (s11), "Joana" (s17).

**Efeitos:**
- whoosh (chicotes);
- clunk (portão);
- galope (s6);
- tick (contador de dias);
- thud (flechada);
- sinos (s11);
- correntes (s12);
- burburinho do tribunal (s13);
- fogo baixo (s15);
- shimmer (revelação).

Efeitos que talvez sejam novos no `sfx.py`: galope, sinos, fogo, correntes, burburinho. Na Fase 2 confiro quais já existem.

## 5. Critérios de aceite

Gancho imediato; cadeia de obstáculos clara; contexto antes de cada nome técnico; mapa persistente com a rota que avança; revelação sem spoiler antes da s17; leitura em celular; tabela completa; frames contíguos de 0 a 5250 (soma 175 s); narração idêntica à tabela; array consistente; nenhum asset alegado sem existir.

## 6. Verificação de fatos

| Afirmação | Situação | Fonte |
| --- | --- | --- |
| Nasceu c. 1412 | data aproximada, por isso "por volta de" | Britannica |
| Guerra dos Cem Anos (1337–1453); ingleses e borgonheses no norte | ✔ | Britannica |
| Tratado de Troyes (1420) deserdou o delfim Carlos | ✔ | Britannica |
| Voz aos 13 anos | ✔ relato dela no processo ("quando tinha 13 anos, ouviu uma voz de Deus") | Fordham Medieval Sourcebook |
| Baudricourt recusou e depois deu escolta; chegou a Chinon com 6 homens armados; roupa masculina desde Vaucouleurs | ✔ | encyclopedia.com, jeanne-darc.info |
| Interrogatório dos teólogos | ✔ em Poitiers, março de 1429; a duração exata varia, por isso "por semanas", sem número | |
| Orléans cercada desde out. 1428; ela chegou em 29/4/1429; Tourelles em 7/5 (ferida por flecha); cerco acabou em 8/5 = 9 dias | ✔ | History.com, Britannica |
| Estandarte "para não matar ninguém" | ✔ no registro do processo (tradução Scott); "nunca matei um homem" também aparece, mas cortei para caber | |
| Coroação em Reims | as fontes divergem entre 17 e 18 de julho de 1429; a fala diz só "julho" e o badge usa 17 (a data mais citada) | |
| Capturada em Compiègne, 23/5/1430, e vendida aos ingleses | ✔ o valor varia nas fontes, por isso não falo número | |
| Tribunal da Igreja (bispo Pierre Cauchon) e a resposta sobre a graça de Deus | ✔ registro do processo | Fordham, famous-trials.com |
| Condenação ligada a voltar a usar roupas masculinas (relapso) | ✔ "também", porque não foi o único motivo | |
| 30/5/1431, Ruão, 19 anos | ✔ | |
| Reabilitação em 1456 (7 de julho) = 25 anos depois | ✔ | |
| Beatificada em 1909; canonizada em 16/5/1920 por Bento XV | ✔ | |
| Nunca usou "Joana d'Arc": no processo se chamava "Jehanne la Pucelle" e assinava "Jehanne" | ✔ a forma "d'Arc" vem do nome do pai (Jacques d'Arc, com grafias variadas); o primeiro registro escrito do nome é de 1455 | |

**Cortado ou suavizado de propósito:**
- "reconheceu o rei disfarçado" (lenda popular, sem registro firme);
- o valor da venda;
- "bruxa": a acusação final foi heresia, não bruxaria;
- "padroeira da França": as fontes divergem entre 1920 e 1922.

**Fontes:**
- [Britannica — St. Joan of Arc](https://www.britannica.com/biography/Saint-Joan-of-Arc)
- [Fordham Medieval Sourcebook — Trial of Joan of Arc](https://sourcebooks.web.fordham.edu/source/1431joantrial.asp)
- [Famous Trials — Private examinations, 1431](https://famous-trials.com/the-trial-of-joan-of-arc-1431/2362-the-private-examinations-of-joan-march-4-17-1431)
- [History.com — Siege of Orléans](https://www.history.com/topics/middle-ages/siege-of-orleans)
- [History.com — 7 surprising facts](https://www.history.com/articles/7-surprising-facts-about-joan-of-arc)
- [Encyclopedia.com — Joan of Arc](https://encyclopedia.com/social-sciences/encyclopedias-almanacs-transcripts-and-maps/joan-arc-c-1412-1431)
- [jeanne-darc.info — Banner](https://www.jeanne-darc.info/biography/banner/)
- [Wikipedia — Canonization of Joan of Arc](https://en.wikipedia.org/wiki/Canonization_of_Joan_of_Arc)
- [National Geographic — Warrior, heretic, saint](https://www.nationalgeographic.com/history/history-magazine/article/joan-of-arc-warrior-heretic-saint-martyr)

## 7. Pontos fracos que eu já vejo

- **Volume de cenários:** são 10 designs novos, o maior pacote até agora. A folha de design vai ser grande, e o render deve passar de 2 h (será feito em trechos, como no Stonehenge).
- **O gancho entrega muito:** quem conhece história adivinha logo. Mantive assim porque é o fato mais forte; a alternativa seria abrir só com "17 anos, não sabia ler, comandou um exército", sem "queimada", mas perde impacto.
- **A fogueira** precisa ficar sóbria (luz e fumaça) para não pesar nem esbarrar em políticas das plataformas para conteúdo violento.
- **O mapa de 1429 é aproximado:** as fronteiras mudavam o tempo todo, daí o selo.

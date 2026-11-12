# Roteiro v1 — O buraco mais fundo do mundo (Poço Superprofundo de Kola)

**Status:** AGUARDANDO APROVAÇÃO — implementação e renderização não iniciadas.

## 1. Briefing de produção

- **Tema:** o Poço Superprofundo de Kola (SG-3), o buraco mais fundo já cavado na vertical, e o mito do "poço para o inferno".
- **Recorte:** desmentir o mito, mostrar a escala real e as três causas da parada (calor, rocha plástica, fim do dinheiro soviético).
- **Formato:** pergunta → revelação ("por que pararam?") com um fio condutor de fatos: a descida pelo furo.
  - Por quê: o gancho é um mistério falso. A pergunta segura a atenção e a descida dá sensação de avançar.
- **Público e objetivo:** leigo. Sair sabendo que o poço existe, quão fundo foi, por que parou e que a história do inferno é boato.
- **Duração:** 1:55 (115 s, 3450 frames). O orçamento estimou 114 s.
  - É mais que os 90 s padrão porque o vídeo tem mito, desmentido, escala, três surpresas e três causas.
  - Cortei o fato da camada de basalto ausente: a fonte é fraca e alongava o vídeo.
- **Formato técnico:** 1080 × 1920, 9:16, 30 fps, pt-BR. Timestamps em MM:SS:FF; intervalos [início, fim).
- **Tom:** informal, ágil, com suspense no começo e virada no "Era boato".
- **TTS:** edge-tts `pt-BR-AntonioNeural`, rate +4% (cta +0%). Só no texto enviado ao TTS, ":" vira ",".
- **Paleta da trilha:** `misterio` (Dó# menor, caixinha de música, cordas escuras). Os dois últimos vídeos foram de história.
  - O tema da marca toca no gancho, nas revelações (s3 "BOATO", s7 recorde, s12 "0,2%") e no encerramento.
- **Direção de arte, diferente do poço artesiano:** o poço artesiano era um bloco de terreno em corte visto de lado.
  - **Superfície:** uma estação na tundra nevada (torre de perfuração fechada, galpões, neve caindo, luz fria).
  - **Coluna:** uma fatia de rocha alta e estreita, flutuando no escuro, por onde a câmera DESCE junto com uma broca luminosa.
  - **Medidor:** um medidor de profundidade (HUD) conta os metros.
  - **Calor:** a rocha vai de cinza-azulado a laranja e a vermelho incandescente.
  - **Mito:** a mesma coluna fica vermelho-inferno, com fogo e um microfone pendurado.
  - **Escala:** uma régua com Everest, Fossa das Marianas e Kola lado a lado.
  - **Final:** um globo em corte mostra o furo como um arranhão.
  - **Fundo:** estúdio escuro, tinta `#241a33`, puxando para `#3a1414` nas cenas de calor e de mito.
- **Mascote:**
  - visita a estação na superfície;
  - flutua ao lado da coluna durante a descida, como uma visita guiada;
  - reage ao mito (pula), aos fósseis (aponta), aos 180 °C (pula) e ao fim (senta na tampa e acena).
- **Designs novos, que precisam de aprovação na folha de design (Fase 2, 1º passo):**
  1. Estação SG-3 (torre de perfuração fechada, galpões, laje de concreto) e a versão abandonada.
  2. Placa de tundra com neve, arbustos baixos e pedras.
  3. Broca, coluna de hastes e boca do furo (23 cm), com régua.
  4. Coluna de rocha em camadas, com rachaduras, água e brilho de calor.
  5. Microfone da lenda, com cabo.
  6. Fósseis microscópicos de plâncton (5 formas low-poly) e lupa.
  7. Régua de escala: Everest, oceano com a Fossa das Marianas e linha do poço de Kola.
  8. Globo terrestre em corte (crosta, manto, núcleo externo, núcleo interno) e pino de mapa.
  9. Tampa de metal enferrujada soldada.
  10. Termômetro 2D e pilha de moedas.
- **Já aprovados:** mascote e pessoas (operários com roupa de inverno).
- **Selo "ESCALA ESQUEMÁTICA":** sempre que a coluna ou o globo aparecem. A largura do furo é exagerada e a crosta do globo, engrossada.

**O que se constrói:** uma descida pela coluna de rocha, da tundra até 12.262 m. O caminho tem o mito (vermelho), a escala (Everest e Marianas), as surpresas (água e fósseis) e o porquê da parada (180 °C, rocha mole, fim da URSS). Depois a câmera se afasta até o globo inteiro e termina na tampa enferrujada.

## 2. Tabela cronológica (estimativa até o TTS; a voz real decide os cortes)

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:10:11 | 0 - 311 | Os soviéticos cavaram um buraco de doze quilômetros para dentro da Terra. Dizem que pararam porque ouviram gritos. A verdade é mais estranha. | Abertura da fenda sobre a estação na tundra (plano aberto, az 32°, el 26°). A câmera aproxima-se da torre e DESCE pela coluna seguindo a broca até o fundo.<br>Em "Dizem", corte para o fundo tingido de vermelho (lenda); em "A verdade", punch-in e leve recuo. | Estação SG-3, tundra, coluna de rocha (abre em corte), broca, HUD de profundidade, selo esquemático, tinta vermelha da lenda, mascote acenando na neve. | `fx.flash(0)`; `shaft.open` 0→1 (W4–W6); `drill.y` 0→−24,52 u3d e `depthHud.km` 0→12,262 (W5–W11, in); `myth.k` 0→1 (W12, 18 f); `myth.screams` spring (W16); `fx.shake` (W17); `fx.punch` (W18); `mascot.wave` (W1). | 12 KM PARA DENTRO DA TERRA (info, W6–W12) · GRITOS LÁ EMBAIXO? (atenção, W16–W18) · A VERDADE É MAIS ESTRANHA (atenção, grande, W18). Legenda: doze, quilômetros, gritos, estranha. |
| 00:10:11 - 00:18:13 | 311 - 553 | Em 1989, rodou o mundo a história do poço para o inferno: microfone no fundo, gritos, calor de mais de mil graus. | Topo da coluna vermelha (az 15°). Recortes de jornal 2D entram dos lados. Um microfone desce pelo cabo e a câmera o acompanha até o fundo em brasa. | Coluna tingida, microfone com cabo, partículas de fogo, recortes de jornal 1989 (overlay sem nomes de veículos reais), mascote flutuando. | `myth.k` = 1; `news.cards` spring (W1); `mic.y` −0,5→−21 u3d (W12–W15, in); `myth.waves` (ondas vermelhas) spring (W15); `flames.level` 0,3→1 (W16–W21); `mascot.jump` (W15). | A LENDA DE 1989 · o "poço para o inferno" (atenção, W1–W12) · +1.000 °C · GRITOS · segundo a lenda (vermelho, W16). |
| 00:18:13 - 00:24:26 | 553 - 746 | Era boato. O áudio era uma montagem de efeitos sonoros, e o poço nem ficava na Sibéria. | Carimbo BOATO com tremor; o vermelho escoa e a coluna volta ao normal. A onda de áudio 2D se parte em pedaços rotulados como "efeitos". Corte para o globo com um pino na Sibéria, riscado. | Carimbo, onda de áudio fragmentada, globo (Rússia), pino riscado. | `fx.whipIn`; `stamp.boato` spring + `fx.shake` (W1); `myth.k` 1→0 (W1, 20 f); `waveform.split` 0→1 (W6–W9); `fx.desaturate` (W2–W9); `pin.siberia` (W15), `pin.siberiaCross` (W16). | BOATO (vermelho, grande, W1–W10) · ÁUDIO = EFEITOS SONOROS MONTADOS (W6–W10) · NEM ERA NA SIBÉRIA (W14). |
| 00:24:26 - 00:34:00 | 746 - 1020 | O de verdade fica em Kola, no extremo norte da Rússia. Começou em 1970, com uma missão: furar a crosta e ver o que tem lá dentro. | O globo gira até a península de Kola e o pino é fincado (aproximação). Corte para a estação: neve, luzes acendendo, operários. A câmera desce até o topo da coluna, que se abre (camadas). | Globo, pino Kola, estação, 5 operários (crowdLooks "inverno"), coluna. Mascote anda até a boca do furo. | `globe.spin` 0→1 (0–W5); `pin.kola` (W5); `station.lights` 0→1 (W11–W13); `year.1970` (W12); `shaft.open` (W18–W20); `mascot.walk` (W11–W16), `mascot.point` (W18). | PENÍNSULA DE KOLA · RÚSSIA (info, W5–W11) · DESDE 1970 (info, W12) · MISSÃO: FURAR A CROSTA · pesquisa científica, não petróleo (info, W16). |
| 00:34:00 - 00:39:08 | 1020 - 1178 | O furo tem só vinte e três centímetros de largura. Mas foi descendo. | Close da boca do furo, com régua de 23 cm e um operário ao lado para escala. Em "Mas", a câmera sobe e mergulha pela coluna seguindo a broca. | Boca do furo, régua 23 cm, pessoa 1,7 m, broca, HUD. | `ruler.show` (W4); `mascot.point` (W5); `drill.y` 0→−8 u3d e `depthHud.km` 0→4 (W11–fim, in); `rock.heat` 0→0,15. | SÓ 23 CM DE LARGURA · um prato raso (info, W4). |
| 00:39:08 - 00:47:10 | 1178 - 1420 | Com oito quilômetros e meio, já era mais fundo que o Everest é alto. Com onze, mais fundo que a Fossa das Marianas. | A broca chega a 8,85 km (rocha alaranjada). Corte para a régua de escala (frontal): o Everest sobe acima do nível do mar e a linha de Kola desce até a mesma medida. Depois o oceano e a Fossa aparecem, e a linha de Kola passa dela. | Régua: nível do mar, Everest (2,21 u3d), oceano/Fossa (2,73), linha Kola. Mascote flutuando. | `drill.y` → −17,7 (0–W4); `rock.heat` 0,15→0,45; `scale.everest` (W9); `scale.kola` 0→0,72 (W9–W13); `scale.marianas` (W19); `scale.kola` 0,72→0,90 (W16–W22). | EVEREST: 8.849 M (info, W10–W15) · FOSSA DAS MARIANAS: ~10.900 M (info, W20). |
| 00:47:10 - 00:57:11 | 1420 - 1721 | Em 1989, chegou a 12.262 metros. Poços de petróleo já foram mais compridos, mas inclinados. Na vertical, ninguém desceu tanto. | Na régua, a linha de Kola chega ao fim com clarão. Uma linha curva de poço de petróleo se desenha, longa mas rasa na vertical. Uma guia vertical compara as duas profundidades. | Régua, recorde, poço inclinado (curva), guia vertical. Mascote comemora. | `scale.kola` 0,90→1 (0–W4); `scale.record` spring + `fx.flash` (W4); `scale.oilDraw` 0→1 (W6–W12); `scale.verticalGuide` (W15–W16); `mascot.cheer` (W4). | 12.262 M · 1989 · poço SG-3 (verde, grande, W4–W6) · MAIS COMPRIDO ≠ MAIS FUNDO · poços de petróleo vão de lado (atenção, W12) · RECORDE NA VERTICAL (verde, W16). |
| 00:57:11 - 01:08:03 | 1721 - 2043 | Lá embaixo, surpresas: rocha rachada e cheia de água, onde ninguém esperava. E fósseis microscópicos de plâncton, com uns dois bilhões de anos. | Volta à coluna, a ~4,5 km: rachaduras se abrem e gotas de água brilham. Desce a ~6,7 km: lupa sobre a rocha com 5 fósseis de plâncton girando. | Rachaduras com partículas de água, lupa, 5 microfósseis, mascote com lanterna. | `cracks.open` (W3–W5); `water.flow` (W6–fim); `lens.show` (W13); `fossils.reveal` (W14–W17); `fossils.spin`; `mascot.jump` (W2), `mascot.point` (W13). | ÁGUA A KM DE PROFUNDIDADE (atenção, W5–W12) · FÓSSEIS DE PLÂNCTON · ~2 bilhões de anos · a quase 7 km (atenção, W15). |
| 01:08:03 - 01:14:25 | 2043 - 2245 | Então por que pararam? Esperavam cem graus no fundo. Encontraram cento e oitenta. | Mergulho até o fundo (12,262 km). Termômetro 2D: a marca "esperado" sobe até 100; em "Encontraram", o "real" dispara até 180 e a rocha fica incandescente. | Broca no fundo, termômetro, coluna vermelha, mascote. | `drill.y` → −24,52 (0–W4); `thermo.expected` 0→100 (W4–W7); `thermo.real` 100→180 (W9–W12, out); `rock.heat` 0,6→1; `fx.punch` (W10); `mascot.jump` (W10). | POR QUE PARARAM? (atenção, W0–W4) · ESPERADO: 100 °C (info, W4–W9) · REAL: 180 °C (vermelho, grande, W9). |
| 01:14:25 - 01:21:04 | 2245 - 2434 | Nesse calor, a rocha fica mole, quase massinha, e vai fechando o furo atrás da broca. | Close na broca: as paredes do furo amolecem (ondulação) e se fecham atrás dela; a broca gira cada vez mais devagar e trava. | Paredes deformáveis do furo, broca. | `rock.soft` 0→1 (W3–W6); `walls.squeeze` 0→1 (W9–fim); `drill.spin` 1→0,2 (0–W12); `fx.shake` (W10). | ROCHA MOLE · o calor deixa a rocha plástica (vermelho, W5–W10) · O FURO SE FECHA (vermelho, W10). |
| 01:21:04 - 01:28:10 | 2434 - 2650 | Tentaram até 1992 e não passaram dos doze quilômetros. Aí a União Soviética acabou, e o dinheiro também. | A broca tenta descer 3 vezes e trava (contador 1989→1992). Corte para a estação: pilha de moedas encolhe, luzes apagam, operários vão embora, imagem dessatura. | Broca, contador de anos, estação, moedas, operários. | `drill.tries` 0→3 (0–W8); `year.count` 1989→1992 (W1–W3); `coins.show` (W9); `coins.level` 1→0 (W13–W17); `station.lights` 1→0,15; `people.leave`; `fx.desaturate`. | 1989 → 1992 · sem passar dos 12 km (vermelho, W2–W9) · FIM DA URSS · 1991 · acabou o dinheiro (vermelho, W12). |
| 01:28:10 - 01:36:05 | 2650 - 2885 | E o mais estranho: isso é menos de 0,2% do caminho até o centro da Terra. Nem a casca do planeta foi furada. | Começa colado na superfície do globo, com a lupa sobre o furo (um arranhão). Em "menos", a câmera se afasta muito e o globo abre uma cunha. Uma linha vai da superfície ao centro; a crosta brilha. | Globo em corte, lupa no furo, linha do raio, faixa da crosta, selo. | `hole.mark` (0); `globe.cut` 0→1 (W6–W10); `radius.draw` (W9–W15); `percent.badge` + `fx.punch` (W8); `crust.glow` (W16–W22). | < 0,2% DO CAMINHO · 12 km de 6.371 km (atenção, grande, W8–W16) · NEM ATRAVESSOU A CROSTA · a crosta continental tem ~35–40 km (atenção, W17). |
| 01:36:05 - 01:55:00 | 2885 - 3450 | Hoje, o buraco mais fundo do mundo é uma tampa de metal enferrujada. Pronto: agora você sabe. No fundo do poço não tinha inferno. Tinha calor, rocha mole e falta de dinheiro. | Close da tampa enferrujada na laje, com neve caindo e ruínas da estação ao fundo; o mascote sentado na tampa. A câmera se afasta para o plano final. Três ícones resumem as causas. Depois, o encerramento fixo da marca (~5,7 s). | Tampa, ruínas, neve, 3 ícones (termômetro, rocha, moeda), mascote. | `station.ruin` = 1; `snow.fall`; `mascot.wave` (W13); `mascot.cheer` (W24); `summary.heat/rock/money` springs (W25/W26/W29); encerramento: `fenda-close`. | HOJE: UMA TAMPA ENFERRUJADA (info, W9–W17) · NÃO ERA INFERNO · calor · rocha mole · falta de dinheiro (verde, W21). Encerramento: "Comente o próximo tema · siga e compartilhe". |

## 3. State / Props

Ver `scene-plan.ts`: tipos `VideoConfig`/`ScenePlan`, poses de câmera, 13 cenas e 3450 frames.
- A linha do tempo é determinística, derivada do frame: sem timers nem `Math.random` sem semente.
- A camada 3D usa @remotion/three + R3F (estação, coluna, régua, globo). A camada 2D tem badges, legendas, HUD de profundidade, termômetro, carimbo, onda de áudio e recortes.

## 4. Áudio e montagem

**Narração integral (270 palavras nas cenas):**

Os soviéticos cavaram um buraco de doze quilômetros para dentro da Terra. Dizem que pararam porque ouviram gritos. A verdade é mais estranha. Em 1989, rodou o mundo a história do poço para o inferno: microfone no fundo, gritos, calor de mais de mil graus. Era boato. O áudio era uma montagem de efeitos sonoros, e o poço nem ficava na Sibéria. O de verdade fica em Kola, no extremo norte da Rússia. Começou em 1970, com uma missão: furar a crosta e ver o que tem lá dentro. O furo tem só vinte e três centímetros de largura. Mas foi descendo. Com oito quilômetros e meio, já era mais fundo que o Everest é alto. Com onze, mais fundo que a Fossa das Marianas. Em 1989, chegou a 12.262 metros. Poços de petróleo já foram mais compridos, mas inclinados. Na vertical, ninguém desceu tanto. Lá embaixo, surpresas: rocha rachada e cheia de água, onde ninguém esperava. E fósseis microscópicos de plâncton, com uns dois bilhões de anos. Então por que pararam? Esperavam cem graus no fundo. Encontraram cento e oitenta. Nesse calor, a rocha fica mole, quase massinha, e vai fechando o furo atrás da broca. Tentaram até 1992 e não passaram dos doze quilômetros. Aí a União Soviética acabou, e o dinheiro também. E o mais estranho: isso é menos de 0,2% do caminho até o centro da Terra. Nem a casca do planeta foi furada. Hoje, o buraco mais fundo do mundo é uma tampa de metal enferrujada. Pronto: agora você sabe. No fundo do poço não tinha inferno. Tinha calor, rocha mole e falta de dinheiro.

**Encerramento fixo da marca:** "Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha!" (~4,3 s de fala, ~5,7 s de encerramento).

**Tempo:**
- Estimado em 101,5 s de fala, 6,6 s de pausas (0,55 s) e 6,2 s de abertura e respiro: 114,3 s de 115 s.
- Depois do TTS real, os cortes passam a vir da voz. Se não couber, a ordem é: ":"→"," no texto do TTS, depois pausas menores, depois rate até +8%.

**Efeitos:**
- Já existem: fenda-open/close, drill, dive, thud, whoosh(-soft/-big), clunk, pop, tick, ding, badge, buzz, crumble, bubbles, shimmer, pressure, rumble-soft, glow, final, fire.
- Novos: `screams-fake`, `cable`, `record-scratch`, `wind-cold`, `power-down`.
  - O `screams-fake` é um grito abafado e distorcido, sintetizado e baixo. Não é gravação de pessoa real.

**Trilha:** paleta `misterio`.
- INTENTS: tense, tense, reveal, curious, curious, build, reveal, curious, tense, tense, calm, reveal, resolve.
- HITS em "gritos" (s1), "boato" (s3), "cento e oitenta" (s9) e "0,2%" (s12).

**Legendas:** palavra a palavra, com tempos finais só depois do alinhamento com o áudio.

## 5. Verificação de fatos (o que entra e com que cuidado)

| Afirmação | Situação | Fonte |
| --- | --- | --- |
| Perfuração começou em 1970 (maio) | confirmado | Atlas Obscura; EarthDate |
| 12.262 m, ramo SG-3, 1989 | confirmado (uma fonte cita junho de 1990 como data de pane nessa profundidade; usamos 1989) | Wikipedia; EarthDate |
| Furo com ~23 cm (9 pol.) | confirmado | Atlas Obscura |
| Esperavam ~100 °C, acharam ~180 °C | confirmado | EarthDate; Wikipedia |
| Rocha "plástica" fechando o furo | apoiado (EarthDate; Damn Interesting); dito como simplificação ("quase massinha") | EarthDate; Damn Interesting |
| Tentaram até 1992 sem passar da marca de 1989 | apoiado (EarthDate). O projeto inteiro foi até 1994–95 e fechado de vez em 2005; por isso só dizemos "tentaram até 1992" | EarthDate; Wikipedia |
| Fim da URSS e falta de verba | confirmado (URSS dissolvida em dez/1991) | Wikipedia; Damn Interesting |
| Água em rocha rachada a vários km | confirmado (3–6 km nas fontes) | Atlas Obscura; ZME Science |
| Microfósseis de plâncton com ~2 bilhões de anos a ~6,7 km | confirmado em fontes secundárias (24 espécies) | Wikipedia; ZME Science |
| Poços de petróleo mais compridos (12,3–13,5 km), mas inclinados | confirmado (Z-44 Chayvo 12.376 m; O-14 13.500 m de comprimento) | Maritime Executive; Rosneft |
| Mito: surgiu em 1989, áudio montado, "Sibéria" | confirmado (Skeptoid, Deseret News 1991, Christianity Today 1990). Não dizemos de qual filme veio o áudio: as fontes só dizem "às vezes identificado" | Skeptoid; Deseret News; Christianity Today |
| Everest 8.849 m; Marianas ~10.900 m; raio da Terra 6.371 km; crosta continental ~35–40 km | dados de referência; Marianas arredondado com "~" porque as medições variam | — |
| 12,262 / 6.371 = 0,19% | cálculo ("menos de 0,2%") | — |

**Cortado:** "a camada de basalto não estava lá". Só achei em fontes secundárias fracas, e o vídeo ficaria mais longo.

## 6. Critérios de aceite

- Gancho imediato: buraco, gritos e "a verdade é mais estranha" nos primeiros 10 s.
- Virada clara no "Era boato".
- A pergunta "por que pararam?" é respondida com três causas visíveis.
- Fio condutor persistente: a mesma coluna e a mesma broca, com o medidor de profundidade sempre coerente com a narração.
- Selo esquemático presente; nenhuma régua contradiz a fala:
  - a linha de Kola passa do Everest em 8,85 km e da Fossa em ~10,9 km;
  - no globo, o furo continua minúsculo.
- O badge "MAIS COMPRIDO ≠ MAIS FUNDO" deixa o recorde honesto.
- Tabela com 13 linhas, frames contíguos de 0 a 3450 e soma exata.
- `scene-plan.ts` consistente com a tabela.
- Leitura no celular: badges no topo, legenda em ~1418 px, mascote fora dos badges.
- Nada foi renderizado, ouvido ou validado nesta fase.

## 7. Pontos fracos (honestos)

- **Duração:** 1:55 é longo para um Short viral. Se você quiser 90 s, o candidato a corte é a s8 (água e fósseis). É a parte mais "curiosidade" e menos ligada ao fio da pergunta.
- **Proximidade com o poço artesiano:** a broca descendo em corte ainda lembra aquele vídeo. Por isso a coluna flutuante, o HUD, o calor por cor e os cenários de mito, régua e globo.
- **Superlativo:** "buraco mais fundo do mundo" vale para profundidade vertical. Poços de petróleo são mais compridos. O roteiro diz isso (s7) em vez de esconder.
- **O mito tem detalhes discordantes nas fontes** (jornal finlandês, emissora, qual filme). O roteiro só afirma o que todas concordam: surgiu em 1989, o áudio era montado e a localização estava errada.
- **Não ouvi nada:** pronúncia de "Kola" e "12.262" a conferir no TTS.

## Fontes

- Wikipedia — Kola Superdeep Borehole: https://en.wikipedia.org/wiki/Kola_Superdeep_Borehole
- Wikipedia — Well to Hell: https://en.wikipedia.org/wiki/Well_to_Hell
- EarthDate — Kola Superdeep: https://www.earthdate.org/episodes/kola-superdeep
- Atlas Obscura — Kola Superdeep Borehole: https://www.atlasobscura.com/places/kola-superdeep-borehole
- ZME Science: https://www.zmescience.com/science/geology/worlds-deepest-hole-lies-beneath-rusty-metal-cap-kola-superdeep-borehole
- Damn Interesting — The Deepest Hole: https://www.damninteresting.com/the-deepest-hole/
- Skeptoid #4307: https://skeptoid.com/episodes/4307
- Deseret News (1991): https://www.deseret.com/1991/5/15/18920868/story-of-the-well-to-hell-digs-up-chuckles-not-screams-of-the-damned
- Christianity Today (1990): https://www.christianitytoday.com/1990/07/scientists-discover-hell-in-siberia/
- Maritime Executive — Sakhalin-1 record: https://maritime-executive.com/article/sakhalin-1-sets-another-drilling-record
- Rosneft: https://rosneft.com/press/today/item/175093/

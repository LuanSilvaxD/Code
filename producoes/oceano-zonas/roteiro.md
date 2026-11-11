# Roteiro v2: As zonas de profundidade do oceano (2:55)

> Status: **AGUARDANDO APROVAÇÃO** — implementação e renderização não iniciadas.
> Convenção: timestamps MM:SS:FF a 30 fps (FF 00–29); frames em intervalo semiaberto [início, fim).
> Os tempos são estimativas. Depois de gravar a narração, os cortes passam a seguir a voz real.

## 1. Briefing de produção

- **Tema:** as 5 zonas de profundidade do mar aberto, na divisão do NOAA:
  - **sol** (epipelágica, 0–200 m);
  - **crepúsculo** (mesopelágica, 200–1.000 m);
  - **meia-noite** (batipelágica, 1.000–4.000 m);
  - **abismo** (abissopelágica, 4.000–6.000 m);
  - **hadal** (6.000 m até o fundo das fossas, ~11.000 m).
- **Formato: FATOS / DOCUMENTÁRIO.** O tema é "para conhecer", não tem mecanismo para resolver.
  - **Fio condutor:** uma descida contínua da superfície até o fundo da fossa mais funda.
  - Cada zona muda o mesmo cenário: a luz some, a cor esfria, a pressão sobe, aparecem outros seres.
  - **Gancho:** o fato mais visual (o Everest cabe na fossa).
  - **Fecho:** o fato mais forte (em escala real, a luz é só uma faixa fininha).
- **Público:** leigo.
- **Duração: 2:55** (175 s, 5250 frames), igual ao EP. 01 (Marie Curie), a seu pedido. O tempo extra virou mais fatos verificados, não pausa:
  - as cores somem e o vermelho vai primeiro;
  - o copinho de isopor encolhido;
  - a luz na barriga como camuflagem;
  - o tamboril e o "vermelho invisível";
  - o peixe-caracol a 8.336 m;
  - mais gente já foi ao espaço do que ao fundo do mar;
  - menos de 1/3 do fundo do mar está mapeado.
- **Formato técnico:** 1080 × 1920, 30 fps, pt-BR, tom didático com clima de mergulho.
- **Cenário:**
  - **Coluna A:** um corte de oceano em pé sobre o pedestal, com as 5 zonas empilhadas e uma régua de profundidade. As faixas são esticadas para caber, com selo "ESQUEMA · FAIXAS FORA DE ESCALA".
  - **Coluna B:** ao lado, a mesma coluna em **escala real** (1 km = 1 bloco). É onde aparece o Everest no gancho e onde a zona do sol vira uma faixa fininha no fim.
  - O Everest **nunca** aparece na coluna esticada, porque ali a comparação ficaria falsa.
- **Mascote:** desce dentro de uma **batisfera** (esfera de vidro com farol), boiando como no espaço. Acena no gancho, se assusta com a pressão e com o cachalote, e comemora no fim.
- **Fundo:** estúdio com tom oceano (`#182a4e`), que escurece conforme a câmera desce.
- **Designs novos, para você aprovar antes de entrarem no vídeo** (folha de design será o 1º passo da Fase 2):
  1. batisfera com o mascote dentro
  2. tartaruga marinha
  3. golfinho
  4. peixe-lanterna
  5. tamboril
  6. camarão vermelho de águas profundas
  7. água-viva bioluminescente
  8. cachalote
  9. lula
  10. pepino-do-mar
  11. peixe-caracol
  12. Monte Everest low-poly
  - Também entra um prop simples, o copinho de isopor normal × encolhido.
- **Já aprovados:** barco de pesca e peixe (cardume na zona do sol).
- **TTS:** edge-tts `pt-BR-AntonioNeural`, +4% (gratuito); chamada da marca em +0%.

## 2. Tabela cronológica

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 – 00:09:21 | 0 – 291 | O Monte Everest inteiro cabe no ponto mais fundo do oceano, e ainda sobram dois quilômetros de água por cima. Vamos descer até lá? | Coluna B inteira (d=30) → fossa (d=16) → chicote para o topo da coluna A. | Coluna B em escala real; Everest; colchete "2 km". | `everest.rise`; `bracket.water`; mascote acena ("Vamos"); `fx.whipOut`. | ℹ EVEREST: 8.849 m; ℹ FOSSA: ~10.935 m; ⚠ +2 km DE ÁGUA POR CIMA |
| 00:09:21 – 00:22:06 | 291 – 666 | Os primeiros duzentos metros são a zona do sol, a única parte bem iluminada. É aqui que vive a maior parte da vida marinha que você conhece: tartarugas, golfinhos e cardumes. | Superfície → desce entre a vida da zona do sol. | Ondas, Sol, barco, raios de luz; tartaruga, golfinhos, cardume. | `fx.whipIn`; `sunRays.show`; `zone.sun`; `turtle/dolphins/school.show` (spring, em cada palavra). | ℹ ZONA DO SOL — 0 a 200 m · epipelágica |
| 00:22:06 – 00:31:12 | 666 – 942 | E também algas microscópicas. Elas fazem fotossíntese como as plantas, e o oceano produz cerca de metade do oxigênio do planeta. | Close nas algas. | Fitoplâncton + lupa 2D; bolhas de O₂; cartão "metade". | `plankton.show`; `magnifier.show`; `o2.flow`; `o2Card.show` ("metade"). | ✔ ~METADE DO OXIGÊNIO — vem do oceano (NOAA) |
| 00:31:12 – 00:41:00 | 942 – 1230 | Só que a luz não desce inteira. O vermelho é a primeira cor que a água apaga, por isso, quanto mais fundo, mais tudo fica azul. | Desce devagar. | Barra 2D do arco-íris na régua; boia vermelha que fica cinza ao afundar. | `colorBar.show`; `colorBar.fadeRed`; `redBall.depth`; `light.depth` 0→0,25. | ℹ VERMELHO SOME PRIMEIRO — depois laranja, amarelo, verde… |
| 00:41:00 – 00:52:06 | 1230 – 1566 | E a pressão aumenta rápido: a cada dez metros, ela sobe o peso de uma atmosfera inteira. Um copinho de isopor que desce bem fundo volta todo encolhido. | Acompanha a batisfera → close nos copinhos. | Setas de pressão, medidor "atm", copinho normal × encolhido. | `gauge.atm`; `pressure.arrows`; `cups.show`; `cups.shrink`; mascote pulinho. | ⚠ +1 ATM A CADA 10 m; ℹ O ISOPOR ENCOLHE |
| 00:52:06 – 01:04:12 | 1566 – 1932 | De duzentos a mil metros fica a zona do crepúsculo, só com um restinho de luz azul. Muitos peixes daqui têm olhos enormes e luzinhas na barriga, para sumir contra a claridade de cima. | Chega a 600 m → câmera por baixo dos peixes, olhando para cima. | Peixes-lanterna (olhos grandes, luz na barriga). | `light.depth`→0,45; `zone.twilight`; `lantern.show`; `lantern.bellyGlow`; `lantern.hide` (somem contra a claridade). | ℹ ZONA DO CREPÚSCULO — 200 a 1.000 m; ✔ LUZ NA BARRIGA = CAMUFLAGEM |
| 01:04:12 – 01:15:18 | 1932 – 2268 | E toda noite, bilhões de animais sobem daqui para comer perto da superfície e voltam antes do amanhecer. É a maior migração do planeta, e acontece todo dia. | Abre (d=15) para ver o cardume subir e descer. | Cardume grande; ícone sol/lua. | `dayNight.night`; `lantern.migrate` sobe ("sobem") e volta ("voltam"). | ✔ A MAIOR MIGRAÇÃO DO PLANETA |
| 01:15:18 – 01:26:03 | 2268 – 2583 | Passou de mil metros, escuridão total. É a zona da meia-noite: a água fica perto de quatro graus, e a única luz vem dos próprios animais. | Órbita no escuro. | Farol da batisfera; águas-vivas brilhando. | `light.depth`→1; `podLamp.on`; `zone.midnight`; `temp.show`; `biolum.show`. | ℹ ZONA DA MEIA-NOITE — 1.000 a 4.000 m; ✔ LUZ DOS PRÓPRIOS ANIMAIS |
| 01:26:03 – 01:38:06 | 2583 – 2946 | O tamboril balança uma isca que brilha para atrair presas até a boca. E muitos bichos daqui são vermelhos, porque sem luz vermelha, o vermelho fica preto, quase invisível. | Close no tamboril → camarão vermelho. | Tamboril com isca; camarão vermelho. | `angler.lure`; `angler.bite`; farol aceso = camarão vermelho, farol apagado = some (preto). | ℹ ISCA DE LUZ; ✔ VERMELHO = INVISÍVEL |
| 01:38:06 – 01:45:24 | 2946 – 3174 | Até aqui desce o cachalote, a cerca de dois mil metros, com um único fôlego, para caçar lulas. | O cachalote passa ao lado. | Cachalote; lula. | `whale.dive`; `squid.flee`; mascote pulinho. | ℹ CACHALOTE: ~2.000 m — num único fôlego |
| 01:45:24 – 02:00:09 | 3174 – 3609 | De quatro a seis mil metros é o abismo: planícies enormes de lama gelada. Lá cai devagar uma chuva de restos lá de cima, a neve marinha, que pode levar semanas para chegar ao fundo e vira comida de quem vive ali. | Desce até a planície → segue um floco até o chão. (Plano longo.) | Lama, pepinos-do-mar, neve marinha. | `zone.abyss`; `snow.amount`; `snow.trace` (relógio "semanas"); `cucumber.eat`. | ℹ ABISMO — 4.000 a 6.000 m; ℹ NEVE MARINHA — pode levar semanas para cair |
| 02:00:09 – 02:12:06 | 3609 – 3966 | Mais fundo, só nas fossas: a zona hadal, de Hades, o deus do mundo dos mortos. Perto de onze mil metros, a pressão passa de mil vezes a da superfície. | Desce pela fossa estreita até o fundo. | Paredes da fossa; medidor. | `zone.hadal`; `gauge.atm` 600→1.090; `pressure.arrows`; `fx.shake`. | ℹ ZONA HADAL — 6.000 a ~11.000 m; ⚠ +1.000× A PRESSÃO |
| 02:12:06 – 02:25:09 | 3966 – 4359 | Mesmo assim, tem vida: um peixe-caracol já foi filmado a mais de oito mil metros. E pouquíssimas pessoas desceram até o ponto mais fundo, bem menos do que as que já foram ao espaço. | Peixe-caracol a 8.300 m → fundo. | Peixe-caracol; cartão "~30 pessoas × 600+ no espaço". | `snail.show`; `depthTag.8336`; `peopleCard.show`; `peopleCard.space`; mascote acena. | ✔ PEIXE MAIS FUNDO: 8.336 m; ⚠ MAIS GENTE NO ESPAÇO — do que no fundo do mar |
| 02:25:09 – 02:36:21 | 4359 – 4701 | Agora olha o oceano em escala real: a zona do sol é só essa faixa fininha. Quase tudo fica no escuro, e menos de um terço do fundo do mar foi mapeado em detalhe. | Chicote para a coluna B → topo → inteira. | Faixas das zonas em escala real; cartão "~29% mapeado". | `realBands.show`; `realSun.pulse`; `realDark.show`; `mapCard.show`. | ⚠ SÓ 200 m DE LUZ; ℹ < 1/3 DO FUNDO MAPEADO — Seabed 2030 |
| 02:36:21 – 02:55:00 | 4701 – 5250 | Pronto: agora você conhece as cinco zonas do oceano, do sol até o fundo das fossas. | Abre para as duas colunas; **encerramento fixo da marca** nos últimos ~4,7 s. | Rótulos das 5 zonas. | `zoneLabels.reveal`; a batisfera volta à superfície; mascote comemora + confete. | ✔ 5 ZONAS DO OCEANO |

Soma: 291+375+276+288+336+366+336+315+363+228+435+357+393+342+549 = **5250 frames** (175 s), contíguos.

## 3. Estrutura de State / Props
O contrato está em `scene-plan.ts`: 11 cenas, tipos do template.
- **`depthY(m)`** converte profundidade real em altura na coluna A esticada.
- **`pod.depth`** guarda os metros reais da batisfera.
- **Checagens:** `tsc --strict` sem erros; soma 3000 frames.
- **3D:** as duas colunas, a batisfera, os seres, as partículas (algas, bolhas, neve).
- **2D:** badges, legendas, régua de profundidade, medidor de pressão, cartão do oxigênio, ícone dia/noite, selo de esquema.

## 4. Áudio e montagem

**Narração** (421 palavras):

O Monte Everest inteiro cabe no ponto mais fundo do oceano, e ainda sobram dois quilômetros de água por cima. Vamos
descer até lá? Os primeiros duzentos metros são a zona do sol, a única parte bem iluminada. É aqui que vive a maior
parte da vida marinha que você conhece: tartarugas, golfinhos e cardumes. E também algas microscópicas. Elas fazem
fotossíntese como as plantas, e o oceano produz cerca de metade do oxigênio do planeta. Só que a luz não desce
inteira. O vermelho é a primeira cor que a água apaga, por isso, quanto mais fundo, mais tudo fica azul. E a
pressão aumenta rápido: a cada dez metros, ela sobe o peso de uma atmosfera inteira. Um copinho de isopor que desce
bem fundo volta todo encolhido. De duzentos a mil metros fica a zona do crepúsculo, só com um restinho de luz azul.
Muitos peixes daqui têm olhos enormes e luzinhas na barriga, para sumir contra a claridade de cima. E toda noite,
bilhões de animais sobem daqui para comer perto da superfície e voltam antes do amanhecer. É a maior migração do
planeta, e acontece todo dia. Passou de mil metros, escuridão total. É a zona da meia-noite: a água fica perto de
quatro graus, e a única luz vem dos próprios animais. O tamboril balança uma isca que brilha para atrair presas até
a boca. E muitos bichos daqui são vermelhos, porque sem luz vermelha, o vermelho fica preto, quase invisível. Até
aqui desce o cachalote, a cerca de dois mil metros, com um único fôlego, para caçar lulas. De quatro a seis mil
metros é o abismo: planícies enormes de lama gelada. Lá cai devagar uma chuva de restos lá de cima, a neve marinha,
que pode levar semanas para chegar ao fundo e vira comida de quem vive ali. Mais fundo, só nas fossas: a zona
hadal, de Hades, o deus do mundo dos mortos. Perto de onze mil metros, a pressão passa de mil vezes a da
superfície. Mesmo assim, tem vida: um peixe-caracol já foi filmado a mais de oito mil metros. E pouquíssimas
pessoas desceram até o ponto mais fundo, bem menos do que as que já foram ao espaço. Agora olha o oceano em escala
real: a zona do sol é só essa faixa fininha. Quase tudo fica no escuro, e menos de um terço do fundo do mar foi
mapeado em detalhe. Pronto: agora você conhece as cinco zonas do oceano, do sol até o fundo das fossas.

**Encerramento fixo da marca:** "Segue a Fenda Umbra e compartilha pra mais vídeos assim!"

- **Orçamento:**
  - estimativa de 143 s de fala a +0%;
  - com +9% pela diferença vista no EP. 01 e voz a +4%, dá ≈150 s;
  - somando pausas maiores (~14 s), abertura e encerramento, ≈170 s de 175, com **folga de ~5 s**.
- **Efeitos:** água e bolhas, sons graves que aumentam com a profundidade, rangido de pressão no fundo, cliques do farol, brilhos na bioluminescência, chicotes nas trocas de coluna.
- **Trilha (`INTENTS`):**

  | Cenas | Intenção |
  | --- | --- |
  | 1 | reveal |
  | 2–3 | calm |
  | 4–5 | curious |
  | 6–7 | tense |
  | 8–9 | tense / build |
  | 10 | reveal |
  | 11 | resolve |

## 5. Critérios de aceite e notas de verificação

- [x] Formato fatos/documentário com fio condutor (descida contínua). Cada zona tem um fato concreto e um número; não vira lista.
- [x] O fato mais forte no gancho (Everest) e no fim (escala real); o esquema esticado é avisado e não é usado para comparar tamanhos.
- [x] Tabela completa, 15 planos (os mais longos têm 2–3 movimentos internos), soma 5250.
- [ ] Ainda não verificado, fica para a Fase 2: aprovação dos 12 designs novos, leitura no celular, áudio.

**Verificação dos fatos** (pesquisados):
- **Zonas e limites:** NOAA (0–200 / 200–1.000 / 1.000–4.000 / 4.000–6.000 / 6.000 m até o fundo).
  - Algumas fontes usam limites um pouco diferentes, por exemplo outras contas para o hadal. Usei o NOAA.
- **Fundo do Abismo Challenger:** 10.935 m (±6 m, estudo de 2021 com autores da NOAA). O Everest tem 8.849 m (medição oficial de 2020), então sobram ≈2.086 m, ou seja, "dois quilômetros".
- **Pressão:** +1 atm a cada ~10 m (física). No fundo, "mais de mil vezes": a NOAA fala em ~1.000×, e o cálculo dá ~1.090×.
- **Oxigênio:** a página da NOAA diz "cerca de metade". Não usei o "50–80%" que circula, porque não tem fonte primária.
  - Nuance que deixei de fora por espaço: boa parte desse oxigênio é consumida pela própria vida marinha.
- **Migração vertical diária** como "a maior migração do planeta": WHOI. Os "bilhões de animais" estão bem abaixo das estimativas de toneladas e são conservadores.
- **4 °C na zona da meia-noite:** valor típico e aproximado; por isso "perto de".
- **"A única luz vem dos próprios animais":** NOAA. Não cito porcentagem.
  - O estudo do MBARI (Martini & Haddock, 2017) achou ~3/4 dos animais luminosos, mas só em Monterey Bay.
- **Cachalote:** mergulhos de ~2.000 m são bem documentados (há registros um pouco maiores); por isso "cerca de".
- **"Hadal" vem de Hades;** neve marinha e planícies abissais: conceitos padrão de oceanografia.
- **Fatos novos da v2:**
  - o vermelho é a primeira cor apagada pela água, e bichos vermelhos parecem pretos no fundo (NOAA Ocean Exploration);
  - o isopor encolhe sob pressão (demonstração clássica de expedições);
  - luz na barriga como camuflagem (contrailuminação), comum em peixes da zona do crepúsculo;
  - peixe-caracol filmado a 8.336 m na Fossa de Izu-Ogasawara em 2022 (recorde Guinness);
  - ~20–30 pessoas desceram ao Abismo Challenger desde 1960, contra 600+ que foram ao espaço;
  - neve marinha leva de dias a semanas para chegar ao fundo;
  - Seabed 2030: 27–29% do fundo mapeado em alta resolução (2025).
- **Selo de esquema:** as faixas da coluna A estão esticadas; os seres estão fora de escala em relação à coluna.

**Fontes consultadas:**
- NOAA JetStream — Layers of the Ocean: https://noaa.gov/jetstream/ocean/layers-of-ocean
- NOAA Ocean Service — How much oxygen comes from the ocean?: https://oceanservice.noaa.gov/facts/ocean-oxygen.html
- NOAA (repositório) — profundidade do Challenger Deep, 2021: https://repository.library.noaa.gov/view/noaa/33477
- EarthDate — The Deepest Deep: https://www.earthdate.org/episodes/the-deepest-deep
- WHOI — The great migration: https://divediscover.whoi.edu/the-great-migration
- WHOI Twilight Zone — Greatest Migration on Earth: https://twilightzone.whoi.edu/greatest-migration-on-earth-happens-under-darkness-every-day
- MBARI / Scientific Reports (Martini & Haddock 2017): https://pmc.ncbi.nlm.nih.gov/articles/PMC5379559/
- NOAA Ocean Exploration — Journey into Midnight: https://oceanexplorer.noaa.gov/?p=5414
- NOAA Ocean Exploration — Why are so many deep-sea animals red?: https://oceanexplorer.noaa.gov/facts/red-color.html
- Smithsonian — Behold the Deepest Fish Ever Filmed: https://www.smithsonianmag.com/smart-news/behold-the-deepest-fish-ever-filmed-180981937/
- Lista de pessoas que desceram ao Challenger Deep: https://en.wikipedia.org/wiki/List_of_people_who_descended_to_Challenger_Deep
- Seabed 2030 / IHO — progresso do mapeamento: https://iho.int/en/global-seabed-mapping-reaches-new-milestone-as-five-million-square-kilometres-added-in-a-year

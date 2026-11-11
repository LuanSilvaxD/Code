# Roteiro v1: As zonas de profundidade do oceano

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
- **Duração: 1:40** (100 s, 3000 frames). Cinco zonas com um fato concreto cada não cabem bem em 90 s; já cortei o texto de 254 para 241 palavras.
- **Formato técnico:** 1080 × 1920, 30 fps, pt-BR, tom didático com clima de mergulho.
- **Cenário:**
  - **Coluna A:** um corte de oceano em pé sobre o pedestal, com as 5 zonas empilhadas e uma régua de profundidade. As faixas são esticadas para caber, com selo "ESQUEMA · FAIXAS FORA DE ESCALA".
  - **Coluna B:** ao lado, a mesma coluna em **escala real** (1 km = 1 bloco). É onde aparece o Everest no gancho e onde a zona do sol vira uma faixa fininha no fim.
  - O Everest **nunca** aparece na coluna esticada, porque ali a comparação ficaria falsa.
- **Mascote:** desce dentro de uma **batisfera** (esfera de vidro com farol), boiando como no espaço. Acena no gancho, se assusta com a pressão e com o cachalote, e comemora no fim.
- **Fundo:** estúdio com tom oceano (`#182a4e`), que escurece conforme a câmera desce.
- **Designs novos, para você aprovar antes de entrarem no vídeo** (folha de design será o 1º passo da Fase 2):
  1. batisfera com o mascote dentro
  2. peixe-lanterna (cardume)
  3. tamboril (peixe-diabo com isca de luz)
  4. água-viva bioluminescente
  5. cachalote (cabeça quadrada, diferente da baleia já aprovada)
  6. lula
  7. pepino-do-mar (planície abissal)
  8. Monte Everest low-poly
- **Já aprovados:** barco de pesca e peixe (cardume na zona do sol).
- **TTS:** edge-tts `pt-BR-AntonioNeural`, +6% (gratuito); chamada da marca em +0%.

## 2. Tabela cronológica

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 – 00:09:12 | 0 – 282 | O Monte Everest inteiro cabe no ponto mais fundo do oceano, e ainda sobram dois quilômetros de água por cima. Vamos descer até lá? | Coluna B inteira (d=30) → aproxima da fossa (d=16) → chicote para o topo da coluna A. | Coluna B em escala real; Everest; colchete "2 km". | `everest.rise` 0→1 ("Everest"…"cabe"); `bracket.water` 0→1 ("sobram"); mascote acena na superfície ("Vamos"); `fx.whipOut`. | ℹ EVEREST: 8.849 m; ℹ FOSSA: ~10.935 m; ⚠ +2 km DE ÁGUA POR CIMA |
| 00:09:12 – 00:14:24 | 282 – 444 | Os primeiros duzentos metros são a zona do sol, a única parte bem iluminada. | Superfície da coluna A → desce um pouco. | Ondas, Sol, barco de pesca, cardume, raios de luz. | `fx.whipIn`; `sunRays.show`; `zone.sun` acende na régua; `pod.depth` 0→120 m. | ℹ ZONA DO SOL — 0 a 200 m · epipelágica |
| 00:14:24 – 00:21:03 | 444 – 633 | Aqui as algas fazem fotossíntese, e o oceano produz cerca de metade do oxigênio do planeta. | Close nas algas. | Fitoplâncton verde, bolhas de O₂, cartão "metade". | `plankton.show`; `o2.flow`; `o2Card.show` (spring, "metade"). | ✔ ~METADE DO OXIGÊNIO — vem do oceano (NOAA) |
| 00:21:03 – 00:26:15 | 633 – 795 | E a cada dez metros que você desce, a pressão sobe o peso de uma atmosfera. | Desce acompanhando a batisfera. | Setas de pressão; medidor "atm". | `gauge.atm` 19→27; `pressure.arrows` ("pressão"); mascote pulinho. | ⚠ +1 ATM A CADA 10 m |
| 00:26:15 – 00:39:21 | 795 – 1191 | De duzentos a mil metros fica a zona do crepúsculo, com um restinho de luz azul. Toda noite, bilhões de animais sobem daqui para comer e voltam antes do amanhecer: a maior migração do planeta. | Batisfera em 600 m → abre (d=15) para ver a migração → volta. (Plano longo, com 3 movimentos.) | Cardume de peixes-lanterna; ícone sol/lua. | `light.depth` 0→0,45 (água azul-escura); `zone.twilight`; `dayNight.night`; `lantern.migrate` sobe ("sobem") e desce ("voltam"). | ℹ ZONA DO CREPÚSCULO — 200 a 1.000 m; ✔ A MAIOR MIGRAÇÃO DO PLANETA |
| 00:39:21 – 00:49:24 | 1191 – 1494 | Passou de mil metros, escuridão total. É a zona da meia-noite: a água fica perto de quatro graus, e a única luz vem dos próprios animais. | Órbita lenta no escuro. | Farol da batisfera; tamboril; águas-vivas brilhando. | `light.depth`→1 (apaga); `podLamp.on`; `temp.show` (4 °C); `biolum.show`; o farol baixa para ver os brilhos. | ℹ ZONA DA MEIA-NOITE — 1.000 a 4.000 m; ✔ LUZ DOS PRÓPRIOS ANIMAIS |
| 00:49:24 – 00:57:00 | 1494 – 1710 | Até aqui desce o cachalote, a cerca de dois mil metros, com um único fôlego, para caçar lulas. | O cachalote passa ao lado da batisfera. | Cachalote mergulhando; lula fugindo. | `whale.dive` 0→1; `squid.flee`; mascote pulinho. | ℹ CACHALOTE: ~2.000 m — num único fôlego |
| 00:57:00 – 01:06:09 | 1710 – 1989 | De quatro a seis mil metros é o abismo: planícies de lama gelada, onde cai devagar uma chuva de restos lá de cima, a neve marinha. | Desce até a planície abissal. | Plataforma de lama, pepinos-do-mar, neve marinha. | `pod.depth` 2.000→5.200 m; `zone.abyss`; `snow.amount` 0,2→1. | ℹ ABISMO — 4.000 a 6.000 m; ℹ NEVE MARINHA |
| 01:06:09 – 01:18:09 | 1989 – 2349 | Mais fundo, só nas fossas: a zona hadal, de Hades, o deus do mundo dos mortos. Perto de onze mil metros, a pressão passa de mil vezes a da superfície. | Desce pela fossa estreita até o fundo. | Paredes da fossa; medidor de pressão. | `pod.depth`→10.900 m; `zone.hadal`; `gauge.atm` 600→1.090; `pressure.arrows`; `fx.shake`. | ℹ ZONA HADAL — 6.000 a ~11.000 m; ⚠ +1.000× A PRESSÃO |
| 01:18:09 – 01:25:27 | 2349 – 2577 | E olha o oceano em escala real: a zona do sol é só essa faixa fininha. Quase tudo fica no escuro. | Chicote para a coluna B → sobe até o topo. | Faixas das zonas com a espessura real. | `realBands.show`; `realSun.pulse` (a faixa do sol pisca); `realDark.show`. | ℹ ESCALA REAL; ⚠ SÓ 200 m DE LUZ — de até 11.000 m |
| 01:25:27 – 01:40:00 | 2577 – 3000 | Pronto: agora você conhece as cinco zonas do oceano, do sol até o fundo das fossas. | Abre para as duas colunas; **encerramento fixo da marca** nos últimos ~4,7 s. | Rótulos das 5 zonas acendendo de cima para baixo. | `zoneLabels.reveal`; a batisfera volta à superfície; mascote comemora + confete. | ✔ 5 ZONAS DO OCEANO |

Soma: 282+162+189+162+396+303+216+279+360+228+423 = **3000 frames** (100 s), contíguos.

## 3. Estrutura de State / Props
O contrato está em `scene-plan.ts`: 11 cenas, tipos do template.
- **`depthY(m)`** converte profundidade real em altura na coluna A esticada.
- **`pod.depth`** guarda os metros reais da batisfera.
- **Checagens:** `tsc --strict` sem erros; soma 3000 frames.
- **3D:** as duas colunas, a batisfera, os seres, as partículas (algas, bolhas, neve).
- **2D:** badges, legendas, régua de profundidade, medidor de pressão, cartão do oxigênio, ícone dia/noite, selo de esquema.

## 4. Áudio e montagem

**Narração** (241 palavras):

O Monte Everest inteiro cabe no ponto mais fundo do oceano, e ainda sobram dois quilômetros de água por cima.
Vamos descer até lá? Os primeiros duzentos metros são a zona do sol, a única parte bem iluminada. Aqui as algas
fazem fotossíntese, e o oceano produz cerca de metade do oxigênio do planeta. E a cada dez metros que você desce,
a pressão sobe o peso de uma atmosfera. De duzentos a mil metros fica a zona do crepúsculo, com um restinho de luz
azul. Toda noite, bilhões de animais sobem daqui para comer e voltam antes do amanhecer: a maior migração do
planeta. Passou de mil metros, escuridão total. É a zona da meia-noite: a água fica perto de quatro graus, e a
única luz vem dos próprios animais. Até aqui desce o cachalote, a cerca de dois mil metros, com um único fôlego,
para caçar lulas. De quatro a seis mil metros é o abismo: planícies de lama gelada, onde cai devagar uma chuva de
restos lá de cima, a neve marinha. Mais fundo, só nas fossas: a zona hadal, de Hades, o deus do mundo dos mortos.
Perto de onze mil metros, a pressão passa de mil vezes a da superfície. E olha o oceano em escala real: a zona do
sol é só essa faixa fininha. Quase tudo fica no escuro. Pronto: agora você conhece as cinco zonas do oceano, do
sol até o fundo das fossas.

**Encerramento fixo da marca:** "Segue a Fenda Umbra e compartilha pra mais vídeos assim!"

- **Orçamento:**
  - estimativa de 81 s de fala a +0%, que fica ≈76 s a +6%;
  - corrigindo +9% pela diferença vista no último vídeo, dá ≈83 s;
  - somando pausas, abertura e encerramento, ≈95 s de 100, com **folga de ~5 s** para respiros nas viradas de zona.
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
- [x] Tabela completa, 11 planos (2 longos com movimentos internos), soma 3000.
- [ ] Ainda não verificado, fica para a Fase 2: aprovação dos 8 designs novos, leitura no celular, áudio.

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

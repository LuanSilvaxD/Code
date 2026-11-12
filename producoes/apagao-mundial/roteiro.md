# Roteiro v1 — Vai ter apagão mundial em 17 de novembro?

**Quadro novo (nome a confirmar):** *Boato ou Verdade?* — EP. 01
**Status:** AGUARDANDO APROVAÇÃO — implementação e renderização não iniciadas.

## 1. Briefing de produção

- **Tema:** o boato viral de que o mundo inteiro ficará sem energia em 17/11/2026, e a pergunta por trás dele: dá para apagar o planeta todo de uma vez?
- **Recorte:**
  1. Origem do boato: episódio dos Simpsons de 2023 e teste real de alertas nos EUA em 17/11.
  2. Por que não existe um "botão do planeta": as redes elétricas são separadas e nem giram no mesmo ritmo (60 Hz × 50 Hz, Itaipu).
  3. Como um apagão real acontece e onde ele para (Brasil, 15/08/2023, com Roraima fora da rede).
  4. O único candidato a derrubar várias redes ao mesmo tempo (tempestade solar, Quebec 1989) e por que ele não tem data marcada.
- **Formato:** pergunta → revelação, como episódio de um quadro novo.
  - Por quê: o gancho é uma dúvida que as pessoas estão pesquisando agora. Cada pista empurra o medidor do veredito e a resposta vem no fim.
- **Quadro:** *Boato ou Verdade?*
  - Cartão próprio no s2 ("Este é o Boato ou Verdade.").
  - Identidade visual nova: um **medidor de veredito** (ponteiro entre BOATO ✖ vermelho e VERDADE ✔ verde) que se mexe a cada pista e bate no veredito final.
  - Não reutiliza o carimbo "BOATO" do vídeo do Kola.
  - Etiqueta de capa: "BOATO OU VERDADE? · EP. 01". Hashtag do quadro: `#boatoouverdade`.
  - **O nome precisa da sua confirmação antes do render.**
- **Público e objetivo:** leigo. Sair sabendo:
  - de onde veio a data;
  - que não existe rede elétrica mundial;
  - como um apagão se espalha e onde ele para;
  - qual é o risco real (Sol), e que ele não tem dia marcado.
- **Duração:** 1:55 planejado (115 s, 3450 frames). O orçamento estima 113 s.
  - No Kola, a voz real deu cerca de 4 s a mais que a estimativa. Se acontecer de novo, o vídeo vai a ~1:59; a voz real decide.
- **Formato técnico:** 1080 × 1920, 9:16, 30 fps, pt-BR. Timestamps em MM:SS:FF (FF de 00 a 29). Intervalos [início, fim).
- **Tom:** informal, ágil, de checagem ("Será verdade?"). Sem zombar de quem acreditou.
- **TTS:** edge-tts `pt-BR-AntonioNeural`, rate +4% (cta +0%). Só no texto do TTS, ":" vira ",".
- **Paleta da trilha:** `tecnologia`. Os últimos foram mistério (Kola) e história (Joana); energia é tecnologia.
  - O tema da marca toca no gancho, na virada "Ela não existe" (s6), em "Só Roraima ficou com luz" (s10) e no veredito (s14).
- **Direção de arte:**
  - **Espaço:** o cenário-âncora é um **globo noturno** com as luzes das cidades acesas.
  - **Sala:** a origem do boato é contada numa sala low-poly (TV, rádio, sofá).
  - **Itaipu:** barragem estilizada em corte, com os 20 geradores girando em dois ritmos.
  - **Brasil:** a explicação do apagão real é um **mapa do Brasil em placas por estado**, que apagam em dominó.
  - **Sol:** o risco solar é um Sol low-poly lançando uma ejeção que atinge o mesmo globo.
  - **Fundo:** estúdio escuro, tinta `#16244a` (tecnologia). Escurece para `#0c1226` quando as luzes apagam e esquenta para `#3a2410` perto do Sol.
- **Mascote:**
  - flutua ao lado do globo no gancho (acena) e nas cenas de espaço;
  - assiste TV no sofá da sala (s3–s5) e pula no alerta;
  - visita o mapa do Brasil na borda do pedestal (pula no dominó, aponta Roraima);
  - comemora no veredito.
- **Designs novos, que precisam de aprovação na folha de design (Fase 2, 1º passo):**
  1. **Globo noturno:** a textura do globo do Kola em versão noite, com luzes das cidades. Inclui a versão "redes" com as regiões coloridas por rede elétrica (esquemática).
  2. **Sala:** TV de tubo/tela plana low-poly, rack, sofá e rádio de mesa.
     - Tela da TV: desenho GENÉRICO de uma cidade apagando com um calendário "17 NOV". **Nenhum personagem, cenário ou traço dos Simpsons.**
     - Variante com faixa "TESTE DE ALERTA DE EMERGÊNCIA".
  3. **Itaipu estilizada:** barragem em corte com 20 geradores, 10 marcados 60 Hz (Brasil) e 10 marcados 50 Hz (Paraguai), girando em velocidades diferentes.
  4. **Mapa do Brasil em placas por estado:** esquemático, com uma linha de transmissão e torres no Ceará e uma usina térmica pequena em Roraima. Cada estado tem luzinhas acesas ou apagadas.
  5. **Sol low-poly:** com ejeção de massa coronal (nuvem de partículas) e as linhas do campo magnético da Terra em volta do globo.
  6. **Satélite observando o Sol:** genérico, sem marca de agência.
  7. **Medidor do veredito e cartão do quadro "Boato ou Verdade?"** (2D).
- **Já aprovados:** mascote. Sem figurantes: a sala é vista com o mascote no sofá.
- **Selo "ESQUEMA":**
  - no globo das redes (fronteiras simplificadas);
  - no mapa do Brasil (estados simplificados);
  - na Itaipu (geradores fora de escala).

**O que se constrói:** um globo com as luzes acesas, onde a dúvida apaga tudo de uma vez.
- A história volta à origem do boato (sala, TV) e depois ao globo, que se divide em redes separadas.
- Desce para Itaipu (dois ritmos) e para o mapa do Brasil (apagão de 2023 parando em Roraima).
- Sobe ao Sol (o risco real, que não tem data).
- Termina no globo aceso com o veredito BOATO.

## 2. Tabela cronológica (estimativa até o TTS; a voz real decide os cortes)

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:08:10 | 0 - 250 | Dia 17 de novembro, o mundo inteiro vai ficar sem luz. É o que tá rodando na internet. Será verdade? | Abertura da fenda sobre o globo noturno no espaço (plano médio, az 20°, el 12°, globo girando devagar). Em "sem luz", a câmera recua e as luzes das cidades apagam numa onda de leste a oeste. Em "internet", celulares 2D com posts genéricos entram dos lados. Em "Será verdade?", as luzes voltam e a câmera faz punch-in. | Globo noturno, estrelas, mascote flutuando ao lado (acena), cards 2D de "post viral" sem marcas reais. | `fx.flash(0)`; `globe.spin` contínuo 0,04 rad/s; `mascot.wave(W1)`; `lights.on` 1→0 (W9–W10+20, inOut, varredura por longitude); `posts.cards` spring (W15); `lights.on` 0→1 (W18, 15 f); `fx.punch(W19)`. | APAGÃO MUNDIAL EM 17/11? (atenção, W4–W15) · TÁ NA INTERNET (atenção, W15–W18) · SERÁ VERDADE? (atenção, grande, W18). Legenda: 17 de novembro, mundo inteiro, sem luz, verdade. |
| 00:08:10 - 00:11:02 | 250 - 332 | Este é o Boato ou Verdade. | O cartão do quadro entra sobre o globo desfocado; os badges se recolhem. O medidor do veredito aparece com o ponteiro no meio, balançando. | Cartão "BOATO OU VERDADE? · EP. 01", medidor do veredito (2D), globo ao fundo. | `series.card` spring (W0); `verdict.show` 0→1 (W2); `verdict.needle` oscila ±15° (W3–fim, sin semeado); `fx.whoosh` saída. | Cartão do quadro (sem badges). Legenda: Boato ou Verdade. |
| 00:11:02 - 00:19:09 | 332 - 579 | Ela junta duas coisas. Um episódio dos Simpsons, de 2023, em que a cidade fica seis dias no escuro a partir de 17 de novembro. | Chicote para a sala. A câmera entra pela TV (az 15°, el 8°) com o mascote no sofá de costas. A TV mostra um desenho genérico de cidade; em "escuro", as janelas da cidade na tela apagam; em "17 de novembro", um calendário "17 NOV" vira na tela. | Sala: TV, rack, sofá, rádio, abajur; mascote sentado; tela da TV com cidade genérica e calendário. | `fx.whip(0)`; `room.show` 1; `tv.on` 0→1 (W4, 10 f); `tv.city.dark` 0→1 (W17–W18+10); `tv.calendar` spring (W22); camera dolly-in 3,2→2,4 u3d (0–fim, inOut). | PISTA 1: EPISÓDIO DE 2023 (info, W4) · 17/11 + 6 DIAS NO ESCURO (info, W15). Legenda: duas coisas, Simpsons, 2023, seis dias, 17 de novembro. |
| 00:19:09 - 00:26:20 | 579 - 800 | E um teste real: nesse dia, os Estados Unidos disparam um alerta de emergência de teste nas TVs e rádios. | A TV corta para a faixa "TESTE DE ALERTA DE EMERGÊNCIA" piscando; o rádio ao lado acende e emite ondas. O mascote pula no sofá. Câmera orbita 15° para pegar TV e rádio juntos. | TV com faixa de alerta, rádio com ondas 2D, mascote. | `tv.alert` 0→1 (W9); `radio.waves` spring (W17); `mascot.jump(W11)`; `fx.shake(W11, 8)` leve; camera orbit az 15→30°. | PISTA 2: TESTE REAL NOS EUA (info, W2) · SÓ UM TESTE, EM TVs E RÁDIOS (info, W14). Legenda: teste real, Estados Unidos, alerta, TVs, rádios. |
| 00:26:20 - 00:35:13 | 800 - 1063 | Só que o desenho não fala de 2026, nem do mundo. E o teste não desliga nada. Mas dá pra apagar o planeta inteiro de uma vez? | Na TV, um ✖ vermelho sobre o calendário em "2026"; outro sobre a faixa de alerta em "nada". O medidor do veredito desce do topo e o ponteiro inclina para BOATO. Em "Mas", a câmera atravessa a tela da TV e sai no espaço, recuando até o globo inteiro. | TV, ✖ 2D, medidor, transição TV → globo, mascote volta a flutuar. | `tv.cross1` spring (W7); `tv.cross2` spring (W16); `verdict.show` 1 (W4); `verdict.needle` 0→−35° (W7–W16, out); `fx.zoomThrough(W17)`; `room.show` 1→0 / `space.show` 0→1 (W17–W20); `mascot.float(W20)`. | NÃO FALA DE 2026 ✖ (problema, W7) · O TESTE NÃO DESLIGA NADA ✖ (problema, W16) · DÁ PRA APAGAR O PLANETA? (atenção, grande, W18). Legenda: 2026, mundo, desliga nada, planeta inteiro. |
| 00:35:13 - 00:42:25 | 1063 - 1285 | Pra isso, a Terra precisaria de uma rede elétrica só. Ela não existe. Cada região tem a sua. | Globo inteiro (dist. para caber, az 25°). Em "rede elétrica só", um cabo luminoso único envolve o globo e liga um plugue a uma "tomada do planeta". Em "não existe", o cabo se parte em segmentos e some (✖ vermelho). Em "Cada região", as terras ganham cores por rede elétrica (Américas do Norte, América do Sul, Europa, Rússia, Índia, China, Japão, Austrália, África), separadas por linhas escuras. | Globo, cabo + plugue, regiões coloridas por rede (esquema), selo ESQUEMA. | `cable.on` 0→1 (W6–W9); `cable.break` 0→1 (W11, 15 f); `grids.k` 0→1 (W13–W17, inOut); `globe.spin` lento; `mascot.point(W14)`. | NÃO EXISTE TOMADA DO PLANETA ✖ (problema, W10) · CADA REGIÃO, UMA REDE (info, W13). Legenda: rede elétrica só, não existe, cada região. |
| 00:42:25 - 00:52:10 | 1285 - 1570 | Numa rede, todos os geradores giram no mesmo ritmo. E as redes nem combinam: o Brasil usa sessenta hertz; o Paraguai, cinquenta. | Zoom na América do Sul (az 0°, el 20°). Ondas senoidais 2D sobem do Brasil (azul) e do Paraguai (laranja). Em "mesmo ritmo", a onda azul pulsa sincronizada com pequenos rotores espalhados pelo Brasil. Em "sessenta"/"cinquenta", as duas ondas lado a lado mostram ritmos diferentes. | Globo (zoom), mini-rotores sobre o Brasil, ondas 2D 60/50 Hz, rótulos BRASIL / PARAGUAI. | camera dolly ao pino América do Sul (0–W2); `rotors.sync` spring (W4); `wave60` spring (W17); `wave50` spring (W21); `wave.phase` = frame·2π·(60 ou 50)/FPS×0,05 (ritmo visível, proporção 6:5). | TODOS NO MESMO RITMO (info, W5) · 60 Hz × 50 Hz (atenção, W17). Legenda: mesmo ritmo, Brasil, sessenta hertz, Paraguai, cinquenta. |
| 00:52:10 - 00:58:04 | 1570 - 1744 | Tanto que Itaipu, dos dois países, tem metade dos geradores em cada ritmo. | Corte para a Itaipu estilizada em corte (az 30°, el 18°). 20 rotores em fila: os 10 da esquerda (azuis, 60 Hz) giram mais rápido; os 10 da direita (laranja, 50 Hz) giram mais devagar. Câmera desliza ao longo da fila. | Barragem, 20 geradores, rótulos BRASIL 60 Hz / PARAGUAI 50 Hz, selo ESQUEMA. | `itaipu.show` 1; `rotor60.spin` 6 u/s, `rotor50.spin` 5 u/s; camera tracking x −3→+3 (0–fim, inOut); `labels.pop` (W7). | ITAIPU: 10 + 10 GERADORES (info, W2) · 2 RITMOS NA MESMA USINA (info, W10). Legenda: Itaipu, dois países, metade, cada ritmo. |
| 00:58:04 - 01:08:11 | 1744 - 2051 | Apagão grande existe. Em agosto de 2023, uma linha caiu no Ceará, e a falha correu como dominó: vinte e cinco estados e o Distrito Federal no escuro. | Mapa do Brasil em placas, aceso, visto de cima e de lado (el 50°, az 15°), mascote na borda. Em "linha caiu", faíscas na linha do Ceará e o estado apaga. Em "dominó", os estados apagam em sequência, a partir do Ceará, por distância (placas descem 0,02 u3d ao apagar). Contador 2D sobe até 25 + DF. O mascote pula. | Mapa do Brasil, torres e linha no Ceará, luzinhas por estado, contador 2D, selo ESQUEMA, mascote. | `brazil.show` 1; `line.spark` spring (W9); `domino.t` 0→1 (W15–W25, in; atraso por estado = distância ao Ceará); `counter` 0→26 (W18–W25); `fx.shake(W9, 10)`; `mascot.jump(W17)`. | APAGÃO REAL: 15/08/2023 (info, W3) · 25 ESTADOS + DF NO ESCURO ✖ (problema, W18). Legenda: agosto de 2023, Ceará, dominó, vinte e cinco estados. |
| 01:08:11 - 01:17:04 | 2051 - 2314 | Só Roraima ficou com luz. Por quê? Ela não era ligada à rede nacional. A falha só corre até onde vão os fios. | Câmera desliza para o norte até Roraima, que continua acesa com sua usina térmica. Em "não era ligada", aparece o vão sem fios entre Roraima e o resto (linha tracejada vermelha). Em "fios", as linhas de transmissão acendem em todo o mapa mostrando o caminho da falha, que para no vão. O mascote aponta Roraima. | Mapa (Roraima acesa), usina térmica, linhas de transmissão luminosas, vão tracejado. | camera pan para Roraima (0–W2); `roraima.glow` spring (W1); `gap.show` spring (W10); `lines.trace` 0→1 (W14–W21, inOut); `mascot.point(W1)`; o tema da marca toca (W1). | SÓ RORAIMA COM LUZ ✔ (solução, W1) · FORA DA REDE NACIONAL (info, W10) · A FALHA SÓ CORRE PELOS FIOS (info, grande, W14). Legenda: Roraima, com luz, rede nacional, fios. |
| 01:17:04 - 01:23:20 | 2314 - 2510 | Então, algo derruba várias redes ao mesmo tempo? Tem um candidato: o Sol. | Volta ao espaço: globo com as redes coloridas. Câmera recua e gira até o Sol entrar em quadro à esquerda (o Sol à esquerda, o globo pequeno à direita). Em "Sol", o Sol pulsa. | Globo, Sol low-poly, campo magnético 2D/3D ao redor da Terra. | `space.show` 1; camera dolly-out 6→14 u3d com az 25→−20° (0–W12, inOut); `sun.pulse` spring (W12); `field.show` 0→1 (W8). | VÁRIAS REDES DE UMA VEZ? (atenção, W3) · O CANDIDATO: O SOL (atenção, W12). Legenda: várias redes, ao mesmo tempo, candidato, Sol. |
| 01:23:20 - 01:31:06 | 2510 - 2736 | Em 1989, uma tempestade solar apagou Quebec, no Canadá, em menos de um minuto. Nove horas no escuro. | O Sol lança a ejeção (nuvem de partículas laranja) que viaja até a Terra; as linhas do campo balançam. Câmera acompanha a nuvem e termina no Canadá (zoom no globo). As luzes da região de Quebec apagam em "apagou". Relógio 2D gira 9 horas. | Sol, ejeção (partículas), linhas de campo, globo (zoom Canadá), relógio 2D. | `cme.t` 0→1 (W2–W5, in); `field.shake` spring (W5); `quebec.lights` 1→0 (W5, 12 f); `fx.flash(W5)`; `clock.hours` 0→9 (W14–W17). | QUEBEC, 1989 (info, W1) · APAGOU EM MENOS DE 1 MINUTO ✖ (problema, W9) · 9 HORAS NO ESCURO (problema, W14). Legenda: 1989, tempestade solar, Quebec, um minuto, nove horas. |
| 01:31:06 - 01:38:10 | 2736 - 2950 | Só que tempestade solar não tem data marcada. A explosão é vista no Sol horas ou dias antes de chegar. | Um calendário 2D com "17/11" ganha um ✖. Um satélite entre o Sol e a Terra vigia o Sol; quando o Sol solta uma pequena explosão, um sinal (onda) vai do satélite à Terra antes da nuvem. Barra 2D "AVISO: HORAS A DIAS". | Calendário 2D, satélite, Sol, onda de aviso, globo. | `calendar.cross` spring (W6); `satellite.show` spring (W8); `flare.t` 0→1 (W9–W11); `warning.wave` 0→1 (W11–W14); `cme.small` 0→0,5 (W14–W19, lento). | SEM DATA MARCADA ✖ (problema, W6) · AVISO COM HORAS A DIAS ✔ (solução, W14). Legenda: data marcada, explosão, horas, dias. |
| 01:38:10 - 01:49:15 | 2950 - 3285 | Veredito: apagão no mundo inteiro, dia 17? Boato. Pronto: agora você sabe por que não existe um botão que desliga o planeta. | Globo inteiro aceso, redes coloridas se desfazem em luzes normais. O medidor do veredito desce grande ao centro; em "Boato", o ponteiro bate no BOATO ✖ com tremor e clarão. Em "Pronto", o medidor sobe e a câmera orbita o globo aceso; o mascote comemora e acena. Resumo 2D com 3 ícones: redes separadas, falha para nos fios, Sol sem data. | Globo aceso, medidor grande, 3 ícones de resumo, mascote. | `verdict.big` spring (W0); `verdict.needle` → −80° (W7, spring com overshoot); `fx.shake(W7, 12)`; `fx.flash(W7)`; `verdict.big` 1→0 (W9); `summary.icons` spring (W11); camera orbit az 0→40° (W8–fim); `mascot.cheer(W8)`; `mascot.wave(W18)`. | VEREDITO: BOATO ✖ (problema, grande, W7) · NÃO EXISTE BOTÃO QUE DESLIGA O PLANETA ✔ (solução, W14). Legenda: veredito, boato, pronto, botão, planeta. |
| 01:49:15 - 01:55:00 | 3285 - 3450 | *(encerramento fixo da marca — chamada falada)* | A fenda se fecha sobre o globo; logo, marca e texto do encerramento. | `BrandOutro`. | — | — |

**Soma:** 250 + 82 + 247 + 221 + 263 + 222 + 285 + 174 + 307 + 263 + 196 + 226 + 214 + 335 + 165 = 3450 frames (115 s). Frames contíguos de 0 a 3450.

## 3. State / Props

Ver `scene-plan.ts`: tipos `VideoConfig`/`ScenePlan`, poses de câmera, 14 cenas e 3450 frames.
- A linha do tempo é determinística, derivada do frame: sem timers nem `Math.random` sem semente. O balanço do ponteiro usa seno do frame.
- A camada 3D usa @remotion/three + R3F (globo, sala, Itaipu, mapa do Brasil, Sol, satélite).
- A camada 2D tem badges, legendas, medidor do veredito, cartão do quadro, cards de post, ondas 60/50 Hz, contador, relógio, calendário e ícones de resumo.

## 4. Áudio e montagem

**Narração integral (275 palavras nas cenas):**

Dia 17 de novembro, o mundo inteiro vai ficar sem luz. É o que tá rodando na internet. Será verdade? Este é o Boato ou Verdade. Ela junta duas coisas. Um episódio dos Simpsons, de 2023, em que a cidade fica seis dias no escuro a partir de 17 de novembro. E um teste real: nesse dia, os Estados Unidos disparam um alerta de emergência de teste nas TVs e rádios. Só que o desenho não fala de 2026, nem do mundo. E o teste não desliga nada. Mas dá pra apagar o planeta inteiro de uma vez? Pra isso, a Terra precisaria de uma rede elétrica só. Ela não existe. Cada região tem a sua. Numa rede, todos os geradores giram no mesmo ritmo. E as redes nem combinam: o Brasil usa sessenta hertz; o Paraguai, cinquenta. Tanto que Itaipu, dos dois países, tem metade dos geradores em cada ritmo. Apagão grande existe. Em agosto de 2023, uma linha caiu no Ceará, e a falha correu como dominó: vinte e cinco estados e o Distrito Federal no escuro. Só Roraima ficou com luz. Por quê? Ela não era ligada à rede nacional. A falha só corre até onde vão os fios. Então, algo derruba várias redes ao mesmo tempo? Tem um candidato: o Sol. Em 1989, uma tempestade solar apagou Quebec, no Canadá, em menos de um minuto. Nove horas no escuro. Só que tempestade solar não tem data marcada. A explosão é vista no Sol horas ou dias antes de chegar. Veredito: apagão no mundo inteiro, dia 17? Boato. Pronto: agora você sabe por que não existe um botão que desliga o planeta.

**Encerramento fixo da marca:** "Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha!" (~4,3 s de fala, ~5,5 s de encerramento).

**Tempo:**
- Estimado em 99 s de fala, 7,8 s de pausas e 6,2 s de abertura e respiro: 113 s de 115 s.
- Depois do TTS real, os cortes passam a vir da voz. Se passar, a ordem é: ":"→"," no texto do TTS, depois pausas menores, depois esticar o vídeo até ~2:00.
- Pronúncia a conferir no TTS: "Quebec", "hertz", "Roraima", "2026".

**Efeitos:**
- Já existem: fenda-open/close, whoosh(-soft/-big), thud, pop, tick, ding, badge, buzz, glow, final, shimmer, rumble-soft, power-down.
- Novos:
  - `tv-on`: estalo de TV ligando;
  - `alert-tone`: dois tons de alerta, curto, sintetizado, NÃO é o tom oficial do EAS;
  - `spark`: faísca elétrica;
  - `hum`: zumbido de 60 Hz baixo;
  - `domino`: cliques em cascata;
  - `solar-whoosh`: sopro grave.

**Trilha:** paleta `tecnologia`.
- INTENTS: tense, curious, curious, curious, build, reveal, curious, curious, tense, reveal, build, tense, calm, resolve.
- HITS em "verdade?" (s1), "não existe" (s6), "Roraima" (s10) e "Boato" (s14).

**Legendas:** palavra a palavra, com tempos finais só depois do alinhamento com o áudio.

## 5. Verificação de fatos (o que entra e com que cuidado)

| Afirmação | Situação | Fonte |
| --- | --- | --- |
| Boato de apagão mundial em 17/11/2026 é falso; sem previsão oficial | confirmado (checagens de 9–11/11/2026) | Boatos.org; Terra; Imirante |
| Episódio dos Simpsons de 2023 ("It's a Blunderful Life", T35): apagão em Springfield começa em 17/11 e dura 6 dias | confirmado em fontes secundárias (checagens). Dizemos só "a cidade", sem nomear | Terra; DGABC; DCI |
| O episódio não fala de 2026 nem de apagão mundial | confirmado pelas checagens | Terra; Aos Fatos |
| Teste nacional do Sistema de Alerta de Emergência (EAS) nos EUA em 17/11/2026 (~14h20, horário de Brasília −2 h) | confirmado: aviso da FCC (DA 26-989) e cobertura especializada. Dizemos "TVs e rádios" porque não achei fonte oficial confirmando alerta em celulares | FCC; TV Technology; Wiley |
| Não existe rede elétrica mundial; redes por região, sem ligação entre continentes separados por oceano | conhecimento de referência (há interligações pontuais, ex.: cabos submarinos curtos e conversores; por isso não dizemos "nenhum fio liga dois países") | — |
| Num sistema síncrono, todos os geradores giram na mesma frequência | conhecimento de referência (simplificado como "mesmo ritmo") | — |
| Brasil 60 Hz; Paraguai 50 Hz | confirmado | Itaipu; relatório técnico UFCG |
| Itaipu: 20 unidades, metade em 50 Hz e metade em 60 Hz | confirmado pela Itaipu (um relatório antigo cita 9 + 9 antes das 2 últimas unidades; usamos 10 + 10, a configuração atual) | Itaipu; SEL |
| Apagão de 15/08/2023 começou com a saída de uma linha de 500 kV no Ceará (Quixadá–Fortaleza II) | confirmado (ONS). A causa-raiz foi o controle de tensão de usinas eólicas e solares; dizemos só "uma linha caiu… a falha correu como dominó", sem culpar a fonte de energia | ONS; eixos; Olhar Digital |
| 25 estados + DF afetados; Roraima não, por estar fora do Sistema Interligado Nacional | confirmado (Abradee; Olhar Digital; Folha PE) | Olhar Digital; Folha PE |
| Quebec, 13/03/1989: tempestade geomagnética derrubou a rede em menos de um minuto; mais de 9 h para restabelecer | confirmado pela Hydro-Québec ("menos de um minuto", "mais de nove horas") | Hydro-Québec; Bureau of Meteorology (Austrália) |
| Ejeções do Sol levam de horas a dias para chegar e são observadas antes | conhecimento de referência (Carrington 1859 levou ~17,6 h; o comum é 1–3 dias) | NOAA SWPC (referência) |

**Cortado:**
- Evento Carrington (1859): forte, mas alongava o vídeo.
- Apagão da Península Ibérica (2025): o ENTSO-E fala em "segundos", mas os detalhes divergem entre fontes.
- O post falso com cara de perfil do Google: a origem não foi identificada.

## 6. Critérios de aceite

- Gancho imediato: data, "mundo inteiro sem luz" e "Será verdade?" nos primeiros 8 s, com as luzes do globo apagando.
- Cartão do quadro curto (~2,7 s), depois do gancho.
- As duas origens do boato aparecem e são desmontadas com ✖ antes da pergunta científica.
- A prova fecha a lógica (regra da skill):
  - "Só Roraima ficou com luz → não era ligada → a falha só corre pelos fios".
  - O visual mostra o vão entre Roraima e o resto.
- O medidor do veredito se mexe a cada pista e bate em BOATO no fim.
- Nenhuma imagem, personagem ou estilo dos Simpsons; nenhuma marca de agência ou emissora real.
- Selo ESQUEMA no globo das redes, no mapa do Brasil e na Itaipu.
- Tabela com 14 linhas, frames contíguos de 0 a 3450 e soma exata. `scene-plan.ts` consistente com a tabela.
- Leitura no celular: badges no topo, legenda em ~1418 px, medidor sem cobrir badges.
- Nada foi renderizado, ouvido ou validado nesta fase.

## 7. Pontos fracos (honestos)

- **Prazo:** o boato perde força depois de 17/11. Para valer a pena, o vídeo precisa sair até 15 ou 16/11. O roteiro funciona depois da data porque a pergunta "dá pra apagar o planeta?" continua válida, mas o alcance cai.
- **Mais designs novos que o normal (7):** a folha de design é grande. Se quiser ganhar tempo, simplifico: Itaipu vira só a fila de geradores, sem barragem; o satélite vira ícone 2D.
- **Densidade:** são quatro blocos em 1:55 (origem, redes, apagão real, Sol). Se quiser mais curto, o candidato a corte é o s8 (Itaipu). É a curiosidade mais bonita, mas a menos necessária para o argumento.
- **Simplificações técnicas:**
  - "Giram no mesmo ritmo" simplifica a ideia de frequência síncrona.
  - "Cada região tem a sua" esconde interligações pontuais entre redes vizinhas, por isso não digo "nenhum fio".
  - A causa-raiz de 2023 (controle de tensão das usinas próximas) foi resumida em "a falha correu como dominó".
- **Mapa do Brasil:** precisa de contornos dos estados, que baixo na Fase 2 de uma base aberta. Se não der, uso um mapa simplificado em hexágonos (mais esquemático).
- **Não ouvi nada:** pronúncia de "Quebec" e "hertz" a conferir no TTS.

## Fontes

- Boatos.org — apagão mundial em 17/11/2026: https://www.boatos.org/mundo/apagao-mundial-vai-acontecer-em-17-de-novembro-de-2026.html
- Terra — origem do boato e os Simpsons: https://www.terra.com.br/noticias/mundo/vai-ter-apagao-mundial-no-dia-17-de-novembro-entenda-o-boato-que-comecou-nos-simpsons,980a5e89f1f7d9b4d5caf5d4d53de57161u2wv0x.html
- Imirante: https://imirante.com/noticias/mundo/2026/11/11/apagao-mundial-vai-acontecer-17-novembro-entenda
- DGABC: https://www.dgabc.com.br/Noticia/4367751/vai-ter-apagao-mundial-em-17-de-novembro-entenda-o-boato-sobre-os-simpsons
- Aos Fatos: https://www.aosfatos.org/noticias/defesa-civil-militares-simpsons-apagao-mundial/
- FCC DA 26-989: https://docs.fcc.gov/public/attachments/DA-26-989A1.txt
- TV Technology — teste nacional do EAS: https://www.tvtechnology.com/regulatory-legal/nationwide-emergency-alert-system-test-set-for-november
- Wiley — Nationwide EAS Test 17/11/2026: https://www.wiley.law/alert-Nationwide-EAS-Test-Coming-November-17-2026
- Itaipu (publicação técnica): https://www.itaipu.gov.br/sites/default/files/af_df/1702_022_atualizacao_revista_IB_2017_digital_b.pdf
- SEL — HVDC Itaipu/Ibiúna: https://selinc.com/pt/highlights/furnas-2/
- eixos — relatório do ONS sobre o apagão: https://eixos.com.br/energia-eletrica/relatorio-do-ons-sobre-apagao-confirma-causas-e-pede-centenas-de-correcoes/
- Olhar Digital — Roraima fora do apagão: https://olhardigital.com.br/2023/08/15/pro/roraima-foi-o-unico-estado-nao-afetado-por-apagao-no-brasil-entenda-o-motivo/
- Folha PE — Roraima: https://www.folhape.com.br/economia/roraima-foi-unico-estado-a-escapar-do-apagao-nacional-entenda-o/286193/
- Hydro-Québec — tempestade de março de 1989: https://hydroquebec.com/learning/notions-de-base/tempete-mars-1989.html
- Bureau of Meteorology (Austrália): https://www.sws.bom.gov.au/Educational/1/3/12

# Roteiro v1 — 95% do universo é invisível (e um telescópio está tentando enxergar)

**Status:** AGUARDANDO APROVAÇÃO — implementação e renderização não iniciadas.
**Quadro:** nenhum (vídeo avulso, explicativo — alterna com o Boato ou Verdade).

## 1. Briefing de produção

- **Tema:** o "universo invisível" (matéria escura e energia escura) e o telescópio europeu **Euclid**, que acaba de liberar o primeiro grande pacote de dados (DR1-Foundation, nov/2026: mais de 900 milhões de galáxias).
- **Recorte:** a fatia de 5% que enxergamos; o que é a matéria escura (puxa, não brilha) e a prova das galáxias que giram rápido demais; a energia escura (acelera a expansão); por que o Euclid; o truque da lente gravitacional; o primeiro pacote de dados.
- **Formato:** **pergunta → revelação** com fio condutor visível: uma **pizza do universo** que se revela fatia a fatia (5% → 27% → 68%) e depois um **zoom** da Terra até o Euclid e o mapa de galáxias.
- **Público e objetivo:** leigo. Sair sabendo que quase tudo no universo é invisível, como a gente sabe que existe, e como o Euclid vai mapear.
- **Duração:** **~1:10** (70 s, 2100 frames), dentro da regra nova de 60–75 s. Orçamento: 68 s; a voz real decide.
- **Formato técnico:** 1080 × 1920, 9:16, 30 fps, pt-BR. Timestamps em MM:SS:FF; intervalos [início, fim).
- **Tom:** curioso e de "uau", sem jargão (o termo "lente gravitacional" é explicado antes de ser nomeado).
- **TTS:** edge-tts `pt-BR-AntonioNeural`, rate +4% (cta +0%). ":" vira "," só no texto do TTS. "Euclid" a conferir (pode virar "Êuclid").
- **Paleta da trilha:** `espaco`. O tema da marca toca no gancho ("invisível"), na revelação dos 68% e no fecho do iceberg.
- **Direção de arte:** espaço profundo (estúdio escuro, tinta `#1f1a4d`), estrelas.
  - **Pizza do universo 3D:** disco em 3 fatias (5% dourada luminosa, 27% roxa translúcida, 68% azul escura com brilho fraco), que gira e abre.
  - **Galáxia espiral** girando, com um **halo invisível** que aparece como névoa roxa, e uma versão "sem halo" que se desmancha.
  - **Universo em expansão:** galáxias se afastando, cada vez mais rápido.
  - **Terra** (globo noturno reaproveitado), **Sol** (reaproveitado) e o **Euclid** a 1,5 milhão de km.
  - **Lente gravitacional:** galáxia de fundo cuja imagem fica esticada em arcos quando passa um aglomerado com matéria escura na frente.
  - **Teia cósmica 3D** (filamentos e nós com pontinhos de galáxias) que vai se acendendo: o "mapa".
  - **Iceberg** no fecho: a pontinha clara acima d'água (5%) e o bloco enorme escuro embaixo.
- **Mascote:** flutua no espaço (gancho acena; pula na galáxia que se desmancha; aponta o Euclid; comemora no iceberg).
- **Designs novos (folha de design, 1º passo da Fase 2):**
  1. Telescópio **Euclid** (estilizado: tubo com escudo solar e painel; sem logos).
  2. **Galáxia espiral** (braços de partículas) + halo de matéria escura.
  3. **Pizza do universo** 3D (5/27/68).
  4. **Lente gravitacional** (galáxia de fundo + arcos).
  5. **Teia cósmica** 3D.
  6. **Iceberg** low-poly com mar.
- **Já aprovados:** mascote, globo noturno, Sol.
- **Selo:** "ESQUEMA (fora de escala)" na Terra–Euclid, na lente e na teia; "ILUSTRAÇÃO" na matéria escura (é invisível de verdade — a névoa roxa é só para mostrar onde está).

**O que se constrói:** a pizza do universo se revela fatia a fatia; cada fatia leva a uma prova visual (galáxia que deveria se desmanchar, galáxias se afastando); daí o Euclid sai da Terra até o ponto L2, usa a lente para "ver" o invisível e acende a teia cósmica; fecho no iceberg.

## 2. Tabela cronológica (estimativa até o TTS)

| Timestamp (Início - Fim) | Quadro (Frame Inicial - Final a 30 fps) | Narração (Locução TTS) | Descrição da Cena & Câmera | Props & Elementos 3D/2D | Animações & Transições (Remotion Props / Spring / Interpolate) | Badges & Textos (Highlights) |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00:00 - 00:08:21 | 0 - 261 | Tudo o que você enxerga no universo, estrelas, planetas e galáxias, é só cinco por cento dele. O resto é invisível. | Abertura da fenda no espaço: galáxia espiral, planeta e estrelas brilhando (az 15°, el 10°). Em "cinco por cento", tudo se encolhe para uma fatia dourada de uma pizza; o resto da pizza aparece como contorno tracejado vazio. Em "invisível", punch-in no vazio. | Galáxia, planeta, estrelas, pizza do universo (só a fatia de 5%), mascote flutuando (acena). | `fx.flash(0)`; `mascot.wave(W1)`; `cosmos.shrink` 0→1 (W11–W15); `pie.k5` spring (W13); `pie.outline` (W17); `fx.punch(W20)`. | SÓ 5% É VISÍVEL (atenção, W13) · O RESTO? INVISÍVEL (atenção, grande, W18). Legenda: enxerga, universo, cinco por cento, invisível. |
| 00:08:21 - 00:15:03 | 261 - 453 | Uns vinte e sete por cento são matéria escura. Ela não brilha, mas puxa tudo em volta. | A fatia de 27% aparece roxa translúcida. A câmera vai para uma galáxia: em "puxa", uma névoa roxa (halo) aparece em volta dela, com setas puxando as estrelas para dentro. | Pizza (5% + 27%), galáxia espiral, halo de matéria escura, setas, selo ILUSTRAÇÃO. | `pie.k27` spring (W1); `halo.show` 0→1 (W7–W9); `pull.arrows` spring (W13). | MATÉRIA ESCURA: 27% (info, W1) · NÃO BRILHA, MAS PUXA (info, W10). Legenda: vinte e sete, matéria escura, brilha, puxa. |
| 00:15:03 - 00:19:27 | 453 - 597 | Sem ela, as galáxias giram tão rápido que deveriam se desmanchar. | Tela dividida em 3D: à esquerda a galáxia com halo, inteira, girando; à direita a mesma galáxia sem halo, cujas estrelas da borda escapam pela tangente. O mascote pula. | 2 galáxias, halo (só na esquerda), estrelas escapando. | `split.show` (0); `galaxyB.spin` rápido; `galaxyB.scatter` 0→1 (W6–W10); `mascot.jump(W8)`. | SEM ELA, A GALÁXIA SE DESMANCHA (problema, W8). Legenda: sem ela, giram, rápido, desmanchar. |
| 00:19:27 - 00:27:02 | 597 - 812 | E sessenta e oito por cento é energia escura: algo que faz o universo se expandir cada vez mais rápido. | A pizza completa: a fatia azul de 68% preenche o resto (o maior pedaço). Corte para um aglomerado de galáxias que se afastam umas das outras, com setas que aceleram. | Pizza completa, campo de galáxias se afastando, setas. | `pie.k68` spring (W1); `fx.flash(W3, 6)`; `expand.t` 0→1 (W13–W19, in, aceleração); tema da marca (W3). | ENERGIA ESCURA: 68% (info, grande, W1) · EXPANSÃO ACELERADA (atenção, W15). Legenda: sessenta e oito, energia escura, expandir, mais rápido. |
| 00:27:02 - 00:32:27 | 812 - 987 | Ninguém sabe o que elas são. Por isso, em 2023, a Europa lançou o Euclid. | A pizza gira com um "?" sobre as fatias escuras. Chicote para a Terra: o Euclid sobe de trás do globo, com um rastro de lançamento. | Pizza com "?", globo noturno, Euclid, rastro. | `pie.question` spring (W1); `fx.whipOut/whipIn` (W6); `euclid.launch` 0→1 (W12–W14+15). | NINGUÉM SABE O QUE SÃO (atenção, W1) · EUCLID · LANÇADO EM 2023 (info, W12). Legenda: ninguém sabe, 2023, Europa, Euclid. |
| 00:32:27 - 00:37:28 | 987 - 1138 | Ele fica a um milhão e meio de quilômetros da Terra e vai mapear um terço do céu. | Plano aberto: Sol à esquerda, Terra no meio, Euclid à direita no ponto L2 (linha tracejada com "1,5 milhão de km"). Em "um terço do céu", uma calota luminosa cobre 1/3 de uma esfera celeste em volta. O mascote aponta o Euclid. | Sol, Terra, Euclid, linha de distância, esfera do céu com 1/3 iluminado, selo ESQUEMA. | `distance.line` 0→1 (W3–W8); `sky.third` 0→1 (W13–W17); `mascot.point(W1)`. | 1,5 MILHÃO DE KM DA TERRA (info, W4) · MAPA DE 1/3 DO CÉU (info, W14). Legenda: milhão e meio, Terra, um terço, céu. |
| 00:37:28 - 00:48:11 | 1138 - 1451 | O truque: a matéria escura entorta a luz das galáxias que estão atrás, como uma lente. Medindo essa distorção, dá pra desenhar onde ela está. | Close na lente: uma galáxia de fundo (redondinha); em "entorta", um aglomerado com halo roxo passa na frente e a imagem da galáxia se estica em arcos. Em "Medindo", várias galáxias pequenas ficam levemente esticadas e um contorno roxo do halo é "desenhado" a partir delas. | Galáxia de fundo, aglomerado, halo, arcos, contorno desenhado, selo ESQUEMA. | `lens.pass` 0→1 (W2–W7); `lens.arcs` 0→1 (W5–W9); `lens.field` spring (W16); `halo.trace` 0→1 (W19–W24). | LENTE GRAVITACIONAL (info, W13) · A DISTORÇÃO REVELA A MATÉRIA ESCURA (solução, W19). Legenda: truque, entorta, lente, distorção, desenhar. |
| 00:48:11 - 00:56:21 | 1451 - 1701 | E já saiu o primeiro grande pacote: mais de novecentos milhões de galáxias, pra montar o mapa 3D do universo invisível. | A câmera recua do Euclid e entra numa teia cósmica 3D: filamentos e nós acendem como uma rede de luzes. Contador 2D sobe até 900 milhões. | Teia cósmica, contador 2D. | `web.light` 0→1 (W2–W12); `counter` 0→900 (W7–W12); câmera orbita a teia. | 1º PACOTE DE DADOS (info, W4) · +900 MILHÕES DE GALÁXIAS (solução, W9). Legenda: primeiro pacote, novecentos milhões, mapa 3D, invisível. |
| 00:56:21 - 01:10:00 | 1701 - 2100 | Pronto: agora você sabe. O universo que a gente vê é só a pontinha do iceberg. | Corte para o iceberg no mar escuro: a pontinha clara acima d'água (rótulo 5%) e o bloco enorme abaixo, escuro e roxo/azul (95%). A câmera desce da ponta para baixo d'água revelando o tamanho. O mascote comemora e acena. Encerramento fixo da marca na sequência. | Iceberg, mar, rótulos 5% / 95%, mascote. | `iceberg.show` (W0); câmera desce (W4–W15); `label.5` (W11); `label.95` (W14); `mascot.cheer(W1)`; `mascot.wave(W13)`. | SÓ A PONTINHA: 5% (solução, W11). Legenda: pronto, universo, vê, pontinha, iceberg. |

**Soma:** 261 + 192 + 144 + 215 + 175 + 151 + 313 + 250 + 399 = 2100 frames (70 s), incluindo ~5,5 s do encerramento fixo.

## 3. State / Props

Ver `scene-plan.ts` (9 cenas, 2100 frames), mesmo motor dos vídeos anteriores. Linha do tempo determinística.

## 4. Áudio e montagem

**Narração integral (164 palavras):**

Tudo o que você enxerga no universo, estrelas, planetas e galáxias, é só cinco por cento dele. O resto é invisível. Uns vinte e sete por cento são matéria escura. Ela não brilha, mas puxa tudo em volta. Sem ela, as galáxias giram tão rápido que deveriam se desmanchar. E sessenta e oito por cento é energia escura: algo que faz o universo se expandir cada vez mais rápido. Ninguém sabe o que elas são. Por isso, em 2023, a Europa lançou o Euclid. Ele fica a um milhão e meio de quilômetros da Terra e vai mapear um terço do céu. O truque: a matéria escura entorta a luz das galáxias que estão atrás, como uma lente. Medindo essa distorção, dá pra desenhar onde ela está. E já saiu o primeiro grande pacote: mais de novecentos milhões de galáxias, pra montar o mapa 3D do universo invisível. Pronto: agora você sabe. O universo que a gente vê é só a pontinha do iceberg.

**Encerramento fixo:** "Comenta o tema do próximo vídeo, segue a Fenda Umbra e compartilha!"

**Efeitos:** reaproveitados (fenda-open/close, whoosh, shimmer, glow, ding, pop, thud, final, rumble-soft, solar-whoosh); novos: `launch` (foguete subindo, sopro grave), `warp` (luz entortando, glissando suave), `ocean` (mar calmo, já existe `ocean-amb`).

**Trilha:** paleta `espaco`. INTENTS: curious, tense, tense, reveal, curious, build, curious, reveal, resolve.

## 5. Verificação de fatos

| Afirmação | Situação | Fonte |
| --- | --- | --- |
| Matéria comum ~5%, matéria escura ~27%, energia escura ~68% | consenso do modelo padrão (Planck 2018: 4,9 / 26,8 / 68,3%) — arredondado | ESA/Planck; Wikipedia (Lambda-CDM) |
| A matéria escura não emite luz, mas tem gravidade | consenso | ESA; NASA |
| Galáxias giram rápido demais para a massa visível (curvas de rotação) | consenso; simplificado em "deveriam se desmanchar" | NASA; Rubin & Ford (1970s) |
| A energia escura acelera a expansão | consenso (descoberta de 1998, Nobel 2011) | Nobel Prize |
| Euclid lançado em 1/7/2023 (Falcon 9), missão da Agência Espacial Europeia | confirmado. Dizemos "a Europa lançou" (a ESA, com foguete americano) | CNES; NASASpaceflight; Wikipedia |
| Fica no ponto L2, ~1,5 milhão de km da Terra | confirmado | ESA; Wikipedia |
| Vai mapear cerca de um terço do céu | confirmado em material da ESA (~14.000 graus²) | ESA fact sheet |
| Usa a distorção da luz (lente gravitacional fraca) para mapear a matéria escura | confirmado (Reuters cita lente gravitacional como ferramenta) | Reuters; ESA |
| Primeiro grande pacote (DR1-Foundation, nov/2026): +900 milhões de galáxias, espectros de +160 milhões de fontes, 1.900 graus² | confirmado | Phys.org; MPG; Dawn |
| O mapa 3D ainda vai ser montado (resultados sobre matéria/energia escura em 2027) | confirmado — por isso dizemos "pra montar o mapa", não "o mapa está pronto" | Phys.org; MPG |

## 6. Critérios de aceite

- Gancho em 3 s: "só 5% do universo é visível".
- A pizza mantém proporções certas (5/27/68).
- Cada fatia ganha uma prova visual; a lente fecha a lógica (a distorção revela onde está a matéria escura).
- Nada de dizer que o mapa está pronto.
- Duração 60–75 s; tabela com 9 linhas e soma exata.
- Selos ESQUEMA/ILUSTRAÇÃO onde o visual é inventado (a matéria escura não se vê).
- Nada foi renderizado, ouvido ou validado nesta fase.

## 7. Pontos fracos (honestos)

- **Tema abstrato:** é o mais "conceitual" dos vídeos até agora. O que segura é o gancho dos 5% e o iceberg no fim; se a retenção cair, é aqui.
- **"A Europa lançou":** simplificação — a missão é da ESA (com participação da NASA) e subiu num foguete da SpaceX.
- **Visual da matéria escura:** névoa roxa é licença artística (por isso o selo ILUSTRAÇÃO).
- **6 designs novos** (Euclid, galáxia, pizza, lente, teia, iceberg): é a parte que mais toma tempo.
- **Não ouvi nada:** pronúncia de "Euclid" a conferir.

## Fontes

- Phys.org — Euclid offers best-ever 3D map of the universe to date: https://phys.org/news/2026-11-euclid-3d-universe-date.html
- MPG — Euclid lays the foundation for its best-ever 3D map: https://www.mpg.de/27073683/euclid-lays-the-foundation-for-its-best-ever-3d-map-of-the-universe
- Dawn — ESA's Euclid telescope maps over 900 million galaxies: https://www.dawn.com/news/2044208/esas-euclid-telescope-maps-over-900-million-galaxies
- ESA — Euclid fact sheet: https://sci.esa.int/web/euclid/-/fact-sheet
- CNES — Euclid: https://cnes.fr/en/projects/euclid
- NASASpaceflight — Euclid launch: https://www.nasaspaceflight.com/2023/07/euclid-launch/
- Wikipedia — Euclid (spacecraft): https://en.wikipedia.org/wiki/Euclid_(spacecraft)
